import { useCurrentUser } from '@/libs/auth';
import { createFileRoute } from '@tanstack/react-router';
import { Navigate } from '@tanstack/react-router';
import { z } from 'zod';

export const Route = createFileRoute('/')({
    component: RouteComponent,
    validateSearch: z.object({})

});

function RouteComponent() {
    const { currentUser } = useCurrentUser();

    if (currentUser) {
        return <Navigate to="/workspaces" replace />;
    }

    return <Navigate to="/editor" replace />;
}
