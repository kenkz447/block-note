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
import { useEventEmitter } from '@writefy/client-shared';
import { memo, useCallback } from 'react';

interface DocNodeContextMenuProps {
    readonly children: React.ReactNode;
    readonly onRename: () => void;
    readonly onDelete: () => Promise<void>;
}

function DocNodeContextMenuImpl(props: DocNodeContextMenuProps) {
    const { onRename, onDelete } = props;
    const { openAlert } = usePopupAlert();

    const emitEntryRemoved = useEventEmitter('DATA@ENTRY:REMOVED');

    const handleDelete = useCallback(async () => {
        await onDelete();
        emitEntryRemoved();
    }, [onDelete, emitEntryRemoved]);

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

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                {props.children}
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64">
                <ContextMenuItem inset>
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
