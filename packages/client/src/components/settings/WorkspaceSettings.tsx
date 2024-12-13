import { DialogContent } from '@writefy/client-shadcn';
import { memo, useEffect, useState } from 'react';
import { WorkspaceSettingsSidebar } from './workspace-settings/WorkspaceSettingsSidebar';
import { WorkspaceGeneralSettings } from './workspace-settings/WorkspaceGeneralSettings';
import { Project, useProjects, Workspace } from '@writefy/client-shared';
import { WorkpsaceProjectSettings } from './workspace-settings/WorkpsaceProjectSettings';

interface WorkspaceSettingsProps {
    readonly workspace: Workspace;
}

export function WorkspaceSettingsImpl({ workspace }: WorkspaceSettingsProps) {
    const { subscribe: subscribeProjects } = useProjects({
        workspaceId: workspace.id,
    });
    const [projects, setProjects] = useState<Project[]>([]);

    const [currentTab, setCurrentTab] = useState<string>('account');

    useEffect(() => {
        const subscription = subscribeProjects({}, setProjects);
        return () => {
            subscription.unsubscribe();
        };
    }, [subscribeProjects]);

    const selectedProject = projects.find((project) => project.id === currentTab);

    return (
        <DialogContent className="w-9/12 min-w-[600px] max-w-[800px] p-0">
            <div className="flex gap-4">
                <WorkspaceSettingsSidebar
                    workspace={workspace}
                    projects={projects}
                    onTabChange={setCurrentTab}
                    currentTab={currentTab}
                />
                <div className="flex flex-col items-center p-8 w-full">
                    <div className="w-full max-w-[560px]">
                        {
                            currentTab === 'account' && (
                                <WorkspaceGeneralSettings workspace={workspace} />
                            )
                        }
                        {
                            selectedProject && (
                                <WorkpsaceProjectSettings project={selectedProject} />
                            )
                        }
                    </div>
                </div>
            </div>
        </DialogContent>
    );
};

export const WorkspaceSettings = memo(WorkspaceSettingsImpl);
