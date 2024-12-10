import { DialogContent } from '@writefy/client-shadcn';
import { useState } from 'react';
import { AppearanceSetting } from './user-settings/AppearanceSetting';
import { AccountSetting } from './user-settings/AccountSetting';
import { UserSettingsSidebar, UserSettingsSidebarTab } from './user-settings/UserSettingsSidebar';

interface UserSettingsProps {
    readonly hide: () => void;
}

export function UserSettings({ hide }: UserSettingsProps) {
    const [currentTab, setCurrentTab] = useState<UserSettingsSidebarTab>('account');

    return (
        <DialogContent className="w-9/12 min-w-[800px] max-w-[1024px] p-0">
            <div className="flex gap-4">
                <UserSettingsSidebar onSignOut={hide} onTabChange={setCurrentTab} currentTab={currentTab} />
                <div className="flex flex-col items-center p-8 w-full">
                    <div className="w-full max-w-[560px]">
                        {
                            currentTab === 'account' ? (
                                <AccountSetting />
                            ) : (
                                <AppearanceSetting />
                            )
                        }
                    </div>
                </div>
            </div>
        </DialogContent>
    );
}
