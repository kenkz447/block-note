import { useCurrentUser } from '@/libs/auth';
import { Button } from '@/libs/shadcn-ui/components/button';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/libs/shadcn-ui/components/dialog';
import { Separator } from '@/libs/shadcn-ui/components/separator';
import { useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';

interface SettingsProps {
    readonly hide: () => void
}

export function Settings({ hide }: SettingsProps) {
    const { signOut } = useCurrentUser();
    const navigate = useNavigate();

    const onSignOut = useCallback(async () => {
        await signOut();
        navigate({ from: '/' });
        hide();
    }, [hide, navigate, signOut]);

    return (
        <DialogContent className="w-9/12 max-w-[1024px]">
            <DialogHeader>
                <DialogTitle>
                    Settings
                </DialogTitle>
                <DialogDescription>
                    Manage your account settings
                </DialogDescription>
            </DialogHeader>
            <Separator className="my-4" />
            <div className="grow  min-h-[512px]">
                <div className="w-[250px]">
                    <Button variant="ghost" className="w-full text-left block">Account</Button>
                    <Button variant="ghost" className="w-full text-left block">Appearance</Button>
                    <Button variant="ghost" className="w-full text-left block text-red-600 hover:text-red-600" onClick={onSignOut}>Logout</Button>
                </div>
                <div>
                </div>
            </div>
        </DialogContent>
    );
}