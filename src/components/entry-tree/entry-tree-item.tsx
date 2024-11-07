import { DeleteEntryForm } from "@/components/forms/delete-entry-form";
import { UpdateEntryForm } from "@/components/forms/update-entry-form";
import { usePopupDialog } from "@/libs/popup";
import { Entry, EntryTreeNode, generateRxId, RxdbObserver, useRxdbContext, WithRxDoc } from "@/libs/rxdb";
import { Button } from "@/libs/shadcn-ui/components/button";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator } from "@/libs/shadcn-ui/components/dropdown-menu";
import { FileText, Folder, FolderOpen, MoreHorizontal, SquarePen, Trash } from "lucide-react";
import { useCallback } from "react";
import { CreateEntryForm } from "../forms/create-entry-form";
import { useEntryPage } from "@/hooks/editor/use-entry-page";
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

    const rxdbContext = useRxdbContext()
    const { entries: entriesCollection } = rxdbContext.db.collections

    const onCreateEntry = useCallback((type: string) => {
        const createEntry = async (formValues: Partial<Entry>) => {
            const now = new Date();

            const newEntry = await entriesCollection.insert({
                id: generateRxId(),
                type: type,
                name: formValues.name,
                parent: entry.id,
                order: now.getTime(),
                createdAt: now.toISOString(),
            });

            closeDialog()
            navigateToEntry(newEntry.id)
        }

        openDialog({
            content: <CreateEntryForm type={type} onSubmit={createEntry} />
        })
    }, [openDialog, entriesCollection, entry.id, closeDialog, navigateToEntry])

    const showUpdateForm = useCallback((entry: WithRxDoc<Entry>) => {
        const updateEntry = async (formValues: Partial<Entry>) => {
            await entry._doc.update({
                $set: {
                    name: formValues.name
                }
            });

            closeDialog()
        }

        openDialog({
            content: <UpdateEntryForm entry={entry} onSubmit={updateEntry} />
        })
    }, [openDialog, closeDialog])

    const onDeleteEntry = useCallback(() => {
        if (entry.children.length === 0) {
            entry._doc.remove()
            return;
        }

        const handleDelete = async () => {
            await entry._doc.remove()
            closeDialog()
            if (entry.id === currentEntryId) {
                navigateToEntry(null)
            }
        }

        openDialog({
            content: <DeleteEntryForm entry={entry} onSubmit={handleDelete} />
        })
    }, [closeDialog, currentEntryId, entry, navigateToEntry, openDialog])

    const icon = entry.type === 'folder'
        ? expanded ? <FolderOpen size={16} /> : <Folder size={16} />
        : <FileText size={16} />

    return (
        <div className="h-[32px] flex items-center pr-2 gap-2">
            <div>{icon}</div>
            <div className="grow grid">
                <div className={cn('block whitespace-nowrap	overflow-hidden text-ellipsis')}>
                    <RxdbObserver doc={entry._doc} field="name" defaultValue={`New ${entry.type}`} />
                </div>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="opacity-0 group-hover:opacity-100" variant="link" size='iconSm' >
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
