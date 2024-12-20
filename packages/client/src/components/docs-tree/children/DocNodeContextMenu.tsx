import { events } from '@/config/events';
import {
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    AlertDialogTitle,
    ContextMenu,
    ContextMenuTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
    usePopupAlert
} from '@writefy/client-shadcn';
import { Entry, useEventEmitter } from '@writefy/client-shared';
import { memo, useCallback } from 'react';

interface DocNodeContextMenuProps {
    readonly entry: Entry;
    readonly children: React.ReactNode;
    readonly onRename: () => void;
    readonly onDelete: () => Promise<void>;
}

function DocNodeContextMenuImpl({ entry, children, onRename, onDelete }: DocNodeContextMenuProps) {
    const { openAlert } = usePopupAlert();

    const emitShowEntryForm = useEventEmitter(events.ui.entryForm.show);
    const emitEntryRemoved = useEventEmitter(events.data.entry.removed);

    const handleDelete = useCallback(async () => {
        await onDelete();
        emitEntryRemoved({
            id: entry.id
        });
    }, [onDelete, emitEntryRemoved, entry.id]);

    const showDeleteAlert = () => {
        openAlert({
            content: (
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete page</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription>
                        Are you sure you want to delete this page?
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            )
        });
    };

    const handleAddPageClick = useCallback(() => {
        emitShowEntryForm({
            type: 'page',
            parent: entry.id
        });
    }, [emitShowEntryForm, entry.id]);


    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                {children}
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64">
                <ContextMenuItem inset onClick={handleAddPageClick} >
                    Add page
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem inset onClick={onRename}>
                    Rename
                </ContextMenuItem>
                <ContextMenuItem inset className="text-red-600" onClick={showDeleteAlert}>
                    Delete
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}

export const DocNodeContextMenu = memo(DocNodeContextMenuImpl);
