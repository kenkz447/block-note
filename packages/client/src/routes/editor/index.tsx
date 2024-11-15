import { createFileRoute, Navigate } from '@tanstack/react-router';
import { EditorContainer } from '@/libs/editor';
import { Entry, useEntries } from '@/libs/rxdb';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useCurrentUser } from '@/libs/auth';
import { useCurrentWorkspace } from '@/hooks/state/useCurrentWorkspace';

export const Route = createFileRoute('/editor/')({
    component: RouteComponent,
    validateSearch: z.object({
        entryId: z.string().optional(),
    }),
});

function AnonymousEditor() {
    const { entryId } = Route.useSearch();

    const { subscribeSingle } = useEntries();

    const [entry, setEntry] = useState<Entry | null>();

    useEffect(() => {
        if (!entryId) {
            return;
        }

        const sub = subscribeSingle(entryId, setEntry);

        return () => {
            sub.unsubscribe();
        };
    }, [subscribeSingle, entryId]);

    if (!entry) {
        return null;
    }

    return <EditorContainer entry={entry} />;
}

function SignedInEditor() {
    const currentWorkspace = useCurrentWorkspace();

    if (currentWorkspace === null) {
        return <Navigate to="/workspaces" />;
    }

    return null;
}

function RouteComponent() {
    const { currentUser } = useCurrentUser();

    if (!currentUser) {
        return <AnonymousEditor />;
    }

    return <SignedInEditor />;
}
