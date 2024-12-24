import { LocalDoc, Entry, AppRxDatabase, debounce } from '@writefy/client-shared';
import { DocSource } from '@blocksuite/sync';
import { RxCollection, RxDocument, RxLocalDocument } from 'rxdb';
import { diffUpdate, encodeStateVectorFromUpdate, mergeUpdates } from 'yjs';

type UpdateMessage = {
    timestamp: number;
    update: Uint8Array;
};

export class RxdbDocSource implements DocSource {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debouncePushMap = new Map<string, (...args: any) => Promise<void>>();

    name = 'rxdb';

    constructor(readonly db: AppRxDatabase) { }

    getEntryStore() {
        const docStore = this.db.collections.entries as RxCollection<Entry>;
        if (!docStore) {
            throw new Error('Entries collection not found in database');
        }

        return docStore;
    }

    async pull(
        docId: string,
        state: Uint8Array
    ): Promise<{ data: Uint8Array; state?: Uint8Array | undefined; } | null> {
        try {

            let store: RxCollection | null = null;
            let doc: RxLocalDocument<Entry, LocalDoc> | null = null;

            store = this.getEntryStore();
            doc = await store.getLocal(docId);

            if (!doc) {
                return null;
            }

            const update = mergeUpdates([Uint8Array.from(doc._data.data.update)]);
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

            store = this.getEntryStore();
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
                debounceUpdate = debounce(async (doc: RxDocument, update: UpdateMessage) => {
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
        const entriesStore = this.getEntryStore();

        const sub = entriesStore.update$.subscribe(async (changeEvent) => {
            const { documentData, documentId } = changeEvent;

            const localDoc = await entriesStore.getLocal(documentId);
            if (!localDoc) {
                return;
            }

            if (localDoc._data.data.timestamp === documentData.contentTimestamp) {
                return;
            }

            cb(documentId, new Uint8Array(localDoc._data.data.update));
        });

        return () => {
            sub.unsubscribe();
        };
    }
}
