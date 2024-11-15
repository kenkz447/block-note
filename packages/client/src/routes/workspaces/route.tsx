import * as React from 'react'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/workspaces')({
  component: RouteComponent,
})

function RouteComponent() {
  return(
    <Outlet/>
  )
}
