import { DeleteEntryForm } from '@/components/forms/entry/DeleteEntryForm';
import { UpdateEntryForm, UpdateEntryValues } from '@/components/forms/entry/UpdateEntryForm';
import { usePopupDialog } from '@/libs/popup';
import { Entry, EntryTreeNode, InsertEntryParams, UpdateEntryParams } from '@/libs/rxdb';
import { Button } from '@/libs/shadcn-ui/components/button';
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator } from '@/libs/shadcn-ui/components/dropdown-menu';
import { FileText, Folder, FolderOpen, MoreHorizontal, SquarePen, Trash } from 'lucide-react';
import { useCallback } from 'react';
import { CreateEntryForm } from '../../forms/entry/CreateEntryForm';
import { cn } from '@/libs/shadcn-ui/utils';
import { Link } from '@tanstack/react-router';

interface EntryTreeItemProps {
    readonly entry: EntryTreeNode;
    readonly entryUrl: string;
    readonly expanded: boolean;
    readonly handleEntryCreate: (entry: InsertEntryParams) => Promise<Entry>;
    readonly handleEntryUpdate: (entryId: string, entry: UpdateEntryParams) => Promise<Entry>;
    readonly handleEntryDelete: (entryId: string) => Promise<void>;
}

export function EntryTreeItem({
    entry,
    entryUrl,
    expanded,
    handleEntryCreate,
    handleEntryUpdate,
    handleEntryDelete
}: EntryTreeItemProps) {
    const { openDialog, closeDialog } = usePopupDialog();

    const onCreateEntry = useCallback((type: string) => {
        const createEntry = async (formValues: Partial<Entry>) => {

            handleEntryCreate({
                type: type,
                parent: entry.id,
                name: formValues.name!
            });

            closeDialog();
        };

        openDialog({
            content: <CreateEntryForm type={type} onSubmit={createEntry} />
        });
    }, [openDialog, entry.id, closeDialog, handleEntryCreate]);

    const showUpdateForm = useCallback((entry: Entry) => {
        const updateEntry = async (formValues: UpdateEntryValues) => {
            await handleEntryUpdate(entry.id, formValues);
            closeDialog();
        };

        openDialog({
            content: <UpdateEntryForm entry={entry} onSubmit={updateEntry} />
        });
    }, [openDialog, closeDialog, handleEntryUpdate]);

    const onDeleteEntry = useCallback(async () => {
        if (entry.type === 'folder' && entry.children.length === 0) {
            await handleEntryDelete(entry.id);
            return;
        }

        const handleDelete = async () => {
            await handleEntryDelete(entry.id);
            closeDialog();
        };

        openDialog({
            content: <DeleteEntryForm entry={entry} onSubmit={handleDelete} />
        });
    }, [closeDialog, entry, handleEntryDelete, openDialog]);

    const icon = entry.type === 'folder'
        ? expanded ? <FolderOpen size={16} /> : <Folder size={16} />
        : <FileText size={16} />;

    const children = (
        <div className="flex items-center pr-2 gap-2">
            <div className="flex">{icon}</div>
            <div className="grow grid">
                <div className={cn('block whitespace-nowrap	overflow-hidden text-ellipsis')}>
                    {entry.name}
                </div>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground" variant="link" size="iconSm" >
                        <MoreHorizontal size={16} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="right" onClick={(e) => e.stopPropagation()}>
                    {
                        entry.type === 'folder' && (
                            <>
                                <DropdownMenuItem onClick={() => onCreateEntry('folder')}> <Folder />New Folder</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onCreateEntry('entry')}> <FileText />New Entry</DropdownMenuItem>
                                <DropdownMenuSeparator />
                            </>
                        )
                    }
                    <DropdownMenuItem onClick={() => showUpdateForm(entry)}> <SquarePen />Rename</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteEntry()}><Trash />Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );

    if (entry.type === 'folder') {
        return children;
    }

    return (
        <Link to={entryUrl} className="flex items-center pr-2 gap-2">
            {children}
        </Link>
    );
}
