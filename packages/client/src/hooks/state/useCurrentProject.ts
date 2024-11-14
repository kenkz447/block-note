import { Project } from '@/libs/rxdb';
import { useProjects } from '@/libs/rxdb/hooks/orm/useProjects';
import { useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const useCurrentProject = () => {
    const { projectId } = useParams({
        from: '/$workspaceId/$projectId/'
    });

    const { subscribeSingle } = useProjects();

    const [project, setProject] = useState<Project | null | undefined>();

    useEffect(() => {
        const unsubscribe = subscribeSingle(projectId, setProject);
        return unsubscribe.unsubscribe;
    }, [subscribeSingle, projectId]);

    return project;
};
