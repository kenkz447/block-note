import { Project } from '@/libs/rxdb';
import { useProjects } from '@/libs/rxdb/hooks/orm/useProjects';
import { useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const useCurrentProject = () => {
    const { projectId } = useSearch({
        from: '/editor'
    });

    const { subscribeSingle } = useProjects();

    const [project, setProject] = useState<Project | null | undefined>();

    useEffect(() => {
        if (!projectId) {
            return;
        }

        const unsubscribe = subscribeSingle(projectId, setProject);
        return unsubscribe.unsubscribe;
    }, [subscribeSingle, projectId]);

    return project;
};
