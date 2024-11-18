import * as React from 'react';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useCurrentProject } from '@/hooks/state/useCurrentProject';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { useContext } from 'react';
import { AppSidebarContext } from '@/components/layout/sidebar/AppSidebarContext';
import { useEntries } from '@/libs/rxdb';

export const Route = createFileRoute('/editor/$workspaceId/$projectId')({
    component: RouteComponent,
});

function RouteComponent() {
    const { setActiveProject, setEntries } = useContext(AppSidebarContext)!;

    const currentProject = useCurrentProject();
    const { subscribe: subscribeEntries } = useEntries();

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
