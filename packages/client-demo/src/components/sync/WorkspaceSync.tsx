import { useRxdb } from '@/libs/rxdb';
import { createFirebaseReplication } from '@/libs/rxdb/rxdbHelpers';
import { User } from 'firebase/auth';
import { DocumentData, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { RxFirestoreReplicationState } from 'rxdb/plugins/replication-firestore';

interface WorkspaceSyncProps {
    readonly user: User;
    readonly children: (workspaceSynced: boolean) => React.ReactNode;
}

export function WorkspaceSync({ user, children }: WorkspaceSyncProps) {
    const db = useRxdb();

    const [replicaState, setReplicateState] = useState<RxFirestoreReplicationState<DocumentData>>();

    // Start syncing the workspace when the user is logged in
    useEffect(() => {
        if (replicaState) {
            return;
        }

        createFirebaseReplication({
            rxCollection: db.collections.workspaces,
            remotePath: ['workspaces'],
            filter: where('activeMembers', 'array-contains', user.uid)
        }).then(setReplicateState);
    }, [db, replicaState, user.uid]);

    useEffect(() => {
        if (!replicaState) {
            return;
        }

        return () => {
            replicaState.cancel()
                .then(replicaState.remove)
                .then(() => setReplicateState(undefined));
        };
    }, [user.uid, replicaState]);

    return children(replicaState !== undefined);
}
