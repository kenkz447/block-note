import { Project } from '@/libs/rxdb';
import { useProjects } from '@/libs/rxdb/hooks/orm/useProjects';
import { useEffect, useState } from 'react';

interface UserProjectOptions {
    readonly workspaceId: string;
    readonly projectId: string;
}

export const useProject = ({
    workspaceId,
    projectId
}: UserProjectOptions) => {
    const { subscribeSingle } = useProjects({
        workspaceId
    });

    const [project, setProject] = useState<Project | null | undefined>();

    useEffect(() => {
        if (!projectId) {
            return;
        }

        const subscription = subscribeSingle(projectId, setProject);
        return () => {
            subscription.unsubscribe();
        };
    }, [subscribeSingle, projectId]);

    return project;
};
