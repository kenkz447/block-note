import { Entry, AppRxDatabase } from '@writefy/client-shared';
import { DocSource } from '@blocksuite/sync';
import { RxCollection, RxDocumentData } from 'rxdb';
import { diffUpdate, encodeStateVectorFromUpdate, mergeUpdates } from 'yjs';
import { getDownloadURL, getStorage, ref } from '@firebase/storage';

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

    async push(): Promise<void> {
    }

    subscribe() {
        return () => {
        };
    }
}
