import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/side-bar/app-sidebar';
import { TopBar } from '@/components/top-bar/TopBar';
import { EditorProvider } from '@/libs/editor';
import { RxdbProvider } from '@/libs/rxdb/components/rxdb-provider';
import { PopupProvider } from '@/libs/popup';

export const Route = createRootRoute({
    component: () => (
        <PopupProvider>
            <RxdbProvider>
                <EditorProvider>
                    <SidebarProvider>
                        <AppSidebar />
                        <SidebarInset>
                            <TopBar />
                            <Outlet />
                            <TanStackRouterDevtools position='bottom-right' />
                        </SidebarInset>
                    </SidebarProvider>
                </EditorProvider>
            </RxdbProvider>
        </PopupProvider>
    ),
})