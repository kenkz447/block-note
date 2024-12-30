import { Button, DialogHeader, DialogTitle, Separator } from '@writefy/client-shadcn';
import { Project, Workspace } from '@writefy/client-business';
import { Dot, Settings } from 'lucide-react';

export type UserSettingsSidebarTab = string;

interface SettingSidebarProps {
    readonly workspace: Workspace;
    readonly projects: Project[];
    readonly currentTab: UserSettingsSidebarTab;
    readonly onTabChange: (tab: UserSettingsSidebarTab) => void;
}

export function WorkspaceSettingsSidebar({ workspace, projects, currentTab, onTabChange }: SettingSidebarProps) {
    return (
        <div className="flex flex-col p-4 bg-sidebar w-[250px] h-[500px]">
            <DialogHeader className=" mb-4 px-4">
                <DialogTitle className="line-clamp-1">{workspace.name}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-1 h-full">
                <div className="grow flex flex-col gap-1">
                    <Button onClick={() => onTabChange('account')} variant={currentTab === 'account' ? 'secondary' : 'ghost'} className="w-full text-left flex gap-3 justify-start">
                        <Settings /> General
                    </Button>
                    <Separator />
                    {
                        projects.map((project) => (
                            <Button key={project.id} onClick={() => onTabChange(project.id)} variant={currentTab === project.id ? 'secondary' : 'ghost'} className="w-full text-left flex gap-3 justify-start">
                                <Dot /> {project.name}
                            </Button>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}
