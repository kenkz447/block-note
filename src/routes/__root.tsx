import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

import { RxdbProvider } from '@/libs/rxdb/components/rxdb-provider';
import { PopupProvider } from '@/libs/popup';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/libs/shadcn-ui/components/resizable';
import { EntryTree } from '@/components/entry-tree/entry-tree';
import { EditorProvider } from '@/libs/editor';
import { useCurrentUser, useGoogleSignIn } from '@/libs/auth';
import { RxdbSyncProvider } from '@/libs/rxdb-sync';
import { Button } from '@/libs/shadcn-ui/components/button';
import { AuthProvider } from '@/libs/auth/components/AuthProvider';
import { RxdbBridgeProvider } from '@/libs/rxdb-bridge';

function App() {
    const { currentUser } = useCurrentUser();
    const googleSignIn = useGoogleSignIn();

    if (currentUser === undefined) {
        return null;
    }

    return (
        <RxdbProvider>
            <RxdbSyncProvider>
                <EditorProvider>
                    <RxdbBridgeProvider>
                        <PopupProvider>
                            <ResizablePanelGroup direction="horizontal">
                                <ResizablePanel defaultSize={20} className='bg-sidebar'>
                                    <div className='mt-4'>
                                        <div className="px-[16px] text-xs font-medium text-sidebar-foreground/70 mb-2">
                                            Documents
                                        </div>
                                        <EntryTree />
                                        {
                                            !currentUser && (
                                                <Button onClick={googleSignIn}>
                                                    Login
                                                </Button>
                                            )
                                        }
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle />
                                <ResizablePanel>
                                    <Outlet />
                                    <TanStackRouterDevtools position='bottom-right' />
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </PopupProvider>
                    </RxdbBridgeProvider>
                </EditorProvider>
            </RxdbSyncProvider>
        </RxdbProvider>
    )
}

export const Route = createRootRoute({
    component: () => <AuthProvider><App /></AuthProvider>,
})
