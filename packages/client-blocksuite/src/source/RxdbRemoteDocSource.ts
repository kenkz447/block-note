import { LocalDoc, Entry, AppRxDatabase } from '@writefy/client-shared';
import { DocSource } from '@blocksuite/sync';
import { RxCollection, RxLocalDocument } from 'rxdb';
import { diffUpdate, encodeStateVectorFromUpdate, mergeUpdates } from 'yjs';

export class RxdbRemoteDocSource implements DocSource {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debouncePushMap = new Map<string, (...args: any) => Promise<void>>();

    name = 'rxdb-remote';

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

            const merged = mergeUpdates([Uint8Array.from(localDoc._data.data.update!)]);
            const diff = state.length ? diffUpdate(merged, state) : merged;

            return { data: diff, state: encodeStateVectorFromUpdate(merged) };
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
            if (!localDoc) {
                return void await store.upsertLocal(docId, { update: Array.from(currentUpdate), timestamp: Date.now() });
            }

            const merged = mergeUpdates([
                Uint8Array.from(localDoc?._data.data.update ?? [0]),
                currentUpdate
            ]);

            const content = {
                timestamp: Date.now(),
                update: Array.from(merged),
            };

            await store.upsertLocal(docId, content);
        } catch (error) {
            console.error('Failed to push doc', error);
        }
    }

    subscribe() {
        return () => { };
    }
}