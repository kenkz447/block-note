import { Button, Separator } from '@writefy/client-shadcn';
import { Workspace } from '@writefy/client-shared';
import { Dot, Settings, Users } from 'lucide-react';

export type UserSettingsSidebarTab = string;

interface SettingSidebarProps {
    readonly workspace: Workspace;
    readonly currentTab: UserSettingsSidebarTab;
    readonly onTabChange: (tab: UserSettingsSidebarTab) => void;
}

export function WorkspaceSettingsSidebar({ workspace, currentTab, onTabChange }: SettingSidebarProps) {
    return (
        <div className="flex flex-col p-4 bg-sidebar w-[250px] h-[500px]">
            <p className="text-xl font-medium mb-4 px-4">
                {workspace.name}
            </p>
            <div className="flex flex-col gap-1 h-full">
                <div className="grow flex flex-col gap-1">
                    <Button onClick={() => onTabChange('account')} variant={currentTab === 'account' ? 'secondary' : 'ghost'} className="w-full text-left flex gap-3 justify-start">
                        <Settings /> General
                    </Button>
                    <Separator />
                    <Button onClick={() => onTabChange('1')} variant={currentTab === '1' ? 'secondary' : 'ghost'} className="w-full text-left flex gap-3 justify-start">
                        <Dot /> Project 1
                    </Button>
                    <Button onClick={() => onTabChange('2')} variant={currentTab === '2' ? 'secondary' : 'ghost'} className="w-full text-left flex gap-3 justify-start">
                        <Dot /> Project 2
                    </Button>
                    <Button onClick={() => onTabChange('3')} variant={currentTab === '3' ? 'secondary' : 'ghost'} className="w-full text-left flex gap-3 justify-start">
                        <Dot /> Project 3
                    </Button>
                </div>
            </div>
        </div>
    );
}
