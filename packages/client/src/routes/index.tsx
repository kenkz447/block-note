import { createFileRoute } from '@tanstack/react-router';
import { Navigate } from '@tanstack/react-router';
import { z } from 'zod';

export const Route = createFileRoute('/')({
    component: RouteComponent,
    validateSearch: z.object({})

});

function RouteComponent() {
    if (location.pathname === '/') {
        return <Navigate to="/editor" replace />;
    }

    return null;
}
