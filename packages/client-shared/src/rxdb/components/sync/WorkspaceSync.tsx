
import { where } from 'firebase/firestore';
import { memo, useEffect, useState } from 'react';
import { RxFirestoreReplicationState } from 'rxdb/plugins/replication-firestore';
import { firstValueFrom, filter } from 'rxjs';
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
        });

        const initializeReplication = async () => {
            db.collections.workspaces.insertLocal('last-in-sync', { time: 0 }).catch(() => void 0);
            replicateState.active$.subscribe(async () => {
                await replicateState.awaitInSync();
                await db.collections.workspaces.upsertLocal('last-in-sync', { time: Date.now() });
            });

            // Sync the project data from the last 24 hours
            const oneDay = 1000 * 60 * 60 * 24;

            await firstValueFrom(
                db.collections.workspaces.getLocal$('last-in-sync').pipe(
                    filter((d) => d!.get('time') > (Date.now() - oneDay))
                )
            );

            setReplicateState(replicateState);
        };

        initializeReplication();

        return () => {
            const stopReplication = async () => {
                if (replicateState) {
                    if (!db.destroyed) {
                        await replicateState.remove();
                    }
                    setReplicateState(undefined);
                }
            };

            stopReplication();
        };
    }, [db, userId]);

    return children(replicaState !== undefined);
}

export const WorkspaceSync = memo(WorkspaceSyncImpl, shallowEqualByKey('userId'));
