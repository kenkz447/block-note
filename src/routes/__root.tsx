import { createRootRoute, Outlet } from '@tanstack/react-router'
import { RxdbProvider } from '@/libs/rxdb/components/RxdbProvider';
import { PopupProvider } from '@/libs/popup';
import { EditorProvider } from '@/libs/editor';
import { useCurrentUser } from '@/libs/auth';
import { AuthProvider } from '@/libs/auth/components/AuthProvider';
import { MasterLayout } from '@/components/layout/MasterLayout';
import { MasterLayoutMobile } from '@/components/layout/MasterLayoutMobile';
import { useIsMobile } from '@/hooks/use-mobile';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { useRxdbContext } from '@/libs/rxdb';
import { useEditorContext } from '@/libs/editor/hooks/useEditorContext';
import { useRxdbSubscribe } from '@/hooks/subscribe/useRxdbSubscribe';
import { useDocCollectionSubscribe } from '@/hooks/subscribe/useDocCollectionSubscribe';

function Router() {
    const isMobile = useIsMobile();
    const Layout = isMobile ? MasterLayoutMobile : MasterLayout;

    const { db } = useRxdbContext();
    const { collection: docCollection } = useEditorContext();

    useRxdbSubscribe({ db, docCollection });
    useDocCollectionSubscribe({ docCollection });

    return (
        <Layout>
            <Outlet />
        </Layout>
    );
}

function App() {
    const { currentUser } = useCurrentUser();

    if (currentUser === undefined) {
        return null;
    }

    const syncEnabled = !!currentUser;

    return (
        <RxdbProvider currentUser={currentUser} sync={syncEnabled}>
            <EditorProvider currentUser={currentUser} sync={syncEnabled}>
                <PopupProvider>
                    <LoadingScreen>
                        <Router />
                    </LoadingScreen>
                </PopupProvider>
            </EditorProvider>
        </RxdbProvider>
    )
}

export const Route = createRootRoute({
    component: () => <AuthProvider><App /></AuthProvider>,
})
