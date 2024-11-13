import { Button } from '@/libs/shadcn-ui/components/button';
import { EntryTree } from '../../entry-tree/EntryTree';
import { useCurrentUser, useGoogleSignIn } from '@/libs/auth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/libs/shadcn-ui/components/dropdown-menu';
import { ChevronsUpDown, FilePlus, FolderPlus, Layers, Plus, SquareEqual } from 'lucide-react';
import { usePopupDialog } from '@/libs/popup';
import { Entry, generateRxId, useEntries } from '@/libs/rxdb';
import { CreateEntryForm } from '../../forms/entry/CreateEntryForm';
import { Input } from '@/libs/shadcn-ui/components/input';
import { useCallback, useState } from 'react';
import { Avatar, AvatarImage } from '@/libs/shadcn-ui/components/avatar';
import { Settings } from './settings/Settings';
import { Separator } from '@/libs/shadcn-ui/components/separator';

export function AppSidebar() {
    const { currentUser } = useCurrentUser();
    const googleSignIn = useGoogleSignIn();

    const { openDialog, closeDialog } = usePopupDialog();
    const { insert } = useEntries();

    const [search, setSearch] = useState<string>();

    const onNewEntry = useCallback((type: string) => {
        const createEntry = async (formValues: Partial<Entry>) => {
            await insert({
                id: generateRxId(),
                type: type,
                parent: null,
                name: formValues.name
            });

            closeDialog();
        };

        openDialog({
            content: <CreateEntryForm type={type} onSubmit={createEntry} />
        });
    }, [insert, openDialog, closeDialog]);

    const showSettings = useCallback(() => {
        openDialog({
            content: <Settings hide={closeDialog} />
        });
    }, [closeDialog, openDialog]);

    return (
        <div className="h-full flex flex-col bg-sidebar gap-2 text-sidebar-foreground">
            <div className="p-2 flex justify-center items-center tracking-wide">
                {
                    !currentUser
                        ? (

                            <span className="font-mono ">
                                <span className=" text-orange-600 font-bold">W</span>
                                <span className="font-mono ">ritefy</span>
                            </span>
                        )
                        : (
                            <Button variant="ghost" className="w-full block p-2 h-12">
                                <div className="flex items-center gap-2">
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        <Layers />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">
                                            Default project
                                        </span>
                                        <span className="truncate text-xs">
                                            Untitled version
                                        </span>
                                    </div>
                                </div>
                            </Button>
                        )
                }
            </div>
            <div className="grow flex flex-col">
                <div className="flex gap-2 px-[16px] mb-2">
                    <Input placeholder="Search" onChange={(e) => setSearch(e.currentTarget.value)} />
                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="text-sidebar-foreground/70 hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                                    <Plus />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="right" align="start" className="w-[150px]">
                                <DropdownMenuItem onClick={() => onNewEntry('version')}><SquareEqual />New Version</DropdownMenuItem>
                                <Separator />
                                <DropdownMenuItem onClick={() => onNewEntry('folder')}><FolderPlus />New Folder</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onNewEntry('document')}><FilePlus />New Document</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <EntryTree
                    search={search}
                />
            </div>
            <div className="flex flex-col p-2">
                {
                    !currentUser && (
                        <Button variant="outline" onClick={googleSignIn} className="w-full">
                            Login
                        </Button>
                    )
                }
                {
                    currentUser
                    && (
                        <Button onClick={showSettings} size="lg" variant="ghost" className="w-full block p-2">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={currentUser.photoURL!} />
                                </Avatar>
                                <span className="grow text-left">
                                    {currentUser.displayName}
                                </span>
                                <ChevronsUpDown />
                            </div>
                        </Button>
                    )
                }
            </div>
        </div>
    );
}
