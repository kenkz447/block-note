import { Button } from "@/libs/shadcn-ui/components/button";
import { EntryTree } from "../../entry-tree/entry-tree";
import { useCurrentUser, useGoogleSignIn } from "@/libs/auth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/libs/shadcn-ui/components/dropdown-menu";
import { ChevronsUpDown, Circle, FilePlus, FileText, FolderPlus, PlusCircle } from "lucide-react";
import { usePopupDialog } from "@/libs/popup";
import { Entry, generateRxId, useEntries } from "@/libs/rxdb";
import { CreateEntryForm } from "../../forms/create-entry-form";
import { Input } from "@/libs/shadcn-ui/components/input";
import { Separator } from "@/libs/shadcn-ui/components/separator";
import { useCallback, useState } from "react";
import { Avatar, AvatarImage } from "@/libs/shadcn-ui/components/avatar";
import { Settings } from "./settings/Settings";

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
            content: <Settings hide={closeDialog}/>
        })
    }, [closeDialog, openDialog])

    return (
        <div className='h-full flex flex-col'>
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
                    <div className="px-[16px] text-xs font-medium text-sidebar-foreground/70 mb-4">
                        <Input placeholder="Search" onChange={(e) => setSearch(e.currentTarget.value)} />
                    </div>
                    <EntryTree
                        search={search}
                    />
                </div>
                <div className="p-4 flex flex-col gap-2">
                    <Separator />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="w-full flex items-center hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                                <PlusCircle />
                                <span className="inline grow text-left line-height-1">
                                    New
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                            <DropdownMenuItem onClick={() => onNewEntry('folder')}><FolderPlus /> Folder</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onNewEntry('document')}><FilePlus /> Document</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
