import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { EditorContainer } from '@/libs/editor'
import { z } from 'zod'
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
})

function RouteComponent() {
  const { entryId } = Route.useSearch();
  const navigate = useNavigate()

  const { collection } = useEditorContext()
  const { db } = useRxdbContext()

  const { subscribeSingle } = useEntries()

  const editor = useMemo(() => {
    if (!collection) {
      return;
    }

    return setupEditor(collection);
  }, [collection]);

  const [entry, setEntry] = useState<Entry | null>()

  useEffect(() => {
    if (!entryId || !db) {
      return;
    }

    const sub = subscribeSingle(entryId, setEntry)

    return () => {
      sub.unsubscribe()
    }
  }, [subscribeSingle, entryId, db])

  useEffect(() => {
    if (!editor) {
      return;
    }

    const disposable = editor.std
      .get(RefNodeSlotsProvider)
      .docLinkClicked.on(({ pageId: docId }) => {
        const target = collection!.getDoc(docId);
        if (!target) {
          throw new Error(`Failed to jump to doc ${docId}`);
        }

        navigate({
          from: '/',
          search: {
            entryId: target.id
          }
        })
      });

    return () => {
      disposable.dispose();
    }
  }, [collection, editor, navigate])

  if (!entry || !editor) {
    return null;
  }

  return (
    <EditorContainer editor={editor} entry={entry} />
  )
}
