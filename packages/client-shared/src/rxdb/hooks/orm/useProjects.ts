import { useCallback } from 'react';
import { Project } from '../../rxdbTypes';
import { useRxOrm } from '../useRxOrm';
import { getUserId, useCurrentUser } from '../../../auth';
import { MangoQuery } from 'rxdb';

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
    const { insert, update, subscribe, ...rest } = useRxOrm<Project>('projects');

    const userId = getUserId(currentUser);

    return {
        ...rest,
        insert: useCallback((project: ProjectInsertParams) => {
            const now = new Date();
            return insert({
                ...project,
                order: now.getTime(),
                createdBy: userId,
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
