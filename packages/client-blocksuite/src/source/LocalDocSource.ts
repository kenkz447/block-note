import { LocalDoc, Entry, AppRxDatabase } from '@writefy/client-shared';
import { DocSource } from '@blocksuite/sync';
import { RxCollection, RxLocalDocument } from 'rxdb';
import { diffUpdate, encodeStateVectorFromUpdate, mergeUpdates } from 'yjs';

export class LocalDocSource implements DocSource {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debouncePushMap = new Map<string, (...args: any) => Promise<void>>();

    name = 'rxdb-local';
    mergeCount = 1;
    constructor(readonly db: AppRxDatabase) {
    }

    private _getEntryStore() {
        const docStore = this.db.collections.entries as RxCollection<Entry>;
        if (!docStore) {
            throw new Error('Entries collection not found in database');
        }

        return docStore;
    }

    async pull(docId: string, state: Uint8Array): Promise<{ data: Uint8Array; state?: Uint8Array | undefined; } | null> {
        try {
            let store: RxCollection | null = null;
            let localDoc: RxLocalDocument<Entry, LocalDoc> | null = null;

            store = this._getEntryStore();
            localDoc = await store.getLocal(docId);
            if (!localDoc) {
                return null;
            }

            const update = mergeUpdates([Uint8Array.from(localDoc._data.data.latest)]);
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
            let localDoc: RxLocalDocument<Entry, LocalDoc> | null = null;

            store = this._getEntryStore();
            localDoc = await store.getLocal(docId);

            const rows = [];
            if (localDoc?._data.data.latest) {
                rows.push(localDoc._data.data.latest);
            }
            rows.push(currentUpdate);

            const merged = mergeUpdates(rows.map((row) => Uint8Array.from(row)));

            const update: LocalDoc = {
                timestamp: Date.now(),
                latest: Array.from(merged),
                update: Array.from(currentUpdate)
            };

            await store.upsertLocal(docId, update);

            if (docId.startsWith('local:')) {
                return;
            }

            const doc = await store.findOne(docId).exec();
            if (!doc) {
                return;
            }

            await doc.update({
                $set: {
                    contentTimestamp: update.timestamp,
                }
            });
        } catch (error) {
            console.error('Failed to push doc', error);
        }
    }

    subscribe() {
        return () => { };
    }
}
