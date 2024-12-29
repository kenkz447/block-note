import { RxCollection } from 'rxdb';
import { useRxdb } from './useRxdb';

export function useRxdbCollection<T>(collectionName: string) {
    const db = useRxdb<Record<string, RxCollection<T>>>();
    const collection = db.collections[collectionName];

    if (!collection) {
        throw new Error(`Collection with name "${String(collectionName)}" not found`);
    }

    return collection as unknown as RxCollection<T>;
}
