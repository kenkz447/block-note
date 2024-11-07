import { addRxPlugin, createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { rxdbSchema } from './rxdb-schema';
import { wrappedKeyCompressionStorage } from 'rxdb/plugins/key-compression';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';

addRxPlugin(RxDBUpdatePlugin);

export const initRxdb = async () => {
    const storageWithKeyCompression = wrappedKeyCompressionStorage({
        storage: getRxStorageDexie()
    });

    const db = await createRxDatabase({
        name: 'mydatabase',
        storage: storageWithKeyCompression,
        eventReduce: true
    });

    await db.addCollections({
        entries: {
            schema: rxdbSchema.entry
        }
    });

    return db;
}

export const generateRxId = () => {
    return Math.random().toString(36).substring(7);
}
