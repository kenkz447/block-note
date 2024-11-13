import { useCurrentUser } from '@/libs/auth';
import { Button } from '@/libs/shadcn-ui/components/button';
import { useNavigate } from '@tanstack/react-router';
import { LogOut, Palette, User } from 'lucide-react';
import { useCallback } from 'react';

export type SettingTab = 'account' | 'appearance';

interface SettingSidebarProps {
    readonly onSignOut: () => void;
    readonly onTabChange: (tab: SettingTab) => void;
}

export function SettingSidebar({ onSignOut, onTabChange }: SettingSidebarProps) {

    const { signOut } = useCurrentUser();

    const navigate = useNavigate();

    const handleSignOut = useCallback(async () => {
        await signOut();
        navigate({ from: '/' });
        onSignOut();
    }, [onSignOut, navigate, signOut]);

    return (
        <div className="p-4 bg-sidebar w-[200px] h-[500px]">
            <p className="text-xl font-medium mb-4 px-4">
                Settings
            </p>
            <div>
                <Button onClick={() => onTabChange('account')} variant="ghost" className="w-full text-left flex gap-3 justify-start">
                    <User /> Account
                </Button>
                <Button onClick={() => onTabChange('appearance')} variant="ghost" className="w-full text-left flex gap-3 justify-start">
                    <Palette /> Appearance
                </Button>
                <Button variant="ghost" className="w-full text-left flex gap-3 justify-start text-red-600 hover:text-red-600" onClick={handleSignOut}>
                    <LogOut /> Logout
                </Button>
            </div>
        </div>
    );
}
