import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { Workspace } from '@/libs/rxdb';
import { useWorkspaces } from '@/libs/rxdb/hooks/orm/useWorkspaces';
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
    const { subscribe } = useWorkspaces();

    const [defaultWorkspace, setDefaultWorkspace] = useState<Workspace | null>();
    const [workspaces, setWorkspaces] = useState<Workspace[]>();

    useEffect(() => {
        const subscription = subscribe({}, setWorkspaces);
        return () => {
            subscription.unsubscribe();
        };
    }, [subscribe]);

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
