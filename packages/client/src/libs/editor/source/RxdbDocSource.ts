import { LocalDoc, Entry, AppRxDatabase } from '@/libs/rxdb';
import { DocSource } from '@blocksuite/sync';
import { RxCollection, RxDocument } from 'rxdb';
import { diffUpdate, encodeStateVectorFromUpdate, mergeUpdates } from 'yjs';

type UpdateMessage = {
    timestamp: number;
    update: Uint8Array;
};

export class RxdbDocSource implements DocSource {
    mergeCount = 1;

    name = 'rxdb';

    constructor(readonly db: AppRxDatabase) { }

    getLocalStore() {
        const docStore = this.db.collections.localDocs as RxCollection<LocalDoc>;
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
            let doc: RxDocument<Entry> | RxDocument<LocalDoc> | null = null;

            if (docId.startsWith('local:')) {
                store = this.getLocalStore();
                doc = await store.findOne(docId).exec();
            }
            else {
                store = this.getEntryStore();
                doc = await store.findOne(docId).exec();
            }

            if (!doc || !doc._data.updates) {
                return null;
            }

            const { updates } = doc._data;
            const update = mergeUpdates(updates.map(({ update }) => Uint8Array.from(update)));

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
            let doc: RxDocument<Entry> | RxDocument<LocalDoc> | null = null;

            if (docId.startsWith('local:')) {
                store = this.getLocalStore();
                doc = await store.findOne(docId).exec();
            }
            else {
                store = this.getEntryStore();
                doc = await store.findOne(docId).exec();
            }

            const updates = doc?._data.updates ?? [];

            let rows: UpdateMessage[] = [
                ...updates.map(({ timestamp, update }) => ({
                    timestamp,
                    update: Uint8Array.from(update),
                })),
                { timestamp: Date.now(), update: data },
            ];

            if (this.mergeCount && rows.length >= this.mergeCount) {
                const merged = mergeUpdates(rows.map(({ update }) => update));
                rows = [{ timestamp: Date.now(), update: merged }];
            }

            if (doc) {
                await doc.update({
                    $set: {
                        updates: rows.map(({ timestamp, update }) => ({
                            timestamp,
                            update: Array.from(update),
                        })),
                    }
                });
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
