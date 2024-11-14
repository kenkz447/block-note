import { RxCollection } from 'rxdb';
import { AppRxCollections, AppRxSchema } from '../rxdbTypes';
import { useRxdb } from './useRxdb';

export function useRxCollection<T extends AppRxSchema>(collectionName: keyof AppRxCollections) {
    const db = useRxdb();
    const collection = db.collections[collectionName];

    if (!collection) {
        throw new Error(`Collection with name "${collectionName}" not found`);
    }

    return collection as unknown as RxCollection<T>;
}
