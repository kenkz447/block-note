import { ContextMenu, ContextMenuTrigger } from '@radix-ui/react-context-menu';
import {
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
} from '@writefy/client-shadcn';
import { memo } from 'react';

interface DocNodeContextMenuProps {
    readonly children: React.ReactNode;
    readonly onRename: () => void;
}

function DocNodeContextMenuImpl(props: DocNodeContextMenuProps) {
    const { onRename } = props;

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
                <ContextMenuItem inset onClick={() => setTimeout(onRename, 0)}>
                    Rename
                </ContextMenuItem>
                <ContextMenuItem inset className="text-red-600">
                    Delete
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}

export const DocNodeContextMenu = memo(DocNodeContextMenuImpl);
