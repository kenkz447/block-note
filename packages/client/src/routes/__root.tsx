import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { PopupAlertProvider, PopupDialogProvider } from '@writefy/client-shadcn';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { AuthProvider, RxdbContext, RxdbProvider, useEventListener } from '@writefy/client-shared';
import { AuthContext } from '@writefy/client-shared';
import { ThemeProvider } from '@writefy/client-shadcn';
import { EditorSettingsContext, EditorSettingsProvider } from '@writefy/client-blocksuite';

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
                                <EditorSettingsProvider db={rxdbContext.db}>
                                    {(editorSettingsContext) => {
                                        if (!editorSettingsContext) {
                                            return <LoadingScreen />;
                                        }

                                        return (
                                            <AuthContext.Provider value={authContext}>
                                                <RxdbContext.Provider value={rxdbContext}>
                                                    <EditorSettingsContext.Provider value={editorSettingsContext}>
                                                        <PopupDialogProvider>
                                                            <PopupAlertProvider>
                                                                <Outlet />
                                                            </PopupAlertProvider>
                                                        </PopupDialogProvider>
                                                    </EditorSettingsContext.Provider>
                                                </RxdbContext.Provider>
                                            </AuthContext.Provider>
                                        );
                                    }}
                                </EditorSettingsProvider>
                            );
                        }}
                    </RxdbProvider>
                );
            }}
        </AuthProvider>
    );
}
