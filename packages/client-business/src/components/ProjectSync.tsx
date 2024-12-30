import { memo, useMemo } from 'react';
import { useRxdb, shallowEqualByKey, useRxdbReplication } from '@writefy/client-shared';
import type { AppRxCollections, Project } from '../Models';

interface ProjectSyncProps {
    readonly workspaceId: string;
    readonly children: (workspaceSynced: boolean) => React.ReactNode;
}

function ProjectSyncImpl({ workspaceId, children }: ProjectSyncProps) {
    const db = useRxdb<AppRxCollections>();
    const replicaState = useRxdbReplication<Project>(
        useMemo(() => ({
            rxCollection: db.collections.projects,
            firestorePath: ['workspaces', workspaceId, 'projects'],
            pull: {},
            push: {
                filter: (doc) => doc.workspaceId === workspaceId,
            }
        }), [db.collections.projects, workspaceId])
    );
    return children(replicaState !== undefined);
}

export const ProjectSync = memo(ProjectSyncImpl, shallowEqualByKey('workspaceId'));
