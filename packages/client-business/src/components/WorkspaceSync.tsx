import { memo, useMemo } from 'react';
import { useRxdb, useRxdbReplication, shallowEqualByKey } from '@writefy/client-shared';
import { where } from 'firebase/firestore';
import type { AppRxCollections, Workspace } from '../Models';

interface WorkspaceSyncProps {
    readonly userId: string;
    readonly children: (workspaceSynced: boolean) => React.ReactNode;
}

function WorkspaceSyncImpl({ userId, children }: WorkspaceSyncProps) {
    const db = useRxdb<AppRxCollections>();
    const replicaState = useRxdbReplication<Workspace>(
        useMemo(() => ({
            rxCollection: db.collections.workspaces,
            firestorePath: ['workspaces'],
            push: {},
            pull: {
                filter: where('activeMembers', 'array-contains', userId)
            },
        }), [db.collections.workspaces, userId])
    );

    return children(replicaState !== undefined);
}

export const WorkspaceSync = memo(WorkspaceSyncImpl, shallowEqualByKey('userId'));
