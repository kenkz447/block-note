import { usePageSettings } from '@writefy/client-blocksuite';
import { Button, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger, Separator } from '@writefy/client-shadcn';
import { Proportions, Settings2, Sidebar } from 'lucide-react';

interface HeaderProps {
    toggleSidebar: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
    const { options, settings, setSettings } = usePageSettings();

    return (
        <header className="flex h-12 py-2 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <Button variant="ghost" size="iconSm" onClick={toggleSidebar}>
                    <Sidebar />
                </Button>
                <Separator orientation="vertical" className="h-4" />
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
