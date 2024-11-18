import { useCallback } from 'react';
import { AppRxCollections, AppRxDocumentBase } from '../rxdbTypes';
import { useRxCollection } from './useRxCollection';
import { generateRxId } from '../rxdbHelpers';
import { MangoQuery } from 'rxdb';

export const useRxOrm = <T extends AppRxDocumentBase>(collectionName: keyof AppRxCollections) => {
    const collection = useRxCollection<T>(collectionName);

    const insert = useCallback(async (params: Partial<T>) => {
        const now = new Date();

        const entry = await collection.insert({
            id: generateRxId(),
            createdAt: now.toISOString(),
            ...params
        } as T);

        return entry._data;
    }, [collection]);

    const update = useCallback(async (entryId: string, params: Partial<Omit<T, 'id' | 'createdBy' | 'createdAt'>>) => {
        const doc = await collection.findOne(entryId).exec();
        if (!doc) {
            throw new Error(`Workspace not found: ${entryId}`);
        }

        await doc.update({
            $set: params as Partial<T>
        });

        return doc._data;
    }, [collection]);

    const remove = useCallback(async (entryId: string) => {
        const doc = await collection.findOne(entryId).exec();
        if (!doc) {
            throw new Error(`RxDocument not found: ${entryId}`);
        }

        await doc.remove();
    }, [collection]);

    const subscribe = useCallback((query: MangoQuery<T>, callback: (entry: T[]) => void) => {
        const getWorkspaces = async () => {
            const rxDocuments = await collection.find(query).exec();
            const listOfData = rxDocuments.map((doc) => doc._data);
            callback(listOfData);
        };

        getWorkspaces();

        const subscription = collection.$.subscribe(getWorkspaces);

        return subscription;
    }, [collection]);

    const subscribeSingle = useCallback((entryId: string, callback: (entry: T | null) => void) => {
        const subscription = collection.findOne(entryId).$.subscribe((doc) => {
            if (!doc) {
                callback(null);
                return;
            }

            callback(doc._data);
        });

        return subscription;
    }, [collection]);

    const checkExists = useCallback(async (entryId: string) => {
        const doc = await collection.findOne(entryId).exec();
        return !!doc;
    }, [collection]);

    return {
        subscribe,
        subscribeSingle,
        checkExists,
        insert,
        update,
        remove,
        collection
    };
};
