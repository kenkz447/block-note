import { createRootRoute, Outlet } from '@tanstack/react-router'
import { RxdbProvider } from '@/libs/rxdb/components/RxdbProvider';
import { PopupProvider } from '@/libs/popup';
import { EditorProvider } from '@/libs/editor';
import { useCurrentUser } from '@/libs/auth';
import { AuthProvider } from '@/libs/auth/components/AuthProvider';
import { EditorBridgeProvider, RxdbBridgeProvider } from '@/libs/rxdb-bridge';
import { MasterLayout } from '@/components/layout/MasterLayout';
import { MasterLayoutMobile } from '@/components/layout/MasterLayoutMobile';
import { useIsMobile } from '@/hooks/use-mobile';
import { LoadingScreen } from '@/components/layout/LoadingScreen';

function App() {
    const isMobile = useIsMobile();

    const { currentUser } = useCurrentUser();

    if (currentUser === undefined) {
        return null;
    }

    const Layout = isMobile ? MasterLayoutMobile : MasterLayout;
    const syncEnabled = !!currentUser;

    return (
        <RxdbProvider currentUser={currentUser} sync={syncEnabled}>
            <EditorProvider currentUser={currentUser} sync={syncEnabled}>
                <RxdbBridgeProvider>
                    <EditorBridgeProvider>
                        <PopupProvider>
                            <LoadingScreen>
                                <Layout>
                                    <Outlet />
                                </Layout>
                            </LoadingScreen>
                        </PopupProvider>
                    </EditorBridgeProvider>
                </RxdbBridgeProvider>
            </EditorProvider>
        </RxdbProvider>
    )
}

export const Route = createRootRoute({
    component: () => <AuthProvider><App /></AuthProvider>,
})
