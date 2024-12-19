import { createFileRoute, useParams, useSearch } from '@tanstack/react-router';
import { EditorContainer } from '@writefy/client-blocksuite';
import { Entry, useEntries } from '@writefy/client-shared';
import { useContext, useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { z } from 'zod';
import { AppSidebarContext } from '@/components/layout/editor/sidebar/children/AppSidebarContext';
import { setPageTitle } from '@/utils/pageUtils';

export const Route = createFileRoute(
    '/app/editor/$workspaceId/$projectId/$entryId',
)({
    component: RouteComponent,
    validateSearch: z.object({
        mode: z.string().optional()
    }),
});

function RouteComponent() {
    const { setActiveEntry } = useContext(AppSidebarContext)!;

    const { entryId, projectId, workspaceId } = useParams({
        from: '/app/editor/$workspaceId/$projectId/$entryId',
    });

    const { mode } = useSearch({
        from: '/app/editor/$workspaceId/$projectId/$entryId',
    });

    const { subscribeSingle } = useEntries({
        workspaceId,
        projectId,
    });

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

    useEffect(() => {
        if (!entry) {
            return;
        }

        setActiveEntry(entry);
        return () => {
            setActiveEntry(undefined);
        };
    }, [entry, setActiveEntry]);

    // Set page title
    useEffect(() => {
        setPageTitle(entry?.name);
    }, [entry]);

    if (entry === null) {
        throw new Error('Entry not found');
    }

    if (entry === undefined) {
        return <LoadingScreen />;
    }

    return (
        <EditorContainer entry={entry} mode={mode ?? 'page'} />
    );
}
