import { NodeModel, RenderParams } from '@minoru/react-dnd-treeview';
import { ChevronDown, ChevronRight, FileText, Folder } from 'lucide-react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Entry } from '@writefy/client-business';
import { memo, useCallback, useState } from 'react';
import { DocNodeContextMenu } from './DocNodeContextMenu';
import { DocNodeEditable } from './DocNodeEditable';

export interface TreeNodeData {
    readonly active: boolean;
    readonly entry: Entry;
    readonly actions: {
        readonly rename: (name: string) => Promise<Entry>;
        readonly remove: () => Promise<void>;
    };
    readonly children: Entry[];
}

interface DocNodeProps {
    readonly node: NodeModel<TreeNodeData>;
    readonly params: RenderParams;
}

function DocNodeImpl({ node, params }: DocNodeProps) {
    const navigate = useNavigate();
    const { projectId, workspaceId } = useParams({
        from: '/app/editor/$workspaceId/$projectId',
    });

    const { depth, isOpen, onToggle } = params;

    const [isRenaming, setIsRenaming] = useState(false);
    const toggleRename = useCallback(() => setIsRenaming((prev) => !prev), []);
    const onExpandClick = useCallback((e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        e.stopPropagation();
        onToggle();
    }, [onToggle]);

    const icon = node.data?.children.length ? <Folder size={16} /> : <FileText size={16} />;

    const children = (
        <div
            style={{ paddingLeft: depth * 16 }}
            className="cursor-pointer mb-[2px] group flex items-center gap-2 hover:bg-sidebar-accent px-2 py-2 rounded-lg text-primary/80 data-[state=open]:bg-sidebar-accent data-[rename=true]:bg-sidebar-accent data-[active=true]:font-bold data-[active=true]:bg-sidebar-accent"
            data-rename={isRenaming}
            data-active={node.data?.active}
            onClick={() => {
                if (isRenaming) return;
                navigate({
                    to: '/app/editor/$workspaceId/$projectId/$entryId',
                    params: {
                        workspaceId,
                        projectId,
                        entryId: node.id as string
                    }
                });
            }}
        >
            {
                node.data?.children.length ? (
                    <span className="ml-2 flex items-center justify-center hover:bg-primary/10 rounded-sm h-6 w-6 text-primary/60">
                        <span onClick={onExpandClick} className="hidden group-hover:flex">
                            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </span>
                        <span className="flex group-hover:hidden">
                            {icon}
                        </span>
                    </span>
                ) : (
                    <span className="ml-2 flex">
                        {icon}
                    </span>
                )
            }
            {
                isRenaming
                    ? (
                        <DocNodeEditable
                            value={node.text}
                            onFinish={toggleRename}
                            onSubmit={node.data!.actions.rename}
                        />
                    )
                    : (
                        <span className="grow grid whitespace-nowrap overflow-hidden text-ellipsis" >
                            {node.text}
                        </span>
                    )
            }
        </div>
    );

    if (isRenaming) {
        return children;
    }

    return (
        <DocNodeContextMenu
            entry={node.data!.entry}
            onRename={toggleRename}
            onDelete={node.data!.actions.remove}
        >
            {children}
        </DocNodeContextMenu>
    );
}

export const DocNode = memo(DocNodeImpl);
