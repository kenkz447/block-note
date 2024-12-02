import {
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    AlertDialog,
    AlertDialogTitle,
    ContextMenu,
    ContextMenuTrigger,
    AlertDialogContent,
    AlertDialogTrigger,
    AlertDialogHeader,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction
} from '@writefy/client-shadcn';
import { memo } from 'react';

interface DocNodeContextMenuProps {
    readonly children: React.ReactNode;
    readonly onRename: () => void;
    readonly onDelete: () => void;
}

function DocNodeContextMenuImpl(props: DocNodeContextMenuProps) {
    const { onRename, onDelete } = props;

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
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <ContextMenuItem inset className="text-red-600" onClick={onDelete}>
                            Delete
                        </ContextMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                account and remove your data from our servers.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </ContextMenuContent>
        </ContextMenu>
    );
}

export const DocNodeContextMenu = memo(DocNodeContextMenuImpl);
