import { DialogContent } from '@/libs/shadcn-ui/components/dialog';
import { useState } from 'react';
import { SettingSidebar, SettingTab } from './SettingSidebar';
import { AppearanceSetting } from './AppearanceSetting';
import { AccountSetting } from './AccountSetting';

interface SettingsProps {
    readonly hide: () => void;
}

export function Settings({ hide }: SettingsProps) {
    const [currentTab, setCurrentTab] = useState<SettingTab>('account');

    return (
        <DialogContent className="w-9/12 min-w-[800px] max-w-[1024px] p-0">
            <div className="flex gap-4">
                <SettingSidebar onSignOut={hide} onTabChange={setCurrentTab} />
                <div className="flex flex-col items-center p-8 w-full">
                    <div className="w-[560px]">
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
