import { memo, useMemo } from 'react';
import { useRxdb, shallowEqualByKey, useRxdbReplication } from '@writefy/client-shared';
import type { AppRxCollections, Project } from '../Models';

interface ProjectSyncProps {
    readonly userId: string;
    readonly workspaceId: string;
    readonly children: (workspaceSynced: boolean) => React.ReactNode;
}

function ProjectSyncImpl({ userId, workspaceId, children }: ProjectSyncProps) {
    const db = useRxdb<AppRxCollections>();
    const replicaState = useRxdbReplication<Project>(
        db,
        useMemo(() => ({
            userId,
            rxCollection: db.collections.projects,
            remotePath: ['workspaces', workspaceId, 'projects'],
            pushFilter: (doc) => doc.workspaceId === workspaceId,
        }), [db.collections.projects, userId, workspaceId])
    );
    return children(replicaState !== undefined);
}

export const ProjectSync = memo(ProjectSyncImpl, shallowEqualByKey('userId', 'workspaceId'));
