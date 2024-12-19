import { Button, Tabs, TabsList, TabsTrigger } from '@writefy/client-shadcn';
import { LayoutDashboard, Sidebar, TextIcon } from 'lucide-react';
import { memo } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

interface HeaderProps {
    readonly isSidebarClose: boolean;
    readonly toggleSidebar: () => void;
}

function HeaderImpl({ isSidebarClose, toggleSidebar }: HeaderProps) {
    const navigate = useNavigate();
    const { mode } = useSearch({
        structuralSharing: true,
        strict: false
    });

    return (
        <header className="flex h-16 py-2 px-6 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
                {
                    isSidebarClose && (
                        <Button variant="ghost" size="iconSm" onClick={toggleSidebar}>
                            <Sidebar />
                        </Button>
                    )
                }
                <Tabs
                    value={mode ?? 'page'}
                    onValueChange={(value) => {
                        navigate({
                            from: '/app/editor/$workspaceId/$projectId/$entryId',
                            search: { mode: value }
                        });
                    }}
                >
                    <TabsList className="h-9">
                        <TabsTrigger value="page" className="size-7">
                            <span className="flex"><TextIcon size={14} /></span>
                        </TabsTrigger>
                        <TabsTrigger value="edgeless" className="size-7">
                            <span className="flex"><LayoutDashboard size={14} /></span>
                        </TabsTrigger>
                    </TabsList >
                </Tabs>
            </div>
        </header>
    );
};

export const Header = memo(HeaderImpl);
