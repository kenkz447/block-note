import { Entry, AppRxDatabase } from '@writefy/client-shared';
import { DocSource } from '@blocksuite/sync';
import { RxCollection } from 'rxdb';
import { getDatabase, onValue, ref as realtimeRef } from 'firebase/database';
import { mergeUpdates } from 'yjs';

export class RealtimeDocSource implements DocSource {
    name = 'rxdb-shadow';

    constructor(readonly db: AppRxDatabase, readonly messageChannel: string) { }

    private _getEntryStore() {
        const docStore = this.db.collections.entries as RxCollection<Entry>;
        if (!docStore) {
            throw new Error('Entries collection not found in database');
        }

        return docStore;
    }

    async pull() {
        return null;
    }

    async push() {
        // no-op
    }

    subscribe(cb: (docId: string, data: Uint8Array) => void) {
        /**
         * Subscribe to the db update event to update the document
         */
        const realtimeDb = getDatabase();
        const store = this._getEntryStore();
        const unsubscribes: Map<string, ReturnType<typeof onValue>> = new Map();
        const storeSub = store.find().$.subscribe(async (docs) => {
            for (const doc of docs) {
                const existingUnsubscribe = unsubscribes.get(doc.id);
                if (existingUnsubscribe) {
                    return;
                }

                const docRef = realtimeRef(realtimeDb, `${this.messageChannel}/${doc.id}`);
                const unsubscribe = onValue(docRef, async (snapshot) => {
                    const update = snapshot.val();
                    if (!update) {
                        return;
                    }

                    const localDoc = await store.getLocal(doc.id);
                    if (!localDoc) {
                        return;
                    }

                    const latestContent = mergeUpdates([
                        Uint8Array.from(localDoc._data.data.latest),
                        Uint8Array.from(update)
                    ]);

                    cb(doc.id, Uint8Array.from(latestContent));
                });

                unsubscribes.set(doc.id, unsubscribe);
            }
        });

        return () => {
            storeSub.unsubscribe();
            unsubscribes.forEach((unsubscribe) => unsubscribe());
        };
    }
}
