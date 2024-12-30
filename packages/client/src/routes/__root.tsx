import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { Alert, AlertDescription, AlertTitle, PopupAlert, PopupDialog, useIsMobile } from '@writefy/client-shadcn';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { AuthProvider, RxdbProvider, useEventListener, authEvents, LocalSettingsProvider } from '@writefy/client-shared';
import { ThemeProvider } from '@writefy/client-shadcn';
import { CircleAlert } from 'lucide-react';
import { rxdbSchema } from '@writefy/client-business';
import { defaultLocalSettings, localSettingSchema } from '@/config/localSettings';
import { Suspense } from 'react';

export const Route = createRootRoute({
    component: () => (
        <ThemeProvider>
            <Initializer />
        </ThemeProvider>
    ),
});

function App({ children }: { children: React.ReactNode; }) {
    const navigate = useNavigate();

    useEventListener({
        event: authEvents.user.loggedIn,
        handler: () => navigate({ to: '/app', replace: true })
    });

    useEventListener({
        event: authEvents.user.loggedOut,
        handler: () => navigate({ to: '/', replace: true })
    });

    return children;
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
                        The app not supported on mobile devices yet
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <Suspense>
            <AuthProvider>
                {(authContext) => {
                    if (authContext.currentUser === undefined) {
                        return <LoadingScreen />;
                    }

                    const userId = authContext.currentUser?.uid ?? 'anonymous';

                    return (
                        <RxdbProvider
                            key={userId}
                            dbName={`user-${userId.toLowerCase()}`}
                            schema={rxdbSchema}
                        >
                            {(rxdbContext) => {
                                if (!rxdbContext.db) {
                                    return <LoadingScreen />;
                                }

                                return (
                                    <LocalSettingsProvider
                                        validationSchema={localSettingSchema}
                                        defaultSettings={defaultLocalSettings}
                                    >
                                        {(localSettingsContext) => {
                                            if (!localSettingsContext) {
                                                return <LoadingScreen />;
                                            }

                                            return (
                                                <App>
                                                    <Outlet />
                                                    <PopupAlert />
                                                    <PopupDialog />
                                                </App>
                                            );
                                        }}
                                    </LocalSettingsProvider>
                                );
                            }}
                        </RxdbProvider>
                    );
                }}
            </AuthProvider>
        </Suspense>
    );
}
