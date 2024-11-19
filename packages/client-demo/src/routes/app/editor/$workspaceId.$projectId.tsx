import * as React from 'react';
import { createFileRoute, Outlet, useParams } from '@tanstack/react-router';
import { useProject } from '@/hooks/helpers/useProject';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { useContext } from 'react';
import { AppSidebarContext } from '@/components/layout/sidebar/children/AppSidebarContext';
import { useEntries } from '@/libs/rxdb';

export const Route = createFileRoute('/app/editor/$workspaceId/$projectId')({
    component: RouteComponent,
});

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

    React.useEffect(() => {
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

    if (currentProject === undefined) {
        return <LoadingScreen />;
    }

    return <Outlet />;
}
