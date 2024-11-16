import { createRootRoute, Outlet } from '@tanstack/react-router';
import { RxdbProvider } from '@/libs/rxdb/components/RxdbProvider';
import { PopupProvider } from '@/libs/popup';
import { AuthProvider } from '@/libs/auth/components/AuthProvider';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { ThemeProvider } from '@/components/ThemeProvider';
import { RxdbWorkspaceProvider } from '@/libs/rxdb/components/RxdbWorkspaceProvider';
import { AuthContext } from '@/libs/auth';
import { RxdbContext } from '@/libs/rxdb/rxdbContexts';

function App() {
    return (
        <AuthProvider>
            {(authContext) => {
                const { currentUser } = authContext;

                if (currentUser === undefined) {
                    return <LoadingScreen />;
                }

                const syncEnabled = !!currentUser;

                return (
                    <RxdbProvider
                        currentUser={currentUser}
                        sync={syncEnabled}
                    >
                        {(rxdbContext) => {
                            if (!rxdbContext.db) {
                                return <LoadingScreen />;
                            }

                            return (
                                <RxdbWorkspaceProvider
                                    db={rxdbContext.db}
                                    user={currentUser}
                                >
                                    {(workspaceReplica) => {
                                        if (!workspaceReplica) {
                                            return <LoadingScreen />;
                                        }

                                        return (
                                            <AuthContext.Provider value={authContext}>
                                                <RxdbContext.Provider value={rxdbContext}>
                                                    <Outlet />
                                                </RxdbContext.Provider>
                                            </AuthContext.Provider>
                                        );
                                    }}
                                </RxdbWorkspaceProvider>
                            );
                        }}
                    </RxdbProvider>
                );
            }}
        </AuthProvider>
    );
}

export const Route = createRootRoute({
    component: () => (
        <ThemeProvider>
            <PopupProvider>
                <App />
            </PopupProvider>
        </ThemeProvider>
    ),
});
