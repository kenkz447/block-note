import { Workspace } from '@/libs/rxdb';
import { useWorkspaces } from '@/libs/rxdb/hooks/orm/useWorkspaces';
import { useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const useCurrentWorkspace = () => {
    const { workspaceId } = useParams({
        from: '/$workspaceId/'
    });

    const { subscribeSingle } = useWorkspaces();

    const [workspace, setWorkspace] = useState<Workspace | null | undefined>();

    useEffect(() => {
        const unsubscribe = subscribeSingle(workspaceId, setWorkspace);
        return unsubscribe.unsubscribe;
    }, [subscribeSingle, workspaceId]);

    return workspace;
};
