import { DialogContent } from '@writefy/client-shadcn';
import { memo, useState } from 'react';
import { WorkspaceSettingsSidebar } from './workspace-settings/WorkspaceSettingsSidebar';
import { WorkspaceGeneralSettings } from './workspace-settings/WorkspaceGeneralSettings';
import { Workspace } from '@writefy/client-shared';

interface WorkspaceSettingsProps {
    readonly workspace: Workspace;
}

export function WorkspaceSettingsImpl({ workspace }: WorkspaceSettingsProps) {
    const [currentTab, setCurrentTab] = useState<string>('account');

    return (
        <DialogContent className="w-9/12 min-w-[800px] max-w-[1024px] p-0">
            <div className="flex gap-4">
                <WorkspaceSettingsSidebar
                    workspace={workspace}
                    onTabChange={setCurrentTab}
                    currentTab={currentTab}
                />
                <div className="flex flex-col items-center p-8 w-full">
                    <div className="w-full max-w-[560px]">
                        {
                            currentTab === 'account' ? (
                                <WorkspaceGeneralSettings workspace={workspace} />
                            ) : (
                                null
                            )
                        }
                    </div>
                </div>
            </div>
        </DialogContent>
    );
};

export const WorkspaceSettings = memo(WorkspaceSettingsImpl);
