import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { useCurrentUser, Workspace } from '@writefy/client-shared';
import { useWorkspaces } from '@writefy/client-shared';
import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { z } from 'zod';

export const Route = createFileRoute('/app/editor/')({
    component: RouteComponent,
    validateSearch: z.object({
        entryId: z.string().optional(),
    }),
});

function RouteComponent() {
    const currentUser = useCurrentUser();
    const { subscribe } = useWorkspaces();

    const [defaultWorkspace, setDefaultWorkspace] = useState<Workspace | null>();
    const [workspaces, setWorkspaces] = useState<Workspace[]>();

    useEffect(() => {
        const subscription = subscribe({
            selector: {
                activeMembers: { $in: [currentUser?.uid ?? 'anonymous'] },
            }
        }, setWorkspaces);
        return () => {
            subscription.unsubscribe();
        };
    }, [currentUser?.uid, subscribe]);

    useEffect(() => {
        if (!workspaces) return;
        setDefaultWorkspace(workspaces?.[0] ?? null);
        return () => {
            setDefaultWorkspace(undefined);
        };
    }, [workspaces]);

    if (defaultWorkspace === null) {
        return <Navigate to="/app/workspaces" />;
    }

    if (defaultWorkspace === undefined) {
        return <LoadingScreen />;
    }

    return <Navigate to={'/app/editor/$workspaceId'} params={{ workspaceId: defaultWorkspace.id }} />;
}
