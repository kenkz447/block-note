import { RxDatabase } from 'rxdb';

export const ensureDbExist = (db: RxDatabase | undefined) => {
    if (!db) {
        throw new Error('Database not initialized');
    }
};

export const ensureCollectionExist = (db: RxDatabase | undefined, collectionName: string) => {
    ensureDbExist(db);

    if (!db![collectionName]) {
        throw new Error(`Collection ${collectionName} not found`);
    }
};

export const generateRxId = () => {
    return Math.random().toString(36).substring(7);
};
