import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@writefy/client-shadcn';
import { Header } from './topbar/Header';
import React, { useMemo } from 'react';
import { AppSidebar } from './sidebar/AppSidebar';
import { ImperativePanelHandle } from 'react-resizable-panels';

export function MasterLayout({ children }: React.PropsWithChildren) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
    const sidebarPanelRef = React.useRef<ImperativePanelHandle>(null);


    const sidebarMinWidth = 255;
    const sidebarDefaultWidth = 300;
    const panelSizes = useMemo(() => {
        return {
            minPercent: sidebarMinWidth / window.innerWidth * 100,
            defaultPercent: sidebarDefaultWidth / window.innerWidth * 100,
        };
    }, []);

    return (
        <ResizablePanelGroup autoSaveId="main-layout" direction="horizontal">
            <ResizablePanel
                ref={sidebarPanelRef}
                collapsible={true}
                minSize={panelSizes.minPercent}
                maxSize={50}
                defaultSize={panelSizes.defaultPercent}
                onCollapse={() => setIsSidebarCollapsed(true)}
                onExpand={() => setIsSidebarCollapsed(false)}
            >
                <AppSidebar />
            </ResizablePanel>
            <ResizableHandle withHandle={isSidebarCollapsed} />
            <ResizablePanel>
                <div className="h-[100vh] flex flex-col relative">
                    <Header />
                    <div className="overflow-auto grow">
                        {children}
                    </div>
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
