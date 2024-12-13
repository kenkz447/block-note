import { memo, useEffect, useState } from 'react';
import { RxFirestoreReplicationState } from 'rxdb/plugins/replication-firestore';
import { useRxdb } from '../../hooks/useRxdb';
import { createFirebaseReplication } from '../../rxdbHelpers';
import { Project } from '../../rxdbTypes';
import { shallowEqualByKey } from '../../../utils';
import { firstValueFrom, filter } from 'rxjs';

interface ProjectSyncProps {
    readonly userId: string;
    readonly workspaceId: string;
    readonly children: (workspaceSynced: boolean) => React.ReactNode;
}

function ProjectSyncImpl({ userId, workspaceId, children }: ProjectSyncProps) {
    const db = useRxdb();

    const [replicaState, setReplicateState] = useState<RxFirestoreReplicationState<Project>>();

    // Start syncing the workspace when the user is logged in
    useEffect(() => {
        const replicateState = createFirebaseReplication<Project>({
            rxCollection: db.collections.projects,
            remotePath: ['workspaces', workspaceId, 'projects'],
            pushFilter: (doc) => doc.workspaceId === workspaceId,
        });

        const initializeReplication = async () => {
            db.collections.projects.insertLocal('last-in-sync', { time: 0 }).catch(() => void 0);
            replicateState.active$.subscribe(async () => {
                await replicateState.awaitInSync();
                await db.collections.projects.upsertLocal('last-in-sync', { time: Date.now() });
            });

            // Sync the project data from the last 24 hours
            const oneDay = 1000 * 60 * 60 * 24;

            await firstValueFrom(
                db.collections.projects.getLocal$('last-in-sync').pipe(
                    filter((d) => d!.get('time') > (Date.now() - oneDay))
                )
            );

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
