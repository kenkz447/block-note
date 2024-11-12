import { Doc, Entry } from '@/libs/rxdb';
import { DocSource } from '@blocksuite/sync';
import { RxCollection, RxDatabase } from 'rxdb';
import { diffUpdate, encodeStateVectorFromUpdate, mergeUpdates } from 'yjs';

export const dbVersion = 1;
export const DEFAULT_DB_NAME = 'blocksuite-local';

type UpdateMessage = {
    timestamp: number;
    update: Uint8Array;
};

export class RxdbDocSource implements DocSource {
    mergeCount = 1;

    name = 'rxdb';

    constructor(readonly db: RxDatabase) { }

    getStore() {
        const docStore = this.db.collections.entries as RxCollection<Entry>;
        if (!docStore) {
            console.error('Docs collection not found in database');
            throw new Error('Docs collection not found in database');
        }

        return docStore;
    }

    async pull(
        docId: string,
        state: Uint8Array
    ): Promise<{ data: Uint8Array; state?: Uint8Array | undefined; } | null> {
        const store = this.getStore();

        const doc = await store.findOne(docId).exec();

        if (!doc) {
            return null;
        }

        const { updates } = doc._data;
        const update = mergeUpdates(updates.map(({ update }) => Uint8Array.from(update)));

        const diff = state.length ? diffUpdate(update, state) : update;

        return { data: diff, state: encodeStateVectorFromUpdate(update) };
    }

    async push(docId: string, data: Uint8Array): Promise<void> {
        const store = this.getStore();

        const doc = await store.findOne(docId).exec();

        const { updates } = doc?._data ?? { updates: [] };

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

        const isUpdate = !!doc;
        if (isUpdate) {
            doc.update({
                $set: {
                    updates: rows.map(({ timestamp, update }) => ({
                        timestamp,
                        update: Array.from(update),
                    })),
                }
            });
        }
    }

    subscribe() {
        return () => { };
    }
}
