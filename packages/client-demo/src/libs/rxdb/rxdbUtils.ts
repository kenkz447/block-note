import { AppRxCollections, AppRxDatabase } from './rxdbTypes';

export const ensureDbExist = (db: AppRxDatabase | undefined) => {
    if (!db) {
        throw new Error('Database not initialized');
    }
};

export const ensureCollectionExist = (db: AppRxDatabase | undefined, collectionName: keyof AppRxCollections) => {
    ensureDbExist(db);

    if (!db![collectionName]) {
        throw new Error(`Collection ${collectionName} not found`);
    }
};
