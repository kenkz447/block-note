import { getUserId, useCurrentUser, useRxdbOrm } from '@writefy/client-shared';
import { useCallback } from 'react';
import { MangoQuery } from 'rxdb';
import { Project } from '../../Models';

interface ProjectInsertParams {
    readonly name: string;
}

interface ProjectUpdateParams {
    readonly name?: string;
}

export interface UserProjectOptions {
    readonly workspaceId: string;
}

export const useProjects = ({ workspaceId }: UserProjectOptions) => {
    const currentUser = useCurrentUser();
    const { insert, update, subscribe, ...rest } = useRxdbOrm<Project>('projects');

    const userId = getUserId(currentUser);

    return {
        ...rest,
        insert: useCallback((project: ProjectInsertParams) => {
            const now = new Date();
            return insert({
                ...project,
                order: now.getTime(),
                createdBy: userId,
                createdAt: now.toISOString(),
                workspaceId
            });
        }, [insert, userId, workspaceId]),
        update: useCallback((projectId: string, project: ProjectUpdateParams) => update(projectId, project), [update]),
        subscribe: useCallback((query: MangoQuery<Project>, callback: (projects: Project[]) => void) => {
            return subscribe({
                ...query,
                selector: {
                    ...query.selector,
                    workspaceId
                }
            }, callback);
        }, [subscribe, workspaceId]),
    };
};
