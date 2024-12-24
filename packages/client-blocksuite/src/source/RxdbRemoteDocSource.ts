import { LocalDoc, Entry, AppRxDatabase, debounce } from '@writefy/client-shared';
import { DocSource } from '@blocksuite/sync';
import { RxCollection, RxDocument, RxDocumentData, RxLocalDocument } from 'rxdb';
import { diffUpdate, encodeStateVectorFromUpdate, mergeUpdates } from 'yjs';
import { getDownloadURL, getStorage, ref, uploadBytes } from '@firebase/storage';

type UpdateMessage = {
    timestamp: number;
    update: Uint8Array;
};

export class RxdbRemoteDocSource implements DocSource {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debouncePushMap = new Map<string, (...args: any) => Promise<void>>();

    name = 'rxdb-remote';

    constructor(readonly db: AppRxDatabase) { }

    private _getEntryStore() {
        const docStore = this.db.collections.entries as RxCollection<Entry>;
        if (!docStore) {
            throw new Error('Entries collection not found in database');
        }

        return docStore;
    }

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

            if (!localDoc) {
                return null;
            }

            const update = mergeUpdates([Uint8Array.from(localDoc._data.data.update)]);
            const diff = state.length ? diffUpdate(update, state) : update;

            return { data: diff, state: encodeStateVectorFromUpdate(update) };
        } catch (error) {
            console.error('Failed to pull doc', error);
            return null;
        }
    }

    async push(docId: string, data: Uint8Array): Promise<void> {
        try {
            const isEmpty = data.length === 0 || data.length === 1 && data[0] === 0;
            if (isEmpty) {
                return;
            }

            let store: RxCollection | null = null;
            let localDoc: RxLocalDocument<Entry, LocalDoc> | null = null;

            store = this._getEntryStore();
            localDoc = await store.getLocal(docId);
            if (!localDoc) {
                return void await store.upsertLocal(docId, { update: Array.from(data), timestamp: Date.now() });
            }

            const merged = mergeUpdates([
                Uint8Array.from(localDoc?._data.data.update ?? [0]),
                data
            ]);

            const update = {
                timestamp: Date.now(),
                update: Array.from(merged),
            };

            await store.upsertLocal(docId, update);

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
                debounceUpdate = debounce(async (doc: RxDocument<Entry>, update: UpdateMessage) => {
                    await this._uploadContent(doc, Uint8Array.from(update.update));
                    await doc.update({
                        $set: {
                            contentTimestamp: update.timestamp,
                        }
                    });
                }, 1000);
                this.debouncePushMap.set(docId, debounceUpdate);
            }

            await debounceUpdate(doc, update);
        } catch (error) {
            console.error('Failed to push doc', error);
        }
    }

    subscribe(cb: (docId: string, data: Uint8Array) => void) {
        /**
         * Subscribe to the db update event to update the document
         */
        const store = this._getEntryStore();

        const sub = store.update$.subscribe(async (changeEvent) => {
            const { documentData, documentId, isLocal } = changeEvent;

            if (isLocal) {
                return;
            }

            const localDoc = await store.getLocal<UpdateMessage>(documentId);

            if (localDoc && localDoc?._data.data.timestamp === (documentData.contentTimestamp ?? 0)) {
                return;
            }

            const remoteUpdate = await this._downLoadContent(documentData);

            const merged = mergeUpdates([
                Uint8Array.from(localDoc?._data.data.update ?? [0]),
                remoteUpdate
            ]);

            cb(documentId, merged);
        });

        return () => {
            sub.unsubscribe();
        };
    }
}
