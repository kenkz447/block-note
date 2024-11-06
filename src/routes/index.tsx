import { createFileRoute } from '@tanstack/react-router'
import { EditorContainer } from '@/libs/editor'
import { z } from 'zod'
import { Entry, useRxdbContext } from '@/libs/rxdb';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/')({
  component: RouteComponent,
  validateSearch: z.object({
    entryId: z.string().optional(),
  })
})

function RouteComponent() {
  const { entryId } = Route.useSearch();

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

  if (!entry) {
    return null;
  }

  return (
    <EditorContainer entry={entry} />
  )
}
