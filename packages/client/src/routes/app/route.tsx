import { createFileRoute, Outlet } from '@tanstack/react-router';
import { WorkspaceSync } from '@writefy/client-business';
import { useCurrentUser } from '@writefy/client-shared';
import { LoadingScreen } from '@/components/layout/LoadingScreen';

export const Route = createFileRoute('/app')({
    component: RouteComponent,
});

function RouteComponent() {
    const currentUser = useCurrentUser();
    if (currentUser === null) {
        return <Outlet />;
    }

    return (
        <WorkspaceSync userId={currentUser.uid}>
            {(synced) => {
                if (!synced) {
                    return <LoadingScreen />;
                }

                return <Outlet />;
            }}
        </WorkspaceSync>
    );
}
