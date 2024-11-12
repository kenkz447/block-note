import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/libs/shadcn-ui/components/resizable';
import { Header } from './top-bar/Header';
import React, { useCallback } from 'react';
import { Sidebar } from './sidebar/Sidebar';
import { ImperativePanelHandle } from 'react-resizable-panels';

export function MasterLayout({ children }: React.PropsWithChildren) {

    const sidebarPanelRef = React.useRef<ImperativePanelHandle>(null);
    const toggleSidebar = useCallback(() => {
        const isCollapsed = sidebarPanelRef.current?.isCollapsed();
        if (isCollapsed) {
            sidebarPanelRef.current?.expand();
        }
        else {
            sidebarPanelRef.current?.collapse();
        }
    }, []);


    return (
        <ResizablePanelGroup autoSaveId="main-layout" direction="horizontal">
            <ResizablePanel
                ref={sidebarPanelRef}
                collapsible={true}
                minSize={15}
                maxSize={50}
                defaultSize={20}
                className="bg-sidebar"
            >
                <Sidebar />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>
                <Header toggleSidebar={toggleSidebar}/>
                {children}
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
