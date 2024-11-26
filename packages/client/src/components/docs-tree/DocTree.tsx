import { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import {
    Tree,
    MultiBackend,
    getBackendOptions,
    NodeModel
} from '@minoru/react-dnd-treeview';
import { DocNode } from './children/DocNode';
import { Entry } from '@writefy/client-shared';
import { Button } from '@writefy/client-shadcn';
import { Plus } from 'lucide-react';

interface DocTreeProps {
    readonly entries?: Entry[];
    readonly onAddEntry: (type: string) => void;
}

const entriesToTree = (entries: Entry[] | undefined): NodeModel<Entry>[] => {
    if (!entries) return [];

    const treeData: NodeModel<Entry>[] = entries.map((entry) => ({
        id: entry.id,
        parent: entry.parent ?? 0,
        text: entry.name,
        data: entry
    }));

    return treeData;
};

export function DocTree({ entries, onAddEntry }: DocTreeProps) {

    const [treeData, setTreeData] = useState<NodeModel<Entry>[]>();

    useEffect(() => {
        const tree = entriesToTree(entries);
        setTreeData(tree);
    }, [entries]);

    const handleDrop = (newTree) => {
        setTreeData(newTree);
    };

    if (!treeData) {
        return null;
    }

    return (
        <DndProvider backend={MultiBackend} options={getBackendOptions()}>
            <div
                className="group flex items-center gap-2 hover:bg-sidebar-accent px-2 py-2 rounded-lg"
            >
                <span className="grow font-medium text-primary/60">Pages</span>
                <span className="hidden group-hover:flex">
                    <Button size="iconXs" variant="ghost" className="text-primary/50 hover:bg-gray-200" onClick={() => onAddEntry('document')}>
                        <Plus size={16} />
                    </Button>
                </span>
            </div>
            <Tree
                tree={treeData}
                rootId={0}
                render={(node, params) => <DocNode node={node} params={params} />}
                dragPreviewRender={(monitorProps) => (
                    <div>{monitorProps.item.text}</div>
                )}
                onDrop={handleDrop}
            />
        </DndProvider>
    );
}
