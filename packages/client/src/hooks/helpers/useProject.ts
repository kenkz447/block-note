import { Project } from '@writefy/client-shared';
import { useProjects } from '@writefy/client-shared';
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
