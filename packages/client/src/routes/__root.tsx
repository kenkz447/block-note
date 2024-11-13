import { createRootRoute, Outlet } from '@tanstack/react-router';
import { RxdbProvider } from '@/libs/rxdb/components/RxdbProvider';
import { PopupProvider } from '@/libs/popup';
import { EditorProvider } from '@/libs/editor';
import { AuthProvider } from '@/libs/auth/components/AuthProvider';
import { MasterLayout } from '@/components/layout/MasterLayout';
import { MasterLayoutMobile } from '@/components/layout/MasterLayoutMobile';
import { useIsMobile } from '@/hooks/layout/useMobile';
import { useRxdb } from '@/libs/rxdb';
import { useDocCollection } from '@/libs/editor/hooks/useDocCollection';
import { useRxdbSubscribe } from '@/hooks/subscribe/useRxdbSubscribe';
import { useDocCollectionSubscribe } from '@/hooks/subscribe/useDocCollectionSubscribe';
import { ContextProvider } from '@/components/ContextProvider';
import { LoadingScreen } from '@/components/layout/LoadingScreen';

function Router() {
    const isMobile = useIsMobile();
    const Layout = isMobile ? MasterLayoutMobile : MasterLayout;

    const db = useRxdb();
    const docCollection = useDocCollection();

    useRxdbSubscribe({ db, docCollection });
    useDocCollectionSubscribe({ docCollection });

    return (
        <Layout>
            <Outlet />
        </Layout>
    );
}

function App() {
    return (
        <PopupProvider>
            <Router />
        </PopupProvider>
    );
}

export const Route = createRootRoute({
    component: () => (
        <AuthProvider>
            {(authContext) => {
                const { currentUser } = authContext;

                if (currentUser === undefined) {
                    return <LoadingScreen />;
                }

                const syncEnabled = !!currentUser;

                return (
                    <RxdbProvider currentUser={currentUser} sync={syncEnabled}>
                        {(rxdbContext) => {
                            if (!rxdbContext.db) {
                                return <LoadingScreen />;
                            }

                            return (
                                <EditorProvider db={rxdbContext.db} currentUser={currentUser} sync={syncEnabled}>
                                    {(editorContext) => {
                                        if (!editorContext.collection) {
                                            return <LoadingScreen />;
                                        }

                                        return (
                                            <ContextProvider
                                                authContext={authContext}
                                                rxdbContext={rxdbContext}
                                                editorContext={editorContext}
                                            >
                                                <App />
                                            </ContextProvider>
                                        );
                                    }}
                                </EditorProvider>
                            )
                        }}
                    </RxdbProvider>
                );
            }}
        </AuthProvider>
    ),
});
