import { DialogContent } from '@/libs/shadcn-ui/components/dialog';
import { useState } from 'react';
import { SettingSidebar, SettingTab } from './_shared/SettingSidebar';
import { AppearanceSetting } from './user-settings/AppearanceSetting';
import { AccountSetting } from './user-settings/AccountSetting';

interface UserSettingsProps {
    readonly hide: () => void;
}

export function UserSettings({ hide }: UserSettingsProps) {
    const [currentTab, setCurrentTab] = useState<SettingTab>('account');

    return (
        <DialogContent className="w-9/12 min-w-[800px] max-w-[1024px] p-0">
            <div className="flex gap-4">
                <SettingSidebar onSignOut={hide} onTabChange={setCurrentTab} currentTab={currentTab} />
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
