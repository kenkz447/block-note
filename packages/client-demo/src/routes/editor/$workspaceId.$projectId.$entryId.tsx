import { createFileRoute } from '@tanstack/react-router';
import { EditorContainer, EditorProvider } from '@/libs/editor';
import { Entry, useEntries } from '@/libs/rxdb';
import { useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { EditorContext } from '@/libs/editor/editorContext';
import { z } from 'zod';

export const Route = createFileRoute(
    '/editor/$workspaceId/$projectId/$entryId',
)({
    component: RouteComponent,
    validateSearch: z.object({
        workspaceId: z.string().optional(),
        projectId: z.string().optional(),
        entryId: z.string().optional(),
    }),
});

function RouteComponent() {
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

    return (
        <Layout>
            <EditorProvider>
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
        </Layout>
    );
}
