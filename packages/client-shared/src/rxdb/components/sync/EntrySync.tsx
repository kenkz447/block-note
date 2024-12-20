import { memo, useEffect, useState } from 'react';
import { RxFirestoreReplicationState } from 'rxdb/plugins/replication-firestore';
import { shallowEqualByKey } from '../../../utils';
import { useRxdb } from '../../hooks/useRxdb';
import { createFirebaseReplication } from '../../rxdbHelpers';
import { Entry } from '../../rxdbTypes';
import { firstValueFrom, filter } from 'rxjs';

interface EntrySyncProps {
    readonly userId: string;
    readonly workspaceId: string;
    readonly projectId: string;
    readonly children: (workspaceSynced: boolean) => React.ReactNode;
}

function EntrySyncImpl({ userId, workspaceId, projectId, children }: EntrySyncProps) {
    const db = useRxdb();

    const [replicaState, setReplicateState] = useState<RxFirestoreReplicationState<Entry>>();

    // Start syncing the workspace when the user is logged in
    useEffect(() => {
        const replicateState = createFirebaseReplication<Entry>({
            userId,
            rxCollection: db.collections.entries,
            remotePath: ['workspaces', workspaceId, 'projects', projectId, 'entries'],
            pushFilter: (doc) => doc.workspaceId === workspaceId && doc.projectId === projectId
        });

        const initializeReplication = async () => {
            db.collections.entries.insertLocal('last-in-sync', { time: 0 }).catch(() => void 0);
            replicateState.active$.subscribe(async () => {
                await replicateState.awaitInSync();
                await db.collections.entries.upsertLocal('last-in-sync', { time: Date.now() });
            });

            // Sync the project data from the last 24 hours
            const oneDay = 1000 * 60 * 60 * 24;

            await firstValueFrom(
                db.collections.entries.getLocal$('last-in-sync').pipe(
                    filter((d) => d!.get('time') > (Date.now() - oneDay))
                )
            );
            setReplicateState(replicateState);
        };

        initializeReplication();

        return () => {
            const stopReplication = async () => {
                if (replicateState) {
                    if (!db.closed) {
                        await replicateState.remove();
                    }
                    setReplicateState(undefined);
                }
            };

            stopReplication();
        };
    }, [db, userId, workspaceId, projectId]);

    return children(replicaState !== undefined);
}

export const EntrySync = memo(EntrySyncImpl, shallowEqualByKey('userId', 'workspaceId', 'projectId'));
