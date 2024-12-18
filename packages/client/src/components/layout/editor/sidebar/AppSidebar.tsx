import { useContext } from 'react';
import { AppSidebarContext } from './children/AppSidebarContext';
import { AppSidebarHeader } from './children/AppSidebarHeader';
import { AppSidebarFooter } from './children/AppSidebarFooter';
import { AppSidebarBody } from './children/AppSidebarBody';

export function AppSidebar() {
    const context = useContext(AppSidebarContext);
    if (!context) {
        throw new Error('AppSidebarContext must be provided');
    }

    const { workspace, projects, activeProject } = context;

    return (
        <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground">
            <AppSidebarHeader workspace={workspace} projects={projects} activeProject={activeProject} />
            {
                activeProject
                    ? (<AppSidebarBody />)
                    : (<div className="grow" />)
            }
            <AppSidebarFooter />
        </div>
    );
}
