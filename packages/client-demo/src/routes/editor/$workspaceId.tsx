import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/editor/$workspaceId')({
  component: RouteComponent,
})

function RouteComponent() {
  return 'Hello /editor/$workspaceId!'
}
