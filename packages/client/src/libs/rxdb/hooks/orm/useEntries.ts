import { useCallback } from 'react';
import { Entry } from '../../rxdbTypes';
import { firstBy } from 'thenby';
import { useRxCollection } from '../useRxCollection';

interface InsertEntryParams {
    id: string;
    type: string;
    parent: string | null;
    name?: string;
}

interface UpdateEntryParams {
    name?: string;
    parent?: string | null;
    order?: number;
}

const DEFAULT_ENTRY_NAME = 'Untitled Document';

export const useEntries = () => {
    const entryCollection = useRxCollection<Entry>('entries');

    const insert = useCallback(async (params: InsertEntryParams) => {

        const now = new Date();

        const entry = await entryCollection.insert({
            ...params,
            name: params.name || DEFAULT_ENTRY_NAME,
            order: now.getTime(),
            createdAt: now.toISOString(),
        });

        return entry._data;
    }, [entryCollection]);

    const update = useCallback(async (entryId: string, params: UpdateEntryParams) => {
        const doc = await entryCollection.findOne(entryId).exec();
        if (!doc) {
            throw new Error(`Entry not found: ${entryId}`);
        }

        return doc.update({
            $set: params
        });
    }, [entryCollection]);

    const remove = useCallback(async (entryId: string) => {
        const doc = await entryCollection.findOne(entryId).exec();
        if (!doc) {
            throw new Error(`Entry not found: ${entryId}`);
        }

        return doc.remove();
    }, [entryCollection]);

    const subscribe = useCallback((callback: (entry: Entry[]) => void) => {
        const getEntries = async () => {
            const entriesData = await entryCollection.find().exec();
            const entries = entriesData.map((doc) => doc._data);

            const sortedEntries = entries.sort(
                firstBy<Entry>((a, b) => {
                    const aId = a.order;
                    const bId = b.order;
                    return aId < bId ? -1 : aId > bId ? 1 : 0;
                })
            );

            callback(sortedEntries);
        };

        getEntries();

        const subscription = entryCollection.$.subscribe(getEntries);

        return subscription;
    }, [entryCollection]);

    const subscribeSingle = useCallback((entryId: string, callback: (entry: Entry | null) => void) => {
        const subscription = entryCollection.findOne(entryId).$.subscribe((doc) => {
            if (!doc) {
                callback(null);
                return;
            }

            callback(doc._data);
        });

        return subscription;
    }, [entryCollection]);

    const checkEntryExists = useCallback(async (entryId: string) => {
        const doc = await entryCollection.findOne(entryId).exec();
        return !!doc;
    }, [entryCollection]);

    return {
        subscribe,
        subscribeSingle,
        checkEntryExists,
        insert,
        update,
        remove,
    };
};
