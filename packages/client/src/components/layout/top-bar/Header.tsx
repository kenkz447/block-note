import { Button } from '@/libs/shadcn-ui/components/button';
import { Sidebar } from 'lucide-react';

interface HeaderProps {
    toggleSidebar: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
    return (
        <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <Button variant="ghost" size="iconSm" onClick={toggleSidebar}>
                    <Sidebar />
                </Button>
            </div>
        </header>
    );
}
