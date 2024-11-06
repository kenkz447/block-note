import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

import { RxdbProvider } from '@/libs/rxdb/components/rxdb-provider';
import { PopupProvider } from '@/libs/popup';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/libs/shadcn-ui/components/resizable';
import { EntryTree } from '@/components/entry-tree/entry-tree';
import { EditorProvider } from '@/libs/editor';

export const Route = createRootRoute({
    component: () => (
        <PopupProvider>
            <RxdbProvider>
                <EditorProvider>
                    <ResizablePanelGroup direction="horizontal">
                        <ResizablePanel defaultSize={20} className='bg-sidebar'>
                            <div className='mt-4'>
                                <div className="px-[16px] text-xs font-medium text-sidebar-foreground/70 mb-2">
                                    Documents
                                </div>
                                <EntryTree />
                            </div>
                        </ResizablePanel>
                        <ResizableHandle />
                        <ResizablePanel>
                            <Outlet />
                            <TanStackRouterDevtools position='bottom-right' />
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </EditorProvider>
            </RxdbProvider>
        </PopupProvider>
    ),
})