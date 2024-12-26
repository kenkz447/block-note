import { Entry, AppRxDatabase } from '@writefy/client-shared';
import { DocSource } from '@blocksuite/sync';
import { RxCollection, RxDocumentData } from 'rxdb';
import { getDownloadURL, getStorage, ref } from '@firebase/storage';

export class StorageDocSource implements DocSource {
    name = StorageDocSource.name;
    urlMap = new Map<string, string>();

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
        const downloadUrl = this.urlMap.get(doc.id) ?? await getDownloadURL(docRef);
        this.urlMap.set(doc.id, downloadUrl);

        const response = await fetch(downloadUrl);
        const buffer = await response.arrayBuffer();
        return new Uint8Array(buffer);
    };

    async pull() {
        return null;
    }

    async push(): Promise<void> {
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
