import { memo, useMemo } from 'react';
import { useRxdb, shallowEqualByKey, useRxdbReplication } from '@writefy/client-shared';
import type { AppRxCollections, Entry } from '../Models';

interface EntrySyncProps {
    readonly workspaceId: string;
    readonly projectId: string;
    readonly children: (workspaceSynced: boolean) => React.ReactNode;
}

function EntrySyncImpl({ workspaceId, projectId, children }: EntrySyncProps) {
    const db = useRxdb<AppRxCollections>();
    const entryCollection = db.collections.entries;

    const replicaState = useRxdbReplication<Entry>(
        useMemo(() => ({
            firestorePath: ['workspaces', workspaceId, 'projects', projectId, 'entries'],
            rxCollection: entryCollection,
            pull: {},
            push: {
                filter: (doc) => doc.workspaceId === workspaceId && doc.projectId === projectId
            },
        }), [entryCollection, projectId, workspaceId])
    );
    return children(replicaState !== undefined);
}

export const EntrySync = memo(EntrySyncImpl, shallowEqualByKey('workspaceId', 'projectId'));
