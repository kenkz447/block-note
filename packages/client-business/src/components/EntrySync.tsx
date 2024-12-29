import { memo, useMemo } from 'react';
import { useRxdb, shallowEqualByKey, useRxdbReplication } from '@writefy/client-shared';
import type { AppRxCollections, Entry } from '../Types';

interface EntrySyncProps {
    readonly userId: string;
    readonly workspaceId: string;
    readonly projectId: string;
    readonly children: (workspaceSynced: boolean) => React.ReactNode;
}

function EntrySyncImpl({ userId, workspaceId, projectId, children }: EntrySyncProps) {
    const db = useRxdb<AppRxCollections>();
    const entryCollection = db.collections.entries;

    const replicaState = useRxdbReplication<Entry>(
        db,
        useMemo(() => ({
            remotePath: ['workspaces', workspaceId, 'projects', projectId, 'entries'],
            rxCollection: entryCollection,
            userId: userId,
            pushFilter: (doc) => doc.workspaceId === workspaceId && doc.projectId === projectId,
        }), [entryCollection, projectId, userId, workspaceId])
    );
    return children(replicaState !== undefined);
}

export const EntrySync = memo(EntrySyncImpl, shallowEqualByKey('userId', 'workspaceId', 'projectId'));
