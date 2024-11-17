import { Project } from '@/libs/rxdb';
import { useProjects } from '@/libs/rxdb/hooks/orm/useProjects';
import { useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const useCurrentProject = () => {
    const { projectId } = useParams({
        from: '/editor/$workspaceId/$projectId'
    });

    const { subscribeSingle } = useProjects();

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
