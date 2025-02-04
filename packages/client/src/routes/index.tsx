import { createFileRoute } from '@tanstack/react-router';
import { Navigate } from '@tanstack/react-router';
import { z } from 'zod';

export const Route = createFileRoute('/')({
    component: RouteComponent,
    validateSearch: z.object({})

});

function RouteComponent() {
    return <Navigate to="/app" replace />;
}
