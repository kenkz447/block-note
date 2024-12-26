import { Entry, AppRxDatabase } from '@writefy/client-shared';
import { DocSource } from '@blocksuite/sync';
import { RxCollection, RxDocument, RxDocumentData } from 'rxdb';
import { mergeUpdates } from 'yjs';
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

    async pull() {
        return null;
    }

    async push(docId: string, currentUpdate: Uint8Array): Promise<void> {
        if (docId.startsWith('local:')) {
            return;
        }

        try {
            const store = this._getEntryStore();
            const localDoc = await store.getLocal(docId);
            const doc = await store.findOne(docId).exec();

            if (!localDoc || !doc) {
                return;
            }

            const rows = [];
            if (localDoc?._data.data.latest) {
                rows.push(localDoc._data.data.latest);
            }
            rows.push(currentUpdate);

            const merged = mergeUpdates(rows.map((row) => Uint8Array.from(row)));

            this._uploadContent(doc, Uint8Array.from(merged));
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

            const localDoc = await store.getLocal(documentId);
            if (!localDoc) {
                return;
            }

            if (localDoc._data.data.timestamp === doc.contentTimestamp) {
                return;
            }

            try {
                const latest = await this._downLoadContent(doc._data);
                cb(documentId, latest);
            } catch (error) {
                console.error('Failed to upload doc to storage', error);
            }
        });

        return () => {
            storeUpdateSub.unsubscribe();
        };
    }
}
