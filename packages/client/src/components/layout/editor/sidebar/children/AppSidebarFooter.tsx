import { Button } from '@writefy/client-shadcn';
import { memo, useCallback } from 'react';
import { useAuth, useCurrentUser } from '@writefy/client-shared';
import { Avatar, AvatarImage } from '@writefy/client-shadcn';
import { Settings } from 'lucide-react';
import { UserSettings } from '@/components/settings/UserSettings';
import { usePopupDialog } from '@writefy/client-shadcn';

function AppSidebarFooterImpl() {
    const currentUser = useCurrentUser();
    const { showGoogleSignIn } = useAuth();

    const { openDialog, closeDialog } = usePopupDialog();

    const showSettings = useCallback(() => {
        openDialog({
            content: <UserSettings hide={closeDialog} />
        });
    }, [closeDialog, openDialog]);

    return (
        <div className="flex flex-col p-2">
            {
                currentUser
                    ? (
                        <Button onClick={showSettings} size="lg" variant="ghost" className="w-full block p-2">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={currentUser.photoURL!} />
                                </Avatar>
                                <span className="grow text-left">
                                    {currentUser.displayName}
                                </span>
                                <Settings />
                            </div>
                        </Button>
                    )
                    : (
                        <Button variant="outline" onClick={showGoogleSignIn} className="w-full">
                            Login
                        </Button>
                    )
            }
        </div>
    );
}

export const AppSidebarFooter = memo(AppSidebarFooterImpl);
