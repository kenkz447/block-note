import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useCurrentWorkspace } from '@/hooks/state/useCurrentWorkspace';
import { useProjects } from '@/libs/rxdb/hooks/orm/useProjects';
import { useEffect, useState } from 'react';
import { Entry, Project } from '@/libs/rxdb';

import { useIsMobile } from '@/libs/shadcn-ui/hooks/use-mobile';
import { MasterLayoutMobile } from '@/components/layout/MasterLayoutMobile';
import { MasterLayout } from '@/components/layout/MasterLayout';
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
    const [entries, setEntries] = useState<Entry[]>();

    useEffect(() => {
        if (!currentWorkspace) {
            return;
        }
        const subscription = subscribe({ selector: {} }, setProjects);

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
                setActiveProject,
                setEntries,
                workspace: currentWorkspace,
                projects,
                activeProject,
                entries
            }}
        >
            <Layout>
                <Outlet />
            </Layout>
        </AppSidebarContext.Provider>
    );
}
