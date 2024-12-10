import { Button } from '@writefy/client-shadcn';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@writefy/client-shared';
import { LogOut, Palette, User } from 'lucide-react';
import { useCallback } from 'react';

export type UserSettingsSidebarTab = 'account' | 'appearance';

interface SettingSidebarProps {
    readonly currentTab: UserSettingsSidebarTab;
    readonly onSignOut: () => void;
    readonly onTabChange: (tab: UserSettingsSidebarTab) => void;
}

export function UserSettingsSidebar({ currentTab, onSignOut, onTabChange }: SettingSidebarProps) {
    const { signOut } = useAuth();

    const navigate = useNavigate();

    const handleSignOut = useCallback(async () => {
        await signOut();
        navigate({ from: '/' });
        onSignOut();
    }, [onSignOut, navigate, signOut]);

    return (
        <div className="flex flex-col p-4 bg-sidebar w-[250px] h-[500px]">
            <p className="text-xl font-medium mb-4 px-4">
                Settings
            </p>
            <div className="flex flex-col gap-1 h-full">
                <div className="grow flex flex-col gap-1">
                    <Button onClick={() => onTabChange('account')} variant={currentTab === 'account' ? 'secondary' : 'ghost'} className="w-full text-left flex gap-3 justify-start">
                        <User /> Account
                    </Button>
                    <Button onClick={() => onTabChange('appearance')} variant={currentTab === 'appearance' ? 'secondary' : 'ghost'} className="w-full text-left flex gap-3 justify-start">
                        <Palette /> Appearance
                    </Button>
                </div>
                <Button variant="ghost" className="w-full text-left flex gap-3 justify-start text-red-600 hover:text-red-600" onClick={handleSignOut}>
                    <LogOut /> Logout
                </Button>
            </div>
        </div>
    );
}
