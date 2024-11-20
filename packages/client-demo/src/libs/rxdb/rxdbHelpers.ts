import { addRxPlugin, createRxDatabase, RxCollection, WithDeleted } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { rxdbSchema } from './rxdbSchema';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';

import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { collection, QueryFieldFilterConstraint } from 'firebase/firestore';
import { replicateFirestore } from 'rxdb/plugins/replication-firestore';
import { firestore } from '@/bootstraps/firebase';
import { env } from '@/config/env';
import { AppRxCollections } from './rxdbTypes';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';

addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBDevModePlugin);

export const initRxdb = async (dbName: string) => {
    const db = await createRxDatabase<AppRxCollections>({
        name: dbName,
        storage: wrappedValidateAjvStorage({
            storage: getRxStorageDexie()
        }),
        eventReduce: true
    });

    await db.addCollections({
        workspaces: {
            schema: rxdbSchema.workspace
        },
        projects: {
            schema: rxdbSchema.project
        },
        entries: {
            schema: rxdbSchema.entry
        },
        local_docs: {
            schema: rxdbSchema.localDoc
        }
    });

    return db;
};


interface CreateFirebaseReplication<T> {
    readonly rxCollection: RxCollection;
    readonly remotePath: string[];
    readonly pullFilter?: QueryFieldFilterConstraint | QueryFieldFilterConstraint[];
    readonly pushFilter?: (item: WithDeleted<T>) => boolean;
}

export const createFirebaseReplication = <T>({
    rxCollection,
    remotePath,
    pullFilter,
    pushFilter
}: CreateFirebaseReplication<T>) => {
    const [path, ...subPath] = remotePath;
    const remoteCollection = collection(firestore, path, ...subPath);

    const replicaState = replicateFirestore(
        {
            replicationIdentifier: env.firebaseConfig.projectId,
            collection: rxCollection,
            firestore: {
                projectId: env.firebaseConfig.projectId,
                database: firestore,
                collection: remoteCollection
            },
            pull: { filter: pullFilter },
            push: { filter: pushFilter },
            live: true,
            serverTimestampField: 'serverTimestamp',
            autoStart: true
        }
    );

    replicaState.error$.subscribe(err => {
        console.error('Replication error:', err);
    });

    return replicaState;
};

export const generateRxId = () => {
    return Math.random().toString(36).substring(7);
};
