import { createRootRoute, Outlet } from '@tanstack/react-router'
import { RxdbProvider } from '@/libs/rxdb/components/RxdbProvider';
import { PopupProvider } from '@/libs/popup';
import { EditorProvider } from '@/libs/editor';
import { useCurrentUser } from '@/libs/auth';
import { RxdbSyncProvider } from '@/libs/rxdb-sync';
import { AuthProvider } from '@/libs/auth/components/AuthProvider';
import { EditorBridgeProvider, RxdbBridgeProvider } from '@/libs/rxdb-bridge';
import { MasterLayout } from '@/components/layout/MasterLayout';
import { MasterLayoutMobile } from '@/components/layout/MasterLayoutMobile';
import { useIsMobile } from '@/hooks/use-mobile';

function App() {
    const isMobile = useIsMobile();

    const { currentUser } = useCurrentUser();

    if (currentUser === undefined) {
        return null;
    }

    const Layout = isMobile ? MasterLayoutMobile : MasterLayout;

    return (
        <RxdbProvider>
            <RxdbSyncProvider>
                <EditorProvider>
                    <RxdbBridgeProvider>
                        <EditorBridgeProvider>
                            <PopupProvider>
                                <Layout>
                                    <Outlet />
                                </Layout>
                            </PopupProvider>
                        </EditorBridgeProvider>
                    </RxdbBridgeProvider>
                </EditorProvider>
            </RxdbSyncProvider>
        </RxdbProvider>
    )
}

export const Route = createRootRoute({
    component: () => <AuthProvider><App /></AuthProvider>,
})
