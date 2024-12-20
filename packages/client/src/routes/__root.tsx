import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { Alert, AlertDescription, AlertTitle, PopupAlert, PopupDialogProvider, useIsMobile } from '@writefy/client-shadcn';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { AuthProvider, RxdbContext, RxdbProvider, useEventListener } from '@writefy/client-shared';
import { AuthContext, authEvents } from '@writefy/client-shared';
import { ThemeProvider } from '@writefy/client-shadcn';
import { LocalSettingsContext, LocalSettingsProvider } from '@writefy/client-shared';
import { CircleAlert } from 'lucide-react';

export const Route = createRootRoute({
    component: () => (
        <ThemeProvider>
            <Initializer />
        </ThemeProvider>
    ),
});

function App() {
    const navigate = useNavigate();

    useEventListener({
        event: authEvents.user.loggedIn,
        handler: () => navigate({ to: '/app', replace: true })
    });

    useEventListener({
        event: authEvents.user.loggedOut,
        handler: () => navigate({ to: '/', replace: true })
    });

    return <Outlet />;
}

function Initializer() {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <div className="h-screen flex flex-col justify-center items-center p-8 gap-8">
                <h1 className="text-4xl font-mono ">WRI.</h1>
                <Alert className="text-2xl">
                    <CircleAlert />
                    <AlertTitle className="!pl-10">Sorry</AlertTitle>
                    <AlertDescription className="!pl-10 text-muted-foreground">
                        the app not supported on mobile devices yet
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <AuthProvider>
            {(authContext) => {
                if (authContext.currentUser === undefined) {
                    return <LoadingScreen />;
                }

                return (
                    <RxdbProvider key={authContext.currentUser?.uid ?? 'anonymous'} currentUser={authContext.currentUser}>
                        {(rxdbContext) => {
                            if (!rxdbContext.db) {
                                return <LoadingScreen />;
                            }

                            return (
                                <LocalSettingsProvider db={rxdbContext.db}>
                                    {(editorSettingsContext) => {
                                        if (!editorSettingsContext) {
                                            return <LoadingScreen />;
                                        }

                                        return (
                                            <AuthContext.Provider value={authContext}>
                                                <RxdbContext.Provider value={rxdbContext}>
                                                    <LocalSettingsContext.Provider value={editorSettingsContext}>
                                                        <PopupDialogProvider>
                                                            <App />
                                                        </PopupDialogProvider>
                                                        <PopupAlert />
                                                    </LocalSettingsContext.Provider>
                                                </RxdbContext.Provider>
                                            </AuthContext.Provider>
                                        );
                                    }}
                                </LocalSettingsProvider>
                            );
                        }}
                    </RxdbProvider>
                );
            }}
        </AuthProvider>
    );
}
