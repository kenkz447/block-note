import { useCallback } from 'react';
import { AppRxCollections, AppRxDocumentBase } from '../rxdbTypes';
import { useRxCollection } from './useRxCollection';
import { generateRxId } from '../rxdbHelpers';

export const useRxOrm = <T extends AppRxDocumentBase>(collectionName: keyof AppRxCollections) => {
    const entryCollection = useRxCollection<T>(collectionName);

    const insert = useCallback(async (params: any) => {

        const now = new Date();

        const entry = await entryCollection.insert({
            ...params,
            id: generateRxId(),
            createdAt: now.toISOString(),
        });

        return entry._data;
    }, [entryCollection]);

    const update = useCallback(async (entryId: string, params: any) => {
        const doc = await entryCollection.findOne(entryId).exec();
        if (!doc) {
            throw new Error(`Workspace not found: ${entryId}`);
        }

        await doc.update({
            $set: params
        });

        return doc._data;
    }, [entryCollection]);

    const remove = useCallback(async (entryId: string) => {
        const doc = await entryCollection.findOne(entryId).exec();
        if (!doc) {
            throw new Error(`Workspace not found: ${entryId}`);
        }

        return doc.remove();
    }, [entryCollection]);

    const subscribe = useCallback((callback: (entry: T[]) => void) => {
        const getWorkspaces = async () => {
            const rxDocuments = await entryCollection.find().exec();
            const listOfData = rxDocuments.map((doc) => doc._data);
            callback(listOfData);
        };

        getWorkspaces();

        const subscription = entryCollection.$.subscribe(getWorkspaces);

        return subscription;
    }, [entryCollection]);

    const subscribeSingle = useCallback((entryId: string, callback: (entry: T | null) => void) => {
        const subscription = entryCollection.findOne(entryId).$.subscribe((doc) => {
            if (!doc) {
                callback(null);
                return;
            }

            callback(doc._data);
        });

        return subscription;
    }, [entryCollection]);

    const checkExists = useCallback(async (entryId: string) => {
        const doc = await entryCollection.findOne(entryId).exec();
        return !!doc;
    }, [entryCollection]);

    return {
        subscribe,
        subscribeSingle,
        checkExists,
        insert,
        update,
        remove,
    };
};
