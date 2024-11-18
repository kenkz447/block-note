import { env } from '@/config/env';
import { replicateFirestore, RxFirestoreReplicationState } from 'rxdb/plugins/replication-firestore';

import { firestore } from '@/bootstraps/firebase';
import { collection, DocumentData, where } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { useRxdb } from '../useRxdb';

export const useWorkspaceReplica = () => {
    const db = useRxdb();
    const [replicaState, setState] = useState<RxFirestoreReplicationState<DocumentData> | null>();

    const start = useCallback(async (userId: string) => {
        if (!userId) {
            return setState(null);
        }

        const remoteWorkspaceCollection = collection(firestore, 'workspaces');

        const replicaState = replicateFirestore(
            {
                replicationIdentifier: env.firebaseConfig.projectId,
                collection: db.collections.workspaces,
                firestore: {
                    projectId: env.firebaseConfig.projectId,
                    database: firestore,
                    collection: remoteWorkspaceCollection
                },
                pull: {
                    filter: where('activeMembers', 'array-contains', userId)
                },
                push: {
                },
                live: true,
                serverTimestampField: 'serverTimestamp',
                autoStart: true
            }
        );

        replicaState.error$.subscribe(err => {
            console.error('Replication error:', err);
        });

        await replicaState.awaitInitialReplication();
        setState(replicaState);
    }, [db]);

    const stop = useCallback(async () => {
        if (!replicaState) {
            return;
        }

        await replicaState.cancel();
        await replicaState.remove();
        setState(undefined);
    }, [replicaState]);

    return {
        state: replicaState,
        start,
        stop
    };
};
