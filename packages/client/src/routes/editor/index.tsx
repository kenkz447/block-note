import { createFileRoute, Navigate } from '@tanstack/react-router';
import { z } from 'zod';
import { useCurrentWorkspace } from '@/hooks/state/useCurrentWorkspace';

export const Route = createFileRoute('/editor/')({
    component: RouteComponent,
    validateSearch: z.object({
        entryId: z.string().optional(),
    }),
});

function RouteComponent() {
    const currentWorkspace = useCurrentWorkspace();

    if (currentWorkspace === null) {
        return <Navigate to="/workspaces" />;
    }

    return null;
}
