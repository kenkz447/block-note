import { useCallback } from 'react';
import { Project } from '../../rxdbTypes';
import { useRxOrm } from '../useRxOrm';

interface ProjectInsertParams {
    readonly name: string;
}

interface ProjectUpdateParams {
    readonly name?: string;
}

export const useProjects = () => {
    const { insert, update, ...rest } = useRxOrm<Project>('projects');

    return {
        ...rest,
        insert: useCallback((project: ProjectInsertParams) => {
            const now = new Date();
            return insert({
                ...project,
                order: now.getTime(),
            });
        }, [insert]),
        update: useCallback((projectId: string, project: ProjectUpdateParams) => update(projectId, project), [update])
    };
};
