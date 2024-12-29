import { useCallback } from 'react';
import { useRxdbCollection } from './useRxdbCollection';
import { generateRxId } from '../rxdbUtils';
import { MangoQuery } from 'rxdb';

export const useRxdbOrm = <T>(collectionName: string) => {
    const collection = useRxdbCollection<T>(collectionName);

    const insert = useCallback(async (params: Partial<T>) => {
        const entry = await collection.insert({
            id: generateRxId(),
            ...params
        } as T);

        return entry._data as T;
    }, [collection]);

    const update = useCallback(async (entryId: string, params: Partial<Omit<T, 'id' | 'createdBy' | 'createdAt'>>) => {
        const doc = await collection.findOne(entryId).exec();
        if (!doc) {
            throw new Error(`Workspace not found: ${entryId}`);
        }

        await doc.update({
            $set: params as Partial<T>
        });

        return doc._data as T;
    }, [collection]);

    const remove = useCallback(async (entryId: string) => {
        const doc = await collection.findOne(entryId).exec();
        if (!doc) {
            throw new Error(`RxDocument not found: ${entryId}`);
        }

        await doc.remove();
    }, [collection]);

    const subscribe = useCallback((query: MangoQuery<T>, callback: (entry: T[]) => void) => {
        const getDocs = async () => {
            const rxDocuments = await collection.find(query).exec();
            const listOfData = rxDocuments.map((doc) => doc._data as T);
            callback(listOfData);
        };

        getDocs();

        const subscription = collection.$.subscribe(getDocs);

        return subscription;
    }, [collection]);

    const subscribeSingle = useCallback((entryId: string, callback: (entry: T | null) => void) => {
        const subscription = collection.findOne(entryId).$.subscribe((doc) => {
            if (!doc) {
                callback(null);
                return;
            }

            callback(doc._data as T);
        });

        return subscription;
    }, [collection]);

    return {
        subscribe,
        subscribeSingle,
        insert,
        update,
        remove,
        collection
    };
};
