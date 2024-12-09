import { NodeModel } from '@minoru/react-dnd-treeview';
import { FileText, Folder } from 'lucide-react';
import { Link, useParams } from '@tanstack/react-router';
import { TreeNodeData } from './DocNode';
import { memo } from 'react';

interface DocNodePreviewProps {
    readonly node: NodeModel<TreeNodeData>;
}

function DocNodePreviewImpl({ node }: DocNodePreviewProps) {
    const { projectId, workspaceId } = useParams({
        from: '/app/editor/$workspaceId/$projectId',
    });

    return (
        <div className="bg-primary/50 text-primary-foreground/80 max-w-[150px] group flex items-center gap-2 px-2 py-2 rounded-lg ">
            <span className="flex items-center justify-center rounded-sm h-6 w-6">
                <span className="flex group-hover:hidden">
                    {node.data?.children.length ? <Folder size={16} /> : <FileText size={16} />}
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
        </div>
    );
}

export const DocNodePreview = memo(DocNodePreviewImpl);
