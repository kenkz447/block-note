import * as React from 'react';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useCurrentProject } from '@/hooks/state/useCurrentProject';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { useContext } from 'react';
import { AppSidebarContext } from '@/components/layout/sidebar/AppSidebarContext';

export const Route = createFileRoute('/editor/$workspaceId/$projectId')({
    component: RouteComponent,
});

function RouteComponent() {
    const { changeActiveProject } = useContext(AppSidebarContext)!;

    const currentProject = useCurrentProject();

    if (currentProject === null) {
        throw new Error('Project not found');
    }

    React.useEffect(() => {
        if (!currentProject) {
            return;
        }

        changeActiveProject(currentProject);

        return () => {
            changeActiveProject(undefined);
        };
    }, [changeActiveProject, currentProject]);

    if (currentProject === undefined) {
        return <LoadingScreen />;
    }

    return <Outlet />;
}
