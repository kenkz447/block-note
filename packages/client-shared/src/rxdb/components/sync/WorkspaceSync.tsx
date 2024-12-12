
import { serverTimestamp, Timestamp, where } from 'firebase/firestore';
import { memo, useEffect, useState } from 'react';
import { RxFirestoreReplicationState } from 'rxdb/plugins/replication-firestore';
import { useRxdb } from '../../hooks/useRxdb';
import { createFirebaseReplication } from '../../rxdbHelpers';
import { shallowEqualByKey } from '../../../utils';
import { Workspace } from '../../rxdbTypes';

interface WorkspaceSyncProps {
    readonly userId: string;
    readonly children: (workspaceSynced: boolean) => React.ReactNode;
}

function WorkspaceSyncImpl({ userId, children }: WorkspaceSyncProps) {
    const db = useRxdb();

    const [replicaState, setReplicateState] = useState<RxFirestoreReplicationState<Workspace>>();

    // Start syncing the workspace when the user is logged in
    useEffect(() => {
        const replicateState = createFirebaseReplication<Workspace>({
            rxCollection: db.collections.workspaces,
            remotePath: ['workspaces'],
            pullFilter: where('activeMembers', 'array-contains', userId),
            pushModifier: async (doc): Promise<Workspace> => {
                const existingDoc = await db.collections.workspaces.findOne(doc.id).exec();

                if (!existingDoc) {
                    doc.createdAt = serverTimestamp();
                    doc.createdBy = userId;
                    return doc;
                }
                else {
                    return doc;
                }
            },
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
    }, [db, userId]);

    return children(replicaState !== undefined);
}

export const WorkspaceSync = memo(WorkspaceSyncImpl, shallowEqualByKey('userId'));
