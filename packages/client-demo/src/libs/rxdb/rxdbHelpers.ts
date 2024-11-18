import { addRxPlugin, createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { rxdbSchema } from './rxdbSchema';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';

import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { collection } from 'firebase/firestore';
import { replicateFirestore } from 'rxdb/plugins/replication-firestore';
import { firestore } from '@/bootstraps/firebase';
import { env } from '@/config/env';
import { AppRxCollections, AppRxDatabase } from './rxdbTypes';
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

export const syncRxdb = (db: AppRxDatabase) => {
    const projectId = env.firebaseConfig.projectId;
    const remoteWorkspaceCollection = collection(firestore, 'workspaces');
    const remoteProjectsCollection = collection(firestore, 'workspaces', db.name, 'projects');
    const remoteEntriesCollection = collection(firestore, 'workspaces', db.name, 'projects', db.name, 'entries');

    replicateFirestore(
        {
            replicationIdentifier: projectId,
            collection: db.collections.workspaces,
            firestore: {
                projectId: projectId,
                database: firestore,
                collection: remoteWorkspaceCollection
            },
            pull: {
            },
            push: {
            },
            live: true,
            serverTimestampField: 'serverTimestamp'
        }
    );

    replicateFirestore(
        {
            replicationIdentifier: projectId,
            collection: db.collections.projects,
            firestore: {
                projectId: projectId,
                database: firestore,
                collection: remoteProjectsCollection
            },
            pull: {},
            push: {},
            live: true,
            serverTimestampField: 'serverTimestamp'
        }
    );

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
