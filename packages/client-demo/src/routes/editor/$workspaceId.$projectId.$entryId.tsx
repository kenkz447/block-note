import { createFileRoute, useParams } from '@tanstack/react-router';
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
    const { entryId } = useParams({
        from: '/editor/$workspaceId/$projectId/$entryId',
    });

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

    if (entry === null) {
        throw new Error('Entry not found');
    }

    if (entry === undefined) {
        return <LoadingScreen />;
    }

    return (
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
    );
}
