import { Entry, AppRxDatabase, LocalDocData } from '@writefy/client-shared';
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
        console.debug('Downloading content', doc.id);
        const storage = getStorage();
        const docRef = ref(storage, `docs/${doc.workspaceId}/${doc.projectId}/${doc.id}`);
        const downloadUrl = this.urlMap.get(doc.id) ?? await getDownloadURL(docRef);
        this.urlMap.set(doc.id, downloadUrl);

        const response = await fetch(downloadUrl);
        const buffer = await response.arrayBuffer();
        console.debug('Downloaded content', doc.id);
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
            const { documentData, documentId, isLocal, } = changeEvent;
            if (isLocal) {
                return;
            }
            const localDoc = await store.getLocal(documentId);
            if (!localDoc) {
                return;
            }

            if (localDoc._data.data.timestamp === documentData.contentTimestamp) {
                return;
            }

            console.debug('Content update detected', documentId);

            try {
                const latest = await this._downLoadContent(documentData);
                await store.upsertLocal(documentId, {
                    timestamp: documentData.contentTimestamp,
                    latest: Array.from(latest),
                    update: [],
                } as LocalDocData);

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
