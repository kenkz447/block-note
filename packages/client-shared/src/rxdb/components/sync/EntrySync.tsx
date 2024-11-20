import { DocumentData } from 'firebase/firestore';
import { memo, useEffect, useState } from 'react';
import { RxFirestoreReplicationState } from 'rxdb/plugins/replication-firestore';
import { shallowEqual } from '../../../utils';
import { useRxdb } from '../../hooks/useRxdb';
import { createFirebaseReplication } from '../../rxdbHelpers';
import { Entry } from '../../rxdbTypes';

interface EntrySyncProps {
    readonly userId: string;
    readonly workspaceId: string;
    readonly projectId: string;
    readonly children: (workspaceSynced: boolean) => React.ReactNode;
}

function EntrySyncImpl({ userId, workspaceId, projectId, children }: EntrySyncProps) {
    const db = useRxdb();

    const [replicaState, setReplicateState] = useState<RxFirestoreReplicationState<DocumentData>>();

    // Start syncing the workspace when the user is logged in
    useEffect(() => {
        const replicateState = createFirebaseReplication<Entry>({
            rxCollection: db.collections.entries,
            remotePath: ['workspaces', workspaceId, 'projects', projectId, 'entries'],
            pushFilter: (doc) => doc.workspaceId === workspaceId && doc.projectId === projectId,
        });

        const initializeReplication = async () => {
            await replicateState.awaitInitialReplication();
            setReplicateState(replicateState);
        };

        initializeReplication();

        return () => {
            const stopReplication = async () => {
                if (replicateState) {
                    await replicateState.cancel();
                    await replicateState.remove();
                    setReplicateState(undefined);
                }
            };

            stopReplication();
        };
    }, [db, userId, workspaceId, projectId]);

    return children(replicaState !== undefined);
}

export const EntrySync = memo(EntrySyncImpl, shallowEqual('userId', 'workspaceId', 'projectId'));
