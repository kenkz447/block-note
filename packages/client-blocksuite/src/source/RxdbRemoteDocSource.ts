import { LocalDoc, Entry, AppRxDatabase, debounce } from '@writefy/client-shared';
import { DocSource } from '@blocksuite/sync';
import { RxCollection, RxDocument, RxLocalDocument, RxLocalDocumentData } from 'rxdb';
import { diffUpdate, encodeStateVectorFromUpdate, mergeUpdates } from 'yjs';
import { getStorage, ref, uploadBytes } from '@firebase/storage';
import { getDatabase, ref as realtimeRef, set } from 'firebase/database';

export class RxdbRemoteDocSource implements DocSource {
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
            const store = this._getEntryStore();
            const localDoc = await store.getLocal(docId);

            const latestContent = localDoc?._data.data.latest;

            if (!latestContent) {
                return null;
            }

            const merged = mergeUpdates([Uint8Array.from(latestContent)]);
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
                await store.upsertLocal(
                    docId,
                    {
                        timestamp: Date.now(),
                        latest: Array.from(currentUpdate),
                        update: Array.from(currentUpdate),
                    } as LocalDoc
                );
                return;
            }

            const merged = mergeUpdates([
                Uint8Array.from(localDoc?._data.data.latest ?? [0]),
                currentUpdate
            ]);

            const nextContent: LocalDoc = {
                timestamp: Date.now(),
                latest: Array.from(merged),
                update: Array.from(currentUpdate),
            };

            await store.upsertLocal(docId, nextContent);
        } catch (error) {
            console.error('Failed to push doc', error);
        }
    }

    subscribe() {
        const store = this._getEntryStore();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const debouncePushMap = new Map<string, (...args: any) => Promise<void>>();

        const sub = store.update$.subscribe(async (changeEvent) => {
            const { documentData, documentId, isLocal } = changeEvent;
            if (!isLocal) {
                return;
            }

            const localDoc = (documentData as unknown as RxLocalDocumentData<LocalDoc>).data;
            const doc = await store.findOne(documentId).exec();
            if (!doc) {
                return;
            }

            const needUpdate = localDoc.timestamp !== doc.contentTimestamp;
            if (!needUpdate) {
                return;
            }

            let debounceUpdate = debouncePushMap.get(documentId);
            if (!debounceUpdate) {
                debounceUpdate = debounce(async (localDoc: LocalDoc) => {
                    await this._uploadContent(doc, Uint8Array.from(localDoc.update));
                    await doc.update({
                        $set: {
                            contentTimestamp: localDoc.timestamp,
                        }
                    });
                }, 1000);
                debouncePushMap.set(documentId, debounceUpdate);
            }

            await debounceUpdate(localDoc);
            await this._updateRemote(doc, Uint8Array.from(localDoc.update));
        });

        return () => {
            sub.unsubscribe();
        };
    }
}
