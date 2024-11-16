import { Button } from '@/libs/shadcn-ui/components/button';
import { EntryTree } from '../../entry-tree/EntryTree';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/libs/shadcn-ui/components/dropdown-menu';
import { FilePlus, FolderPlus, Plus } from 'lucide-react';
import { usePopupDialog } from '@/libs/popup';
import { Entry, generateRxId, useEntries } from '@/libs/rxdb';
import { CreateEntryForm } from '../../forms/entry/CreateEntryForm';
import { Input } from '@/libs/shadcn-ui/components/input';
import { useCallback, useState } from 'react';

export function AppSidebar() {
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

    return (
        <div className="h-full flex flex-col bg-sidebar gap-2 text-sidebar-foreground">
            <div className="grow flex flex-col">
                <div className="flex gap-2 px-2 my-2">
                    <Input placeholder="Search" onChange={(e) => setSearch(e.currentTarget.value)} />
                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="text-sidebar-foreground/70 hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                                    <Plus />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="right" align="start" className="w-[150px]">
                                <DropdownMenuItem onClick={() => onNewEntry('folder')}><FolderPlus />New Folder</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onNewEntry('document')}><FilePlus />New Document</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="px-2">
                    <EntryTree
                        search={search}
                    />
                </div>
            </div>
            <div className="flex flex-col p-2">
                <Button variant="outline" onClick={() => alert('sign in')} className="w-full">
                    Login
                </Button>
            </div>
        </div>
    );
}
