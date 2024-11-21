import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { PopupProvider } from '@writefy/client-shadcn';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { AuthProvider, RxdbContext, RxdbProvider, useEventListener } from '@writefy/client-shared';
import { AuthContext } from '@writefy/client-shared';
import { ThemeProvider } from '@writefy/client-shadcn';

export const Route = createRootRoute({
    component: () => (
        <ThemeProvider>
            <AppRoot />
        </ThemeProvider>
    ),
});

function AppRoot() {
    const navigate = useNavigate();

    useEventListener({
        event: 'AUTH:LOGGED_IN',
        handler: () => navigate({ to: '/app', replace: true })
    });

    useEventListener({
        event: 'AUTH:LOGGED_OUT',
        handler: () => navigate({ to: '/', replace: true })
    });

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
                                        <PopupProvider>
                                            <Outlet />
                                        </PopupProvider>
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
