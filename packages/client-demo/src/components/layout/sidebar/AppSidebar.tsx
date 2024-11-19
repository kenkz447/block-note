import { Button } from '@/libs/shadcn-ui/components/button';
import { EntryTree } from '../../entry-tree/EntryTree';
import { useContext } from 'react';
import { AppSidebarContext } from './children/AppSidebarContext';
import { AppSidebarHeader } from './children/AppSidebarHeader';
import { useAuth, useCurrentUser } from '@writefy/client-shared';

export function AppSidebar() {
    const context = useContext(AppSidebarContext);
    if (!context) {
        throw new Error('AppSidebarContext must be provided');
    }

    const { showGoogleSignIn } = useAuth();
    const currentUser = useCurrentUser();

    const { workspace, projects, activeProject, entries } = context;

    return (
        <div className="h-full flex flex-col bg-sidebar gap-2 text-sidebar-foreground">
            <div className="grow flex flex-col">
                <AppSidebarHeader workspace={workspace} projects={projects} activeProject={activeProject} />
                {
                    (activeProject) && (
                        <div className="px-2">
                            <EntryTree entries={entries} />
                        </div>
                    )
                }
            </div>
            <div className="flex flex-col p-2">
                {
                    currentUser
                        ? (
                            <div />
                        )
                        : (
                            <Button variant="outline" onClick={showGoogleSignIn} className="w-full">
                                Login
                            </Button>
                        )
                }
            </div>
        </div>
    );
}
