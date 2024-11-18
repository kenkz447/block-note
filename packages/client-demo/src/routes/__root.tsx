import { createRootRoute, Outlet } from '@tanstack/react-router';
import { RxdbProvider } from '@/libs/rxdb/components/RxdbProvider';
import { PopupProvider } from '@/libs/popup';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { RxdbContext } from '@/libs/rxdb/rxdbContexts';
import { AuthProvider, ThemeProvider, useCurrentUser } from '@writefy/client-shared';
import { AuthContext } from '@writefy/client-shared/src/auth/authContext';
import { useEffect, useState } from 'react';
import { useWorkspaceReplica } from '@/libs/rxdb/hooks/sync/useWorkspaceReplica';

export const Route = createRootRoute({
    component: () => (
        <ThemeProvider>
            <PopupProvider>
                <AppRoot />
            </PopupProvider>
        </ThemeProvider>
    ),
});

function AppRoot() {
    return (
        <AuthProvider>
            {(authContext) => {
                if (authContext.currentUser === undefined) {
                    return <LoadingScreen />;
                }

                return (
                    <RxdbProvider currentUser={authContext.currentUser}>
                        {(rxdbContext) => {
                            if (!rxdbContext.db) {
                                return <LoadingScreen />;
                            }

                            return (
                                <AuthContext.Provider value={authContext}>
                                    <RxdbContext.Provider value={rxdbContext}>
                                        <SyncRoot />
                                    </RxdbContext.Provider>
                                </AuthContext.Provider>
                            );
                        }}
                    </RxdbProvider>
                );
            }}
        </AuthProvider>
    );
}

function SyncRoot() {
    const currentUser = useCurrentUser();

    const [workspaceSynced, setWorkspaceSynced] = useState<boolean>();
    const {
        start: startWorkspaceSync,
        stop: stopWorkspaceSync,
    } = useWorkspaceReplica();

    // Start syncing the workspace when the user is logged in
    useEffect(() => {
        if (!currentUser) {
            return;
        }

        startWorkspaceSync(currentUser.uid).then(() => setWorkspaceSynced(true));

        return () => {
            stopWorkspaceSync();
        };
    }, [currentUser, startWorkspaceSync, stopWorkspaceSync]);

    // Skip syncing if the user is not logged in
    useEffect(() => {
        if (currentUser === null) {
            setWorkspaceSynced(false);
        }
    }, [currentUser]);

    if (workspaceSynced === undefined) {
        return <LoadingScreen />;
    }

    return <Outlet />;
}
