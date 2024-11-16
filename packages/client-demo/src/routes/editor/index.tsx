import { createFileRoute } from '@tanstack/react-router';
import { EditorContainer } from '@/libs/editor';
import { Entry, useEntries } from '@/libs/rxdb';
import { useEffect, useState } from 'react';
import { z } from 'zod';

export const Route = createFileRoute('/editor/')({
    component: RouteComponent,
    validateSearch: z.object({
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

    return <EditorContainer entry={entry} />;
}
