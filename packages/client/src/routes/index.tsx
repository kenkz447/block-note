import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { EditorContainer } from '@/libs/editor';
import { z } from 'zod';
import { Entry, useEntries, useRxdbContext } from '@/libs/rxdb';
import { useEffect, useMemo, useState } from 'react';
import { useEditorContext } from '@/libs/editor/hooks/useEditorContext';
import { RefNodeSlotsProvider } from '@blocksuite/blocks';
import { setupEditor } from '@/libs/editor/utils/editorUtils';

export const Route = createFileRoute('/')({
    component: RouteComponent,
    validateSearch: z.object({
        entryId: z.string().optional(),
    })
});

function RouteComponent() {
    const { entryId } = Route.useSearch();
    const { db } = useRxdbContext();

    const { subscribeSingle } = useEntries();

    const [entry, setEntry] = useState<Entry | null>();

    useEffect(() => {
        if (!entryId || !db) {
            return;
        }

        const sub = subscribeSingle(entryId, setEntry);

        return () => {
            sub.unsubscribe();
        };
    }, [subscribeSingle, entryId, db]);

    if (!entry) {
        return null;
    }

    return (
        <EditorContainer entry={entry} />
    );
}
