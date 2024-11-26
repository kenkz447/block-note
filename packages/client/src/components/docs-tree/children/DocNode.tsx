import { NodeModel, RenderParams } from '@minoru/react-dnd-treeview';
import { ChevronDown, ChevronRight, FileText, MoreVertical, PlusIcon } from 'lucide-react';
import { Link, useParams } from '@tanstack/react-router';

interface DocNodeProps {
    readonly node: NodeModel;
    readonly params: RenderParams;
}

export function DocNode({ node, params }: DocNodeProps) {
    const { projectId, workspaceId } = useParams({
        from: '/app/editor/$workspaceId/$projectId',
    });

    const { depth, isOpen, onToggle } = params;

    return (
        <div
            style={{ marginInlineStart: depth * 16 }}
            className="group flex items-center gap-2 hover:bg-sidebar-accent px-2 py-2 rounded-lg text-primary/80"
        >
            <span className="flex items-center justify-center hover:bg-gray-200 rounded-sm h-6 w-6 text-primary/60">
                <span onClick={onToggle} className="hidden group-hover:flex">
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
                <span className="flex group-hover:hidden">
                    <FileText size={16} />
                </span>
            </span>
            <Link
                to="/app/editor/$workspaceId/$projectId/$entryId"
                params={{
                    workspaceId,
                    projectId,
                    entryId: node.id as string,
                }}
                className="grow"
            >
                <span>{node.text}</span>
            </Link>
            <span className="hidden group-hover:flex text-primary/60" onClick={(e) => e.stopPropagation()}>
                <span className="flex items-center justify-center hover:bg-gray-200 rounded-sm h-6 w-6">
                    <MoreVertical size={16} />
                </span>
                <span className="flex items-center justify-center hover:bg-gray-200 rounded-sm h-6 w-6">
                    <PlusIcon size={16} />
                </span>
            </span>
        </div>
    );
}
