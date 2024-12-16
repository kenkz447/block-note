import { createFileRoute, useParams } from '@tanstack/react-router';
import { EditorContainer, EditorProvider, EditorContext } from '@writefy/client-blocksuite';
import { Entry, useEntries } from '@writefy/client-shared';
import { useContext, useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { z } from 'zod';
import { AppSidebarContext } from '@/components/layout/editor/sidebar/children/AppSidebarContext';

export const Route = createFileRoute(
    '/app/editor/$workspaceId/$projectId/$entryId',
)({
    component: RouteComponent,
    validateSearch: z.object({
        workspaceId: z.string().optional(),
        projectId: z.string().optional(),
        entryId: z.string().optional(),
    }),
});

function RouteComponent() {
    const { setActiveEntry } = useContext(AppSidebarContext)!;

    const { entryId, projectId, workspaceId } = useParams({
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

    if (entry === null) {
        throw new Error('Entry not found');
    }

    if (entry === undefined) {
        return <LoadingScreen />;
    }

    return (
        <EditorProvider workspaceId={workspaceId} projectId={projectId}>
            {(editorContext) => {
                if (!editorContext.collection) {
                    return <LoadingScreen />;
                }

                return (
                    <EditorContext.Provider value={editorContext}>
                        <EditorContainer entry={entry} />
                    </EditorContext.Provider>
                );
            }}
        </EditorProvider>
    );
}
