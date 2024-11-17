import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useCurrentWorkspace } from '@/hooks/state/useCurrentWorkspace';
import { useProjects } from '@/libs/rxdb/hooks/orm/useProjects';
import { useEffect, useState } from 'react';
import { Project } from '@/libs/rxdb';

import { useIsMobile } from '@/libs/shadcn-ui/hooks/use-mobile';
import { MasterLayoutMobile } from '@/components/layout/MasterLayoutMobile';
import { MasterLayout } from '@/components/layout/MasterLayout';
import { EntryTreeContext } from '@/components/entry-tree/EntryTreeContext';
import { AppSidebarContext } from '@/components/layout/sidebar/AppSidebarContext';
import { LoadingScreen } from '@/components/layout/LoadingScreen';

export const Route = createFileRoute('/editor/$workspaceId')({
    component: RouteComponent,
});

function RouteComponent() {

    const isMobile = useIsMobile();
    const Layout = isMobile ? MasterLayoutMobile : MasterLayout;

    const currentWorkspace = useCurrentWorkspace();

    if (currentWorkspace === null) {
        throw new Error('Workspace not found');
    }

    const { subscribe } = useProjects();

    const [activeProject, setActiveProject] = useState<Project>();
    const [projects, setProjects] = useState<Project[]>();

    useEffect(() => {
        if (!currentWorkspace) {
            return;
        }
        const subscription = subscribe(setProjects);
        return () => {
            subscription.unsubscribe();
        };
    }, [currentWorkspace, subscribe]);

    if (currentWorkspace === undefined) {
        return <LoadingScreen />;
    }

    return (
        <AppSidebarContext.Provider
            value={{
                changeActiveProject: setActiveProject,
                workspace: currentWorkspace,
                projects,
                activeProject
            }}
        >
            <EntryTreeContext.Provider value={{}}>
                <Layout>
                    <Outlet />
                </Layout>
            </EntryTreeContext.Provider>
        </AppSidebarContext.Provider>
    );
}
