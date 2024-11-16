import { createRootRoute, Outlet } from '@tanstack/react-router';
import { RxdbProvider } from '@/libs/rxdb/components/RxdbProvider';
import { PopupProvider } from '@/libs/popup';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { RxdbContext } from '@/libs/rxdb/rxdbContexts';
import { AuthProvider, ThemeProvider } from '@writefy/client-shared';

function App() {
    return (
        <AuthProvider>
            {(authContext) => {
                if (authContext.currentUser === undefined) {
                    return <LoadingScreen />;
                }

                const useSync = !!authContext.currentUser;
                return (
                    <RxdbProvider currentUser={authContext.currentUser} sync={useSync}>
                        {(rxdbContext) => {
                            if (!rxdbContext.db) {
                                return <LoadingScreen />;
                            }

                            return (
                                <RxdbContext.Provider value={rxdbContext}>
                                    <Outlet />
                                </RxdbContext.Provider>
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
