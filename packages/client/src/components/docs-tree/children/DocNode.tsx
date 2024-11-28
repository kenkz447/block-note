import { NodeModel, RenderParams } from '@minoru/react-dnd-treeview';
import { ChevronDown, ChevronRight, FileText, Folder, MoreVertical } from 'lucide-react';
import { Link, useParams } from '@tanstack/react-router';
import { Entry } from '@writefy/client-shared';
import { memo, useCallback, useState } from 'react';
import { Button } from '@writefy/client-shadcn';
import { DocNodeContextMenu } from './DocNodeContextMenu';
import { DocNodeEditable } from './DocNodeEditable';

export interface TreeNodeData {
    readonly entry: Entry;
    readonly actions: {
        readonly rename: (name: string) => Promise<void>;
        readonly remove: () => Promise<void>;
    };
    readonly children: Entry[];
}

interface DocNodeProps {
    readonly node: NodeModel<TreeNodeData>;
    readonly params: RenderParams;
}

function DocNodeImpl({ node, params }: DocNodeProps) {
    const { projectId, workspaceId } = useParams({
        from: '/app/editor/$workspaceId/$projectId',
    });

    const { depth, isOpen, onToggle } = params;

    const [isRenaming, setIsRenaming] = useState(false);
    const toggleRename = useCallback(() => setIsRenaming((prev) => !prev), []);

    const icon = node.data?.children.length ? <Folder size={16} /> : <FileText size={16} />;

    const children = (
        <div
            style={{ paddingLeft: depth * 16 }}
            className="group flex items-center gap-2 hover:bg-sidebar-accent px-2 py-2 rounded-lg text-primary/80 data-[state=open]:bg-sidebar-accent data-[rename=true]:bg-sidebar-accent"
            data-rename={isRenaming}
        >
            {
                node.data?.children.length ? (
                    <span className="ml-2 flex items-center justify-center hover:bg-gray-200 rounded-sm h-6 w-6 text-primary/60">
                        <span onClick={onToggle} className="hidden group-hover:flex">
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
                        <>
                            <Link
                                to="/app/editor/$workspaceId/$projectId/$entryId"
                                params={{
                                    workspaceId,
                                    projectId,
                                    entryId: node.id as string,
                                }}
                                className="grow grid"
                            >
                                <span className="whitespace-nowrap	overflow-hidden text-ellipsis">{node.text}</span>
                            </Link>
                            <span className="hidden group-hover:flex text-primary/60">
                                <Button size="iconXs" variant="ghost" className="hover:bg-gray-200">
                                    <MoreVertical size={16} />
                                </Button>
                            </span></>
                    )}
        </div>
    );

    if (isRenaming) {
        return children;
    }

    return (
        <DocNodeContextMenu
            onRename={() => setIsRenaming(true)}
        >
            {children}
        </DocNodeContextMenu>
    );
}

export const DocNode = memo(DocNodeImpl);
