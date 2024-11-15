import { useEffect } from 'react';
import { Button } from '@/libs/shadcn-ui/components/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/libs/shadcn-ui/components/dropdown-menu';
import { Layers, Plus } from 'lucide-react';

import { useProjects } from '@/libs/rxdb/hooks/orm/useProjects';
import { useCurrentWorkspace } from '@/hooks/state/useCurrentWorkspace';
import { useCurrentProject } from '@/hooks/state/useCurrentProject';

export function AppSidebarHeader() {
    const currentWorkspace = useCurrentWorkspace();
    const currentProject = useCurrentProject();

    const { subscribe: subscribeProjects } = useProjects();

    useEffect(() => {
    }, [subscribeProjects]);

    if (!currentWorkspace) {
        return (
            <div className="h-12 flex items-center justify-center">
                <span className="font-mono">
                    <span className="font-bold">Writefy</span>
                </span>
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full block p-2 h-12">
                    <div className="flex items-center gap-2">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                            <Layers />
                        </div >
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">
                                {currentWorkspace.name ?? 'Your Workspace'}
                            </span>
                            <span className="truncate text-xs">
                                {currentProject?.name ?? 'No project selected'}
                            </span>
                        </div>
                    </div >
                </Button >
            </DropdownMenuTrigger >
            <DropdownMenuContent side="right" align="start" className="w-[150px]">
                <DropdownMenuLabel>My projects</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                    Untitled project
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-foreground/70">
                    <Plus /> New
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu >
    );
}
