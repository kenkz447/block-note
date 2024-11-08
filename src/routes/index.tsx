import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { EditorContainer } from '@/libs/editor'
import { z } from 'zod'
import { Entry, useRxdbContext } from '@/libs/rxdb';
import { useEffect, useState } from 'react';
import { useEditorContext } from '@/libs/editor/hooks/useEditorContext';
import { RefNodeSlotsProvider } from '@blocksuite/blocks';

export const Route = createFileRoute('/')({
  component: RouteComponent,
  validateSearch: z.object({
    entryId: z.string().optional(),
  })
})

function RouteComponent() {
  const { entryId } = Route.useSearch();
  const navigate = useNavigate()
  const { editor, collection } = useEditorContext()
  const rxdbContext = useRxdbContext()
  const { entries: entriesCollection } = rxdbContext.db.collections

  const [entry, setEntry] = useState<Entry>()

  useEffect(() => {
    if (!entryId) {
      return;
    }

    const sub = entriesCollection.findOne(entryId).$.subscribe((entry) => {
      setEntry(entry)
    })

    return () => {
      sub.unsubscribe()
    }
  }, [entriesCollection, entryId])

  useEffect(() => {
    const disposable = editor.std
      .get(RefNodeSlotsProvider)
      .docLinkClicked.on(({ pageId: docId }) => {
        const target = collection.getDoc(docId);
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

  if (!entry) {
    return null;
  }

  return (
    <EditorContainer entry={entry} />
  )
}
