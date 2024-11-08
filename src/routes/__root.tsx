import { createRootRoute, Outlet } from '@tanstack/react-router'
import { RxdbProvider } from '@/libs/rxdb/components/RxdbProvider';
import { PopupProvider } from '@/libs/popup';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/libs/shadcn-ui/components/resizable';
import { EditorProvider } from '@/libs/editor';
import { useCurrentUser } from '@/libs/auth';
import { RxdbSyncProvider } from '@/libs/rxdb-sync';
import { AuthProvider } from '@/libs/auth/components/AuthProvider';
import { EditorBridgeProvider, RxdbBridgeProvider } from '@/libs/rxdb-bridge';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { TopBar } from '@/components/top-bar/TopBar';

function App() {
    const { currentUser } = useCurrentUser();

    if (currentUser === undefined) {
        return null;
    }

    return (
        <RxdbProvider>
            <RxdbSyncProvider>
                <EditorProvider>
                    <RxdbBridgeProvider>
                        <EditorBridgeProvider>
                            <PopupProvider>
                                <ResizablePanelGroup autoSaveId="main-layout" direction="horizontal">
                                    <ResizablePanel collapsible={true} minSize={15} maxSize={50} defaultSize={20} className='bg-sidebar'>
                                        <Sidebar />
                                    </ResizablePanel>
                                    <ResizableHandle />
                                    <ResizablePanel>
                                        <TopBar />
                                        <Outlet />
                                    </ResizablePanel>
                                </ResizablePanelGroup>
                            </PopupProvider>
                        </EditorBridgeProvider>
                    </RxdbBridgeProvider>
                </EditorProvider>
            </RxdbSyncProvider>
        </RxdbProvider>
    )
}

export const Route = createRootRoute({
    component: () => <AuthProvider><App /></AuthProvider>,
})
