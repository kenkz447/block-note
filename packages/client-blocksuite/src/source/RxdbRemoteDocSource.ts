import { LocalDoc, Entry, AppRxDatabase, debounce } from '@writefy/client-shared';
import { DocSource } from '@blocksuite/sync';
import { RxCollection, RxDocument, RxDocumentData, RxLocalDocument } from 'rxdb';
import { diffUpdate, encodeStateVectorFromUpdate, mergeUpdates } from 'yjs';
import { getDownloadURL, getStorage, ref, uploadBytes } from '@firebase/storage';
import { getDatabase, onValue, ref as realtimeRef, set } from 'firebase/database';

type UpdateMessage = {
    timestamp: number;
    update: Uint8Array;
};

export class RxdbRemoteDocSource implements DocSource {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debouncePushMap = new Map<string, (...args: any) => Promise<void>>();

    name = 'rxdb-remote';

    constructor(readonly db: AppRxDatabase, readonly messageChannel: string) { }

    private _getEntryStore() {
        const docStore = this.db.collections.entries as RxCollection<Entry>;
        if (!docStore) {
            throw new Error('Entries collection not found in database');
        }

        return docStore;
    }

    private _updateRemote = async (doc: RxDocument<Entry>, update: Uint8Array) => {
        const realtimeDb = getDatabase();
        const docRef = realtimeRef(realtimeDb, `${this.messageChannel}/${doc.id}`);
        set(docRef, Array.from(update));
    };

    private _downLoadContent = async (doc: RxDocumentData<Entry>) => {
        const storage = getStorage();
        const docRef = ref(storage, `docs/${doc.workspaceId}/${doc.projectId}/${doc.id}`);
        const downloadUrl = await getDownloadURL(docRef);
        const response = await fetch(downloadUrl);
        const buffer = await response.arrayBuffer();
        return new Uint8Array(buffer);
    };

    private _uploadContent = async (doc: RxDocument<Entry>, update: Uint8Array) => {
        const storage = getStorage();
        const docRef = ref(storage, `docs/${doc.workspaceId}/${doc.projectId}/${doc.id}`);
        await uploadBytes(docRef, update);
    };

    async pull(
        docId: string,
        state: Uint8Array
    ): Promise<{ data: Uint8Array; state?: Uint8Array | undefined; } | null> {
        try {
            let store: RxCollection | null = null;
            let localDoc: RxLocalDocument<Entry, LocalDoc> | null = null;

            store = this._getEntryStore();
            localDoc = await store.getLocal(docId);

            let update = localDoc?._data.data.update;

            if (!localDoc) {
                if (docId.startsWith('local:')) {
                    return null;
                }

                const doc = await store.findOne(docId).exec();
                update = Array.from(await this._downLoadContent(doc));
            }

            if (!update) {
                return null;
            }

            const merged = mergeUpdates([Uint8Array.from(update)]);
            const diff = state.length ? diffUpdate(merged, state) : merged;

            return { data: diff, state: encodeStateVectorFromUpdate(merged) };
        } catch (error) {
            console.error('Failed to pull doc', error);
            return null;
        }
    }

    async push(docId: string, currentUpdate: Uint8Array): Promise<void> {
        try {
            let store: RxCollection | null = null;
            let localDoc: RxLocalDocument<Entry, LocalDoc> | null = null;

            store = this._getEntryStore();
            localDoc = await store.getLocal(docId);
            if (!localDoc) {
                return void await store.upsertLocal(docId, { update: Array.from(currentUpdate), timestamp: Date.now() });
            }

            const merged = mergeUpdates([
                Uint8Array.from(localDoc?._data.data.update ?? [0]),
                currentUpdate
            ]);

            const content = {
                timestamp: Date.now(),
                update: Array.from(merged),
            };

            await store.upsertLocal(docId, content);

            if (docId.startsWith('local')) {
                return;
            }

            const doc = await store.findOne(docId).exec();
            if (!doc) {
                return;
            }

            // Use debounce to reduce the number of updates
            // to the local and remote db
            let debounceUpdate = this.debouncePushMap.get(docId);
            if (!debounceUpdate) {
                debounceUpdate = debounce(async (doc: RxDocument<Entry>, content: UpdateMessage, update: Uint8Array) => {
                    await this._uploadContent(doc, Uint8Array.from(content.update));
                    await this._updateRemote(doc, Uint8Array.from(update));
                    await doc.update({
                        $set: {
                            contentTimestamp: content.timestamp,
                        }
                    });
                }, 1000);
                this.debouncePushMap.set(docId, debounceUpdate);
            }

            await debounceUpdate(doc, content, currentUpdate);
        } catch (error) {
            console.error('Failed to push doc', error);
        }
    }

    subscribe(cb: (docId: string, data: Uint8Array) => void) {
        /**
         * Subscribe to the db update event to update the document
         */
        const realtimeDb = getDatabase();
        const store = this._getEntryStore();

        const unsubscribes: Map<string, ReturnType<typeof onValue>> = new Map();

        const storeSub = store.find().$.subscribe(async (docs) => {
            for (const doc of docs) {
                const existingUnsubscribe = unsubscribes.get(doc.id);
                if (existingUnsubscribe) {
                    return;
                }

                const docRef = realtimeRef(realtimeDb, `${this.messageChannel}/${doc.id}`);
                const unsubscribe = onValue(docRef, async (snapshot) => {
                    const update = snapshot.val();
                    if (!update) {
                        return;
                    }

                    cb(doc.id, Uint8Array.from(update));
                });

                unsubscribes.set(doc.id, unsubscribe);
            }
        });

        return () => {
            storeSub.unsubscribe();
            unsubscribes.forEach((unsubscribe) => unsubscribe());
        };
    }
}
