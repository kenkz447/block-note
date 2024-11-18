import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { useWorkspaceReplica } from '@/libs/rxdb/hooks/sync/useWorkspaceReplica';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useCurrentUser } from '@writefy/client-shared';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/')({
    component: RouteComponent,
});

function RouteComponent() {
    const currentUser = useCurrentUser();

    const [workspaceSynced, setWorkspaceSynced] = useState<boolean>();
    const workspaceReplica = useWorkspaceReplica();

    // Start syncing the workspace when the user is logged in
    useEffect(() => {
        if (!currentUser) {
            return;
        }

        workspaceReplica.start(currentUser.uid).then(() => setWorkspaceSynced(true));

        return () => {
            workspaceReplica.stop();
        };
    }, [currentUser, workspaceReplica]);

    // Skip syncing if the user is not logged in
    // useEffect(() => {
    //     if (currentUser === null) {
    //         setWorkspaceSynced(false);
    //     }
    // }, [currentUser]);

    if (workspaceSynced === undefined) {
        return <LoadingScreen />;
    }

    return <Outlet />;
}
