import { Workspace } from '@/libs/rxdb';
import { useWorkspaces } from '@/libs/rxdb/hooks/orm/useWorkspaces';
import { useEffect, useState } from 'react';

interface UserWorkspaceOptions {
    readonly workspaceId: string;
}

export const useWorkspace = ({ workspaceId }: UserWorkspaceOptions) => {

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
