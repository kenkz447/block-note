import { Entry, AppRxDatabase } from '@writefy/client-shared';
import { DocSource } from '@blocksuite/sync';
import { RxCollection, RxDocument, RxDocumentData } from 'rxdb';
import { diffUpdate, encodeStateVectorFromUpdate, mergeUpdates } from 'yjs';
import { getDownloadURL, getStorage, ref, uploadBytes } from '@firebase/storage';

export class StorageDocSource implements DocSource {
    name = StorageDocSource.name;

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
        if (docId.startsWith('local:')) {
            return null;
        }

        try {
            const store = this._getEntryStore();
            const localDoc = await store.getLocal(docId);
            const doc = await store.findOne(docId).exec();
            if (!doc) {
                return null;
            }

            let latest = localDoc?._data.data.latest;

            if (!localDoc || localDoc._data.data.timestamp !== doc.contentTimestamp) {
                try {
                    const remoteContent = await this._downLoadContent(doc._data);
                    latest = Array.from(remoteContent);
                } catch (error) {
                    console.error('Failed to download doc', error);
                    return null;
                }
            }

            if (!latest) {
                return null;
            }

            const merged = mergeUpdates([Uint8Array.from(latest)]);
            const diff = state.length ? diffUpdate(merged, state) : merged;

            return { data: diff, state: encodeStateVectorFromUpdate(merged) };
        } catch (error) {
            console.error('Failed to pull doc', error);
            return null;
        }
    }

    async push(docId: string, currentUpdate: Uint8Array): Promise<void> {
        if (docId.startsWith('local:')) {
            return;
        }

        try {
            const store = this._getEntryStore();
            const localDoc = await store.getLocal(docId);

            if (!localDoc) {
                return;
            }

            const merged = mergeUpdates([
                Uint8Array.from(localDoc?._data.data.latest ?? [0]),
                currentUpdate
            ]);

            const doc = await store.findOne(docId).exec();
            this._uploadContent(doc!, Uint8Array.from(merged));
        } catch (error) {
            console.error('Failed to push doc', error);
        }
    }

    subscribe(cb: (docId: string, data: Uint8Array) => void) {
        const store = this._getEntryStore();

        const storeUpdateSub = store.update$.subscribe(async (changeEvent) => {
            const { documentId, isLocal } = changeEvent;
            if (isLocal) {
                return;
            }

            const doc = await store.findOne(documentId).exec();
            if (!doc || !doc.contentTimestamp) {
                return;
            }

            let localDoc = await store.getLocal(documentId);
            if (!localDoc) {
                return;
            }

            if (localDoc._data.data.timestamp === doc.contentTimestamp) {
                return;
            }

            try {
                const latest = await this._downLoadContent(doc._data);
                localDoc = await store.getLocal(documentId);

                const merge = mergeUpdates([
                    Uint8Array.from(localDoc?._data.data.latest ?? [0]),
                    Uint8Array.from(latest)
                ]);

                cb(documentId, merge);
            } catch (error) {
                console.error('Failed to upload doc to storage', error);
            }
        });

        return () => {
            storeUpdateSub.unsubscribe();
        };
    }
}
