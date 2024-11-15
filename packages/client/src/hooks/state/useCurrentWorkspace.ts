import { Workspace } from '@/libs/rxdb';
import { useWorkspaces } from '@/libs/rxdb/hooks/orm/useWorkspaces';
import { useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const useCurrentWorkspace = () => {
    const { workspaceId } = useSearch({
        from: '/editor'
    });

    const { subscribeSingle } = useWorkspaces();

    const [workspace, setWorkspace] = useState<Workspace | null | undefined>();

    useEffect(() => {
        if (!workspaceId) {
            return;
        }

        const unsubscribe = subscribeSingle(workspaceId, setWorkspace);
        return unsubscribe.unsubscribe;
    }, [subscribeSingle, workspaceId]);

    return workspace;
};
