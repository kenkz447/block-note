import { LocalDocData, Entry, AppRxDatabase, debounce } from '@writefy/client-shared';
import { DocSource } from '@blocksuite/sync';
import { RxCollection, RxDocument, RxDocumentData, RxLocalDocument } from 'rxdb';
import { diffUpdate, encodeStateVectorFromUpdate, mergeUpdates } from 'yjs';
import { getDownloadURL, getStorage, ref, uploadBytes } from '@firebase/storage';

export class RemoteDocSource implements DocSource {

    debouncePushMap = new Map<string, (doc: RxDocument<Entry>, localDocData: LocalDocData) => Promise<void>>();

    name = 'rxdb-local';
    mergeCount = 1;
    constructor(readonly db: AppRxDatabase) {
    }

    private _getEntryStore = () => {
        const docStore = this.db.collections.entries as RxCollection<Entry>;
        if (!docStore) {
            throw new Error('Entries collection not found in database');
        }

        return docStore;
    };

    private _downLoadContent = async (doc: RxDocumentData<Entry>) => {
        console.debug('Downloading content', doc.id);
        const storage = getStorage();
        const docRef = ref(storage, `docs/${doc.workspaceId}/${doc.projectId}/${doc.id}`);
        const downloadUrl = await getDownloadURL(docRef);
        const response = await fetch(downloadUrl);
        const buffer = await response.arrayBuffer();
        console.debug('Downloaded content', doc.id);
        return new Uint8Array(buffer);
    };

    private _uploadContent = async (doc: RxDocument<Entry>, update: Uint8Array) => {
        console.debug('Uploading content', doc.id);
        const storage = getStorage();
        const docRef = ref(storage, `docs/${doc.workspaceId}/${doc.projectId}/${doc.id}`);
        await uploadBytes(docRef, update);
        console.debug('Uploaded content', doc.id);
    };

    async pull(docId: string, state: Uint8Array): Promise<{ data: Uint8Array; state?: Uint8Array | undefined; } | null> {
        try {
            const store = this._getEntryStore();
            const localDoc = await store.getLocal(docId);

            let latest = localDoc?._data.data.latest;

            if (!localDoc) {
                const doc = await store.findOne(docId).exec();
                if (doc) {
                    latest = await this._downLoadContent(doc._data);
                }
            }

            if (!latest) {
                return null;
            }

            const update = mergeUpdates([Uint8Array.from(latest)]);
            const diff = state.length ? diffUpdate(update, state) : update;

            return { data: diff, state: encodeStateVectorFromUpdate(update) };
        } catch (error) {
            console.error('Failed to pull doc', error);
            return null;
        }
    }

    async push(docId: string, currentUpdate: Uint8Array): Promise<void> {
        try {
            let store: RxCollection | null = null;
            let localDoc: RxLocalDocument<Entry, LocalDocData> | null = null;

            store = this._getEntryStore();
            localDoc = await store.getLocal(docId);

            const rows = [];
            if (localDoc?._data.data.latest) {
                rows.push(localDoc._data.data.latest);
            }
            rows.push(currentUpdate);

            const merged = mergeUpdates(rows.map((row) => Uint8Array.from(row)));

            const update: LocalDocData = {
                timestamp: Date.now(),
                latest: Array.from(merged),
                update: Array.from(currentUpdate)
            };

            if (docId.startsWith('local:')) {
                await store.upsertLocal(docId, update);
            }

            const doc = await store.findOne(docId).exec();
            if (!doc) {
                return;
            }

            let debounceUpdate = this.debouncePushMap.get(docId);
            if (!debounceUpdate) {
                debounceUpdate = debounce(async (doc: RxDocument<Entry>, localDocData: LocalDocData) => {
                    await store.upsertLocal(docId, localDocData);

                    await this._uploadContent(doc, Uint8Array.from(merged));

                    const latestDoc = await store.findOne(docId).exec();
                    await latestDoc.update({
                        $set: {
                            contentTimestamp: localDocData.timestamp
                        }
                    });
                    console.debug('Entry updated', docId);
                }, 1000);
                this.debouncePushMap.set(docId, debounceUpdate);
            }

            await debounceUpdate(doc, update);

        } catch (error) {
            console.error('Failed to push doc', error);
        }
    }

    subscribe() {
        return () => { };
    }
}
