import { addRxPlugin, createRxDatabase, RxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { rxdbSchema } from './rxdbSchema';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';

import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { collection } from 'firebase/firestore';
import { replicateFirestore } from 'rxdb/plugins/replication-firestore';
import { firestore } from '@/bootstraps/firebase';
import { env } from '@/config/env';

addRxPlugin(RxDBUpdatePlugin);

export const initRxdb = async (dbName: string) => {
    const db = await createRxDatabase({
        name: dbName,
        storage: wrappedValidateAjvStorage({
            storage: getRxStorageDexie()
        }),
        eventReduce: true
    });

    await db.addCollections({
        versions: {
            schema: rxdbSchema.version
        },
        entries: {
            schema: rxdbSchema.entry
        },
        localDocs: {
            schema: rxdbSchema.localDoc
        }
    });

    return db;
};

export const syncRxdb = (db: RxDatabase) => {
    const projectId = env.firebaseConfig.projectId;
    const remoteEntriesCollection = collection(firestore, 'workspaces', db.name, 'projects', db.name, 'versions', db.name, 'entries');

    replicateFirestore(
        {
            replicationIdentifier: projectId,
            collection: db.collections.entries,
            firestore: {
                projectId: projectId,
                database: firestore,
                collection: remoteEntriesCollection
            },
            pull: {},
            push: {},
            live: true,
            serverTimestampField: 'serverTimestamp'
        }
    );
};


export const generateRxId = () => {
    return Math.random().toString(36).substring(7);
};
