import { createFileRoute, Outlet, useParams } from '@tanstack/react-router';
import { useWorkspace } from '@/hooks/helpers/useWorkspace';
import { useEffect, useState } from 'react';
import { Entry, Project, ProjectSync, useProjects } from '@writefy/client-business';
import { useIsMobile } from '@writefy/client-shadcn';
import { MasterLayoutMobile } from '@/components/layout/editor/EditorLayoutMobile';
import { MasterLayout } from '@/components/layout/editor/EditorLayout';
import { AppSidebarContext } from '@/components/layout/editor/sidebar/children/AppSidebarContext';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { useCurrentUser } from '@writefy/client-shared';
import { setPageTitle } from '@/utils/pageUtils';

export const Route = createFileRoute('/app/editor/$workspaceId')({
    component: WithProjectSync,
});

function WithProjectSync() {
    const { workspaceId } = useParams({
        from: '/app/editor/$workspaceId',
    });

    const currentUser = useCurrentUser();

    if (currentUser === null) {
        return <RouteComponent />;
    }

    return (
        <ProjectSync userId={currentUser.uid} workspaceId={workspaceId}>
            {(synced) => {
                if (!synced) {
                    return <LoadingScreen />;
                }

                return <RouteComponent />;
            }}
        </ProjectSync>
    );
}

function RouteComponent() {
    const isMobile = useIsMobile();
    const Layout = isMobile ? MasterLayoutMobile : MasterLayout;

    const { workspaceId } = useParams({
        from: '/app/editor/$workspaceId',
    });

    const currentWorkspace = useWorkspace({ workspaceId });

    if (currentWorkspace === null) {
        throw new Error('Workspace not found');
    }

    const { subscribe } = useProjects({
        workspaceId,
    });

    const [activeProject, setActiveProject] = useState<Project>();
    const [projects, setProjects] = useState<Project[]>();
    const [entries, setEntries] = useState<Entry[]>();
    const [activeEntry, setActiveEntry] = useState<Entry | undefined>();

    useEffect(() => {
        if (!currentWorkspace?.id) {
            return;
        }
        const projectQuery = { selector: { workspaceId: currentWorkspace.id } };
        const subscription = subscribe(projectQuery, setProjects);

        return () => {
            subscription.unsubscribe();
        };
    }, [currentWorkspace?.id, subscribe]);

    // Set page title
    useEffect(() => {
        setPageTitle(currentWorkspace?.name);
    }, [currentWorkspace]);

    if (currentWorkspace === undefined) {
        return <LoadingScreen />;
    }

    return (
        <AppSidebarContext.Provider
            value={{
                setActiveProject,
                setEntries,
                setActiveEntry,
                workspace: currentWorkspace,
                projects,
                activeProject,
                entries,
                activeEntry
            }}
        >
            <Layout>
                <Outlet />
            </Layout>
        </AppSidebarContext.Provider>
    );
}
