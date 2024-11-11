import { DeleteEntryForm } from "@/components/forms/delete-entry-form";
import { UpdateEntryForm } from "@/components/forms/update-entry-form";
import { usePopupDialog } from "@/libs/popup";
import { Entry, EntryTreeNode, generateRxId, useEntries } from "@/libs/rxdb";
import { Button } from "@/libs/shadcn-ui/components/button";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator } from "@/libs/shadcn-ui/components/dropdown-menu";
import { FileText, Folder, FolderOpen, MoreHorizontal, SquarePen, Trash } from "lucide-react";
import { useCallback } from "react";
import { CreateEntryForm } from "../forms/create-entry-form";
import { useEntryPage } from "@/hooks/routes/useEntryPage";
import { cn } from "@/libs/shadcn-ui/utils";
import { useSearch } from "@tanstack/react-router";

interface EntryTreeItemProps {
    entry: EntryTreeNode
    expanded: boolean
}

export function EntryTreeItem({ entry, expanded }: EntryTreeItemProps) {
    const { entryId: currentEntryId } = useSearch({ from: '/' })

    const navigateToEntry = useEntryPage()

    const { openDialog, closeDialog } = usePopupDialog()

    const { insert, update, remove } = useEntries()

    const onCreateEntry = useCallback((type: string) => {
        const createEntry = async (formValues: Partial<Entry>) => {
            const newEntry = await insert({
                id: generateRxId(),
                type: type,
                parent: entry.id,
                name: formValues.name
            });

            closeDialog()
            if (type !== 'folder') {
                navigateToEntry(newEntry.id)
            }
        }

        openDialog({
            content: <CreateEntryForm type={type} onSubmit={createEntry} />
        })
    }, [openDialog, insert, entry.id, closeDialog, navigateToEntry])

    const showUpdateForm = useCallback((entry: Entry) => {
        const updateEntry = async (formValues: Partial<Entry>) => {
            await update(entry.id, {
                name: formValues.name
            });

            closeDialog()
        }

        openDialog({
            content: <UpdateEntryForm entry={entry} onSubmit={updateEntry} />
        })
    }, [openDialog, update, closeDialog])

    const onDeleteEntry = useCallback(() => {
        if (entry.type === 'folder' && entry.children.length === 0) {
            remove(entry.id)
            return;
        }

        const handleDelete = async () => {
            await remove(entry.id)
            closeDialog()
            if (entry.id === currentEntryId) {
                navigateToEntry(null)
            }
        }

        openDialog({
            content: <DeleteEntryForm entry={entry} onSubmit={handleDelete} />
        })
    }, [closeDialog, currentEntryId, entry, navigateToEntry, openDialog, remove])

    const icon = entry.type === 'folder'
        ? expanded ? <FolderOpen size={16} /> : <Folder size={16} />
        : <FileText size={16} />

    return (
        <div className="flex items-center pr-2 gap-2 ">
            <div>{icon}</div>
            <div className="grow grid">
                <div className={cn('block whitespace-nowrap	overflow-hidden text-ellipsis')}>
                    {entry.name}
                </div>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground" variant="link" size='iconSm' >
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
}
