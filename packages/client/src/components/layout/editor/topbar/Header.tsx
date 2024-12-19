import { usePageSettings } from '@writefy/client-blocksuite';
import { Button, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger, Tabs, TabsList, TabsTrigger } from '@writefy/client-shadcn';
import { LayoutDashboard, Proportions, Settings2, Sidebar, TextIcon } from 'lucide-react';
import { memo } from 'react';

interface HeaderProps {
    readonly isSidebarClose: boolean;
    readonly toggleSidebar: () => void;
}

function HeaderImpl({ isSidebarClose, toggleSidebar }: HeaderProps) {
    const { options, settings, setSettings } = usePageSettings();

    return (
        <header className="flex h-14 py-2 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                {
                    isSidebarClose && (
                        <Button variant="ghost" size="iconSm" onClick={toggleSidebar}>
                            <Sidebar />
                        </Button>
                    )
                }
                <Tabs defaultValue="page" onValueChange={(value) => { setSettings('mode', value); }}>
                    <TabsList className="h-9">
                        <TabsTrigger value="page" className="size-7">
                            <span className="flex"><TextIcon size={14} /></span>
                        </TabsTrigger>
                        <TabsTrigger value="edgeless" className="size-7">
                            <span className="flex"><LayoutDashboard size={14} /></span>
                        </TabsTrigger>
                    </TabsList >
                </Tabs>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="iconSm">
                            <Settings2 />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="start" className="min-w-[150px]">
                        <DropdownMenuLabel>View settings</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Proportions /> <span>Page width</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    {
                                        options.pageWidth.map((option, i) => (
                                            <DropdownMenuCheckboxItem key={i} checked={settings.pageWidth === option.value} onCheckedChange={() => setSettings('pageWidth', option.value)}>
                                                <span>{option.label}</span>
                                            </DropdownMenuCheckboxItem>
                                        ))
                                    }
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export const Header = memo(HeaderImpl);
