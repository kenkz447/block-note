import { Button } from '@/libs/shadcn-ui/components/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/libs/shadcn-ui/components/dropdown-menu';
import { ArrowLeftRight, ChevronsUpDown, Layers, Plus } from 'lucide-react';
import { Project, Workspace } from '@/libs/rxdb';
import { CreateProjectForm } from '@/components/forms/project/CreateProjectForm';
import { useProjects } from '@/libs/rxdb/hooks/orm/useProjects';
import { useNavigate } from '@tanstack/react-router';
import { usePopupDialog } from '@/libs/popup';
import { useCallback } from 'react';

interface AppSidebarHeaderProps {
    readonly workspace: Workspace;
    readonly projects?: Project[];
    readonly activeProject?: Project;
}

export function AppSidebarHeader({ workspace, projects, activeProject }: AppSidebarHeaderProps) {
    const navigate = useNavigate();
    const { openDialog, closeDialog } = usePopupDialog();

    const { insert: insertProject } = useProjects({
        workspaceId: workspace.id
    });

    const onNewProject = useCallback(() => {
        openDialog({
            content: (
                <CreateProjectForm
                    onSubmit={async (formValues) => {
                        const newProject = await insertProject({
                            name: formValues.name
                        });

                        closeDialog();
                        navigate({
                            to: '/editor/$workspaceId/$projectId',
                            params: {
                                workspaceId: workspace.id,
                                projectId: newProject.id
                            }
                        });
                    }}
                />
            )
        });
    }, [closeDialog, insertProject, navigate, openDialog, workspace.id]);

    return (
        <div className="p-2 flex justify-center items-center tracking-wide">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full block p-2 h-12 data-[state=open]:bg-sidebar-accent">
                        <div className="flex items-center gap-2">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <Layers />
                            </div >
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">
                                    {workspace.name ?? 'Your Workspace'}
                                </span>
                                <span className="truncate text-xs text-primary/50">
                                    {activeProject?.name ?? 'No project selected'}
                                </span>
                            </div>
                            <ChevronsUpDown />
                        </div >
                    </Button >
                </DropdownMenuTrigger >
                <DropdownMenuContent side="right" align="start" className="w-[150px]">
                    <DropdownMenuItem className="font-medium">
                        <Layers /> {workspace.name}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {
                        projects?.map((project) => (
                            <DropdownMenuCheckboxItem
                                checked={activeProject?.id === project.id}
                                key={project.id}
                                onClick={() => navigate({
                                    to: '/editor/$workspaceId/$projectId',
                                    params: {
                                        workspaceId: workspace.id,
                                        projectId: project.id
                                    }
                                })}
                            >
                                {project.name}
                            </DropdownMenuCheckboxItem>
                        ))
                    }
                    {
                        !!projects?.length && (
                            <DropdownMenuSeparator />
                        )
                    }
                    <DropdownMenuItem className="text-foreground/70" onClick={onNewProject}>
                        <Plus /> Create Project
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-foreground/70" onClick={() => navigate({ to: '/workspaces' })}>
                        <ArrowLeftRight /> Switch Workspace
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu >
        </div>
    );
}
