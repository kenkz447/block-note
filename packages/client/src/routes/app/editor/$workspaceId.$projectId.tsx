import { createFileRoute, Outlet, useParams } from '@tanstack/react-router';
import { useProject } from '@/hooks/helpers/useProject';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { useContext, useEffect } from 'react';
import { useCurrentUser } from '@writefy/client-shared';
import { EntrySync, useEntries } from '@writefy/client-business';
import { setPageTitle } from '@/utils/pageUtils';
import { AppSidebarContext } from '@/components/layout/editor/sidebar/children/AppSidebarContext';

export const Route = createFileRoute('/app/editor/$workspaceId/$projectId')({
    component: WithEntrySync,
});

function WithEntrySync() {
    const { workspaceId, projectId } = useParams({
        from: '/app/editor/$workspaceId/$projectId',
    });

    const currentUser = useCurrentUser();

    if (currentUser === null) {
        return <RouteComponent />;
    }

    return (
        <EntrySync key={projectId} userId={currentUser.uid} workspaceId={workspaceId} projectId={projectId}>
            {(synced) => {
                if (!synced) {
                    return <LoadingScreen />;
                }

                return <RouteComponent />;
            }}
        </EntrySync>
    );
}

function RouteComponent() {
    const { setActiveProject, setEntries } = useContext(AppSidebarContext)!;

    const { workspaceId, projectId } = useParams({
        from: '/app/editor/$workspaceId/$projectId',
    });

    const currentProject = useProject({
        workspaceId,
        projectId,
    });

    const { subscribe: subscribeEntries } = useEntries({
        workspaceId,
        projectId,
    });

    if (currentProject === null) {
        throw new Error('Project not found');
    }

    useEffect(() => {
        if (!currentProject) {
            return;
        }

        setActiveProject(currentProject);
        const entriesSubscription = subscribeEntries(setEntries);
        return () => {
            setActiveProject(undefined);
            entriesSubscription.unsubscribe();
            setEntries(undefined);
        };
    }, [setActiveProject, setEntries, currentProject, subscribeEntries]);

    // Set page title
    useEffect(() => {
        setPageTitle(currentProject?.name);
    }, [currentProject]);

    useEffect(() => {

    }, [currentProject]);

    if (currentProject === undefined) {
        return <LoadingScreen />;
    }

    return <Outlet />;
}
