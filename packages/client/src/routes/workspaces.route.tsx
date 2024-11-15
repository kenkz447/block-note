import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router';
import { useCurrentUser } from '@/libs/auth';

export const Route = createFileRoute('/workspaces')({
    component: RouteComponent,
});

function RouteComponent() {
    const { currentUser } = useCurrentUser();
    if (!currentUser) {
        return <Navigate to="/" />;
    }
    return <Outlet />;
}
