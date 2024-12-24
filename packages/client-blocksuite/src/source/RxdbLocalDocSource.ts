import { LocalDoc, Entry, AppRxDatabase } from '@writefy/client-shared';
import { DocSource } from '@blocksuite/sync';
import { RxCollection, RxLocalDocument } from 'rxdb';
import { diffUpdate, encodeStateVectorFromUpdate, mergeUpdates } from 'yjs';

type UpdateMessage = {
    timestamp: number;
    update: Uint8Array;
};

export class RxdbLocalDocSource implements DocSource {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debouncePushMap = new Map<string, (...args: any) => Promise<void>>();

    name = 'rxdb-local';
    mergeCount = 1;
    constructor(readonly db: AppRxDatabase) { }

    private _getEntryStore() {
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
            let localDoc: RxLocalDocument<Entry, LocalDoc> | null = null;

            store = this._getEntryStore();
            localDoc = await store.getLocal(docId);
            if (!localDoc) {
                return null;
            }

            const update = mergeUpdates([Uint8Array.from(localDoc._data.data.update)]);
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

            store = this._getEntryStore();
            localDoc = await store.getLocal(docId);

            let rows: UpdateMessage[] = [];
            if (localDoc) {
                rows.push({
                    timestamp: localDoc._data.data.timestamp,
                    update: Uint8Array.from(localDoc._data.data.update)
                });
            }
            rows.push({
                timestamp: Date.now(),
                update: data
            });

            if (this.mergeCount && rows.length >= this.mergeCount) {
                const merged = mergeUpdates(rows.map(({ update }) => update));
                rows = [{ timestamp: Date.now(), update: [...merged] }];
            }
            const update = rows[0];
            await store.upsertLocal(docId, update);
        } catch (error) {
            console.error('Failed to push doc', error);
        }
    }

    subscribe() {
        return () => {
        };
    }
}
