
import { DocumentData } from 'firebase/firestore';
import { memo, useEffect, useState } from 'react';
import { RxFirestoreReplicationState } from 'rxdb/plugins/replication-firestore';
import { useRxdb } from '../../hooks/useRxdb';
import { createFirebaseReplication } from '../../rxdbHelpers';
import { Project } from '../../rxdbTypes';
import { shallowEqualByKey } from '../../../utils';

interface ProjectSyncProps {
    readonly userId: string;
    readonly workspaceId: string;
    readonly children: (workspaceSynced: boolean) => React.ReactNode;
}

function ProjectSyncImpl({ userId, workspaceId, children }: ProjectSyncProps) {
    const db = useRxdb();

    const [replicaState, setReplicateState] = useState<RxFirestoreReplicationState<DocumentData>>();

    // Start syncing the workspace when the user is logged in
    useEffect(() => {
        const replicateState = createFirebaseReplication<Project>({
            rxCollection: db.collections.projects,
            remotePath: ['workspaces', workspaceId, 'projects'],
            pushFilter: (doc) => doc.workspaceId === workspaceId,
        });

        const initializeReplication = async () => {
            await replicateState.awaitInitialReplication();
            setReplicateState(replicateState);
        };

        initializeReplication();

        return () => {
            const stopReplication = async () => {
                if (replicateState) {
                    await replicateState.remove();
                    setReplicateState(undefined);
                }
            };

            stopReplication();
        };
    }, [db, userId, workspaceId]);

    return children(replicaState !== undefined);
}

export const ProjectSync = memo(ProjectSyncImpl, shallowEqualByKey('userId', 'workspaceId'));
