import { firestore } from '@/bootstraps/firebase';
import { collection } from 'firebase/firestore';
import { useCallback } from 'react';
import { RxDatabase } from 'rxdb';
import { replicateFirestore } from 'rxdb/plugins/replication-firestore';

const projectId = firestore.app.options.projectId!;

interface UseRxSyncOptions {
  readonly db: RxDatabase;
}

export const useRxSync = ({ db }: UseRxSyncOptions) => {
    return useCallback(async () => {

        const remoteEntriesCollection = collection(firestore, 'workspaces', db.name, 'entries');

        replicateFirestore(
            {
                replicationIdentifier: `https://firestore.googleapis.com/${projectId}`,
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
    }, [db.collections.entries, db.name]);
};
