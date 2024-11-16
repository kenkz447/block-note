import { createRootRoute, Outlet } from '@tanstack/react-router';
import { RxdbProvider } from '@/libs/rxdb/components/RxdbProvider';
import { PopupProvider } from '@/libs/popup';
import { EditorProvider } from '@/libs/editor';
import { useRxdb } from '@/libs/rxdb';
import { useDocCollection } from '@/libs/editor/hooks/useDocCollection';
import { useRxdbSubscribe } from '@/hooks/subscribe/useRxdbSubscribe';
import { useDocCollectionSubscribe } from '@/hooks/subscribe/useDocCollectionSubscribe';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { RxdbContext } from '@/libs/rxdb/rxdbContexts';
import { EditorContext } from '@/libs/editor/editorContext';
import { ThemeProvider } from '@writefy/client-shared';

function Router() {

    const db = useRxdb();
    const docCollection = useDocCollection();

    useRxdbSubscribe({ db, docCollection });
    useDocCollectionSubscribe({ docCollection });

    return (
        <Outlet />
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
        <ThemeProvider>
            <RxdbProvider
                currentUser={null}
                sync={false}
            >
                {(rxdbContext) => {
                    if (!rxdbContext.db) {
                        return <LoadingScreen />;
                    }

                    return (
                        <EditorProvider db={rxdbContext.db}>
                            {(editorContext) => {
                                if (!editorContext.collection) {
                                    return <LoadingScreen />;
                                }

                                return (
                                    <RxdbContext.Provider value={rxdbContext}>
                                        <EditorContext.Provider value={editorContext}>
                                            <App />
                                        </EditorContext.Provider>
                                    </RxdbContext.Provider>

                                );
                            }}
                        </EditorProvider>
                    );
                }}
            </RxdbProvider>
        </ThemeProvider>
    ),
});
