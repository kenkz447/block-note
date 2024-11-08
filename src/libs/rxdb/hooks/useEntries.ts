import { useCallback } from "react";
import { useRxdbContext } from "./useRxdbContext";
import { RxDocument } from "rxdb";
import { Entry } from "../rxdbTypes";
import { firstBy } from "thenby";

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
    const { db } = useRxdbContext();

    const insert = useCallback(async (params: InsertEntryParams): Promise<Entry> => {
        const now = new Date();

        return await db.collections.entries.insert({
            ...params,
            name: params.name || DEFAULT_ENTRY_NAME,
            order: now.getTime(),
            createdAt: now.toISOString(),
        });
    }, [db.collections]);

    const update = useCallback(async (entryId: string, params: UpdateEntryParams) => {
        const doc = await db.collections.entries.findOne(entryId).exec() as RxDocument<Entry>;
        if (!doc) {
            throw new Error(`Entry not found: ${entryId}`);
        }

        return doc.update({
            $set: params
        });
    }, [db.collections.entries]);

    const remove = useCallback(async (entryId: string) => {
        const doc = await db.collections.entries.findOne(entryId).exec() as RxDocument<Entry>;
        if (!doc) {
            throw new Error(`Entry not found: ${entryId}`);
        }

        return doc.remove();
    }, [db.collections.entries]);

    const subscribe = useCallback((callback: (entry: Entry[]) => void) => {
        const getEntries = async () => {
            const entriesData = await db.collections.entries.find().exec() as RxDocument<Entry>[]
            const entries = entriesData.map((doc) => doc._data);

            const sortedEntries = entries.sort(
                firstBy<Entry>((a, b) => {
                    const aId = a.order
                    const bId = b.order
                    return aId < bId ? -1 : aId > bId ? 1 : 0
                })
            )

            callback(sortedEntries);
        }

        getEntries();

        const subscription = db.collections.entries.$.subscribe(getEntries)

        return subscription;
    }, [db.collections.entries]);

    const subscribeSingle = useCallback((entryId: string, callback: (entry: Entry | null) => void) => {
        const subscription = db.collections.entries.findOne(entryId).$.subscribe((doc: RxDocument<Entry>) => {
            if (!doc) {
                callback(null);
                return;
            }

            callback(doc._data);
        });

        return subscription;
    }, [db.collections.entries]);

    return {
        subscribe,
        subscribeSingle,
        insert,
        update,
        remove,
    };
}
