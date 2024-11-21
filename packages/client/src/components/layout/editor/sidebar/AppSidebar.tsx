import { EntryTree } from '../../../entry-tree/EntryTree';
import { useContext } from 'react';
import { AppSidebarContext } from './children/AppSidebarContext';
import { AppSidebarHeader } from './children/AppSidebarHeader';
import { AppSidebarFooter } from './children/AppSidebarFooter';

export function AppSidebar() {
    const context = useContext(AppSidebarContext);
    if (!context) {
        throw new Error('AppSidebarContext must be provided');
    }

    const { workspace, projects, activeProject, entries } = context;

    return (
        <div className="h-full flex flex-col bg-sidebar gap-2 text-sidebar-foreground">
            <div className="grow flex flex-col">
                <AppSidebarHeader workspace={workspace} projects={projects} activeProject={activeProject} />
                {
                    (activeProject) && (
                        <div className="px-2">
                            <EntryTree
                                entries={entries}
                            />
                        </div>
                    )
                }
            </div>
            <AppSidebarFooter />
        </div>
    );
}
