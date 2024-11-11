import { Button } from "@/libs/shadcn-ui/components/button";
import { EntryTree } from "../../entry-tree/EntryTree";
import { useCurrentUser, useGoogleSignIn } from "@/libs/auth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/libs/shadcn-ui/components/dropdown-menu";
import { ChevronsUpDown, Circle, FilePlus, FileText, FolderPlus, Plus, PlusSquare, SquareEqual } from "lucide-react";
import { usePopupDialog } from "@/libs/popup";
import { Entry, generateRxId, useEntries } from "@/libs/rxdb";
import { CreateEntryForm } from "../../forms/createEntryForm";
import { Input } from "@/libs/shadcn-ui/components/input";
import { useCallback, useState } from "react";
import { Avatar, AvatarImage } from "@/libs/shadcn-ui/components/avatar";
import { Settings } from "./settings/Settings";
import { Separator } from "@/libs/shadcn-ui/components/separator";

export function Sidebar() {
    const { currentUser } = useCurrentUser();
    const googleSignIn = useGoogleSignIn();

    const { openDialog, closeDialog } = usePopupDialog()
    const { insert } = useEntries()

    const [search, setSearch] = useState<string>()

    const onNewEntry = useCallback((type: string) => {
        const createEntry = async (formValues: Partial<Entry>) => {
            await insert({
                id: generateRxId(),
                type: type,
                parent: null,
                name: formValues.name
            });

            closeDialog()
        }

        openDialog({
            content: <CreateEntryForm type={type} onSubmit={createEntry} />
        })
    }, [insert, openDialog, closeDialog])

    const showSettings = useCallback(() => {
        openDialog({
            content: <Settings hide={closeDialog} />
        })
    }, [closeDialog, openDialog])

    return (
        <div className='h-full flex flex-col min-w-[255px]'>
            {
                currentUser
                    ? (
                        <Button onClick={showSettings} size="lg" variant="ghost" className="w-full block px-4 h-12 mb-4 rounded-none">
                            <div className=" flex items-center gap-2">
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
                    : (
                        <div className="h-12 px-4 flex items-center justify-center mb-4">
                            <span className="tracking-wide">D</span>
                            <span className="tracking-wide relative text-orange-600">
                                <Circle size={26} strokeWidth={1} />
                                <FileText size={16} strokeWidth={1.8} className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]" />
                            </span>
                            <span className="tracking-wide">C SPACE</span>
                        </div>
                    )
            }
            <div className="grow flex flex-col">
                <div className="grow">
                    <div className="flex gap-2 px-[16px] mb-4">
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
                    <div className="px-[16px] flex">
                        <Button variant="link" size="icon" className="block hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                            1.0.0
                        </Button>
                        <div className="grow"></div>
                    </div>
                    <EntryTree
                        search={search}
                    />
                </div>
                <div className="p-4 flex flex-col gap-2">
                    {
                        !currentUser && (
                            <Button onClick={googleSignIn} className="w-full">
                                Login
                            </Button>
                        )
                    }
                </div>
            </div>
        </div>
    )
}
