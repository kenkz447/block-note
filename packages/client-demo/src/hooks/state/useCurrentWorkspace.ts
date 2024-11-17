import { Workspace } from '@/libs/rxdb';
import { useWorkspaces } from '@/libs/rxdb/hooks/orm/useWorkspaces';
import { useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const useCurrentWorkspace = () => {
    const { workspaceId } = useParams({
        from: '/editor/$workspaceId'
    });

    const { subscribeSingle } = useWorkspaces();

    const [workspace, setWorkspace] = useState<Workspace | null | undefined>();

    useEffect(() => {
        if (!workspaceId || workspace) {
            return;
        }

        const unsubscribe = subscribeSingle(workspaceId, setWorkspace);
        return () => {
            unsubscribe.unsubscribe();
        };
    }, [subscribeSingle, workspaceId, workspace]);

    useEffect(() => {
        if (!workspaceId) {
            setWorkspace(undefined);
        }
    }, [workspaceId]);

    return workspace;
};
