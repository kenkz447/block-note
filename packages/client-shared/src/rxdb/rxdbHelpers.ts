import { addRxPlugin, createRxDatabase, MaybePromise, RxCollection, WithDeleted } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { rxdbSchema } from './rxdbSchema';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';

import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { collection, CollectionReference, getFirestore, QueryFieldFilterConstraint } from 'firebase/firestore';
import { replicateFirestore } from 'rxdb/plugins/replication-firestore';

import { AppRxCollections } from './rxdbTypes';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { RxDBStatePlugin } from 'rxdb/plugins/state';
import { RxDBLocalDocumentsPlugin } from 'rxdb/plugins/local-documents';

addRxPlugin(RxDBStatePlugin);
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBDevModePlugin);
addRxPlugin(RxDBLocalDocumentsPlugin);

export const initRxdb = async (dbName: string) => {
    const db = await createRxDatabase<AppRxCollections>({
        name: dbName,
        storage: wrappedValidateAjvStorage({
            storage: getRxStorageDexie()
        }),
        eventReduce: true,
        localDocuments: true
    });

    await db.addCollections({
        workspaces: {
            schema: rxdbSchema.workspace,
            localDocuments: true
        },
        projects: {
            schema: rxdbSchema.project,
            localDocuments: true
        },
        entries: {
            schema: rxdbSchema.entry,
            localDocuments: true
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
    readonly pushModifier?: (item: T) => MaybePromise<T>;
}

export const createFirebaseReplication = <T>({
    rxCollection,
    remotePath,
    pullFilter,
    pushFilter,
    pushModifier
}: CreateFirebaseReplication<T>) => {
    const firestore = getFirestore();
    if (!firestore.app) {
        throw new Error('Firestore app not initialized');
    }

    const remoteId = firestore.app.options.projectId!;

    const [path, ...subPath] = remotePath;

    const remoteCollection = collection(firestore, path, ...subPath);

    const replicaState = replicateFirestore(
        {
            replicationIdentifier: remoteId,
            collection: rxCollection,
            firestore: {
                projectId: remoteId,
                database: firestore,
                collection: remoteCollection as CollectionReference<T>
            },
            pull: { filter: pullFilter },
            push: { filter: pushFilter, modifier: pushModifier },
            live: true,
            serverTimestampField: 'serverTimestamp',
            autoStart: true
        }
    );

    replicaState.error$.subscribe(err => {
        console.error(`"${rxCollection.name}" replication:`, err);
    });

    return replicaState;
};
