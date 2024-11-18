import { useCallback, useState } from 'react';
import { Header } from './top-bar/Header';
import { Sheet, SheetContent } from '@/libs/shadcn-ui/components/sheet';
import { AppSidebar } from './sidebar/AppSidebar';

export function MasterLayoutMobile({ children }: React.PropsWithChildren) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = useCallback(() => {
        setSidebarOpen(!sidebarOpen);
    }, [sidebarOpen]);

    return (
        <div>
            <Sheet open={sidebarOpen} onOpenChange={toggleSidebar}>
                <SheetContent side="left" className="p-0">
                    <AppSidebar />
                </SheetContent>
            </Sheet>
            <Header toggleSidebar={toggleSidebar} />
            {children}
        </div>
    );
}