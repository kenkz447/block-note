import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/login')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div>
            <h1>Login</h1>
        </div>
    )
}
