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

    mergeCount = 1;

    name = 'rxdb';

    constructor(readonly db: AppRxDatabase) { }

    getLocalStore() {
        const docStore = this.db.collections.local_docs as RxCollection<LocalDoc>;
        if (!docStore) {
            throw new Error('Docs collection not found in database');
        }

        return docStore;
    }

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

            const update = Uint8Array.from(doc._data.data.update);
            const diff = state.length ? diffUpdate(update, state) : update;

            return { data: diff, state: encodeStateVectorFromUpdate(update) };
        } catch (error) {
            console.error('Error pulling data from database', error);
        }

        return null;
    }

    async push(docId: string, data: Uint8Array): Promise<void> {
        try {
            let store: RxCollection | null = null;
            let doc: RxLocalDocument<Entry, LocalDoc> | null = null;

            store = this.getEntryStore();
            doc = await store.getLocal(docId);

            const merged = mergeUpdates([
                Uint8Array.from(data),
                data
            ]);

            const update = {
                timestamp: Date.now(),
                update: Array.from(merged),
            };

            await store.upsertLocal(docId, update);

            return;

            if (doc) {
                // Use debounce to reduce the number of updates
                // to the local and remote db
                let debounceUpdate = this.debouncePushMap.get(docId);
                if (!debounceUpdate) {
                    debounceUpdate = debounce(async (doc: RxDocument, rows: UpdateMessage[]) => {
                        await doc.update({
                            $set: {
                                updates: rows.map(({ timestamp, update }) => ({
                                    timestamp,
                                    update: Array.from(update),
                                })),
                            }
                        });
                    }, 1000);
                    this.debouncePushMap.set(docId, debounceUpdate);
                }

                await debounceUpdate(doc, rows);
            }
            else {
                /**
                 * Insert the document if it doesn't exist
                 * This is the case when the document is a localDoc
                 */
                await store.insert({
                    id: docId,
                    updates: rows.map(({ timestamp, update }) => ({
                        timestamp,
                        update: Array.from(update),
                    }),
                    ),
                });
            }
        } catch (error) {
            console.error('Error pushing data to database', error);
        }
    }

    subscribe(cb: (docId: string, data: Uint8Array) => void) {
        /**
         * Subscribe to the db update event to update the document
         */
        const entriesStore = this.getEntryStore();

        const sub = entriesStore.update$.subscribe((changeEvent) => {
            const { documentData, documentId } = changeEvent;
            if (documentData.type !== 'document') {
                return;
            }

            const entryUpdates = documentData.updates ?? [];
            const docUpdate = entryUpdates[0]?.update ?? [];

            cb(documentId, new Uint8Array(docUpdate));
        });

        return () => {
            sub.unsubscribe();
        };
    }
}
