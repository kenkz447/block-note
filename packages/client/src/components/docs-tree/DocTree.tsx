import { useCallback, useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import {
    Tree,
    MultiBackend,
    getBackendOptions,
    NodeModel,
    TreeProps
} from '@minoru/react-dnd-treeview';
import { DocNode, TreeNodeData } from './children/DocNode';
import { Entry } from '@writefy/client-shared';
import { Button } from '@writefy/client-shadcn';
import { Plus } from 'lucide-react';
import { DocNodePreview } from './children/DocNodePreview';
import { DocNodeDropPlaceHolder } from './children/DocNodeDropPlaceHolder';

interface DocTreeProps {
    readonly entries?: Entry[];
    readonly showCreateEntryForm: (type: string) => void;
    readonly showUpdateEntryForm: (entry: Entry) => void;
    readonly updateEntry: (entryId: string, data: Partial<Entry>) => Promise<unknown>;
    readonly removeEntry: (entryId: string) => Promise<void>;
}

export function DocTree({ entries, showCreateEntryForm, updateEntry, removeEntry }: DocTreeProps) {

    const [treeData, setTreeData] = useState<NodeModel<TreeNodeData>[]>();

    const entriesToTree = useCallback((entries: Entry[] | undefined): NodeModel<TreeNodeData>[] => {
        if (!entries) return [];

        const tree: NodeModel<TreeNodeData>[] = entries.map((entry) => ({
            id: entry.id,
            parent: entry.parent ?? 0,
            text: entry.name,
            data: {
                entry,
                actions: {
                    rename: async (name: string) => { await updateEntry(entry.id, { name }); },
                    remove: () => removeEntry(entry.id),
                },
                children: entries.filter((e) => e.parent === entry.id)
            },
            droppable: true
        }));

        return tree;
    }, [removeEntry, updateEntry]);

    useEffect(() => {
        const tree = entriesToTree(entries);
        setTreeData(tree);
    }, [entries, entriesToTree]);

    const handleDrop: TreeProps<TreeNodeData>['onDrop'] = useCallback(async (_tree, options) => {
        const draggingEntry = options.dragSource!.data!.entry;
        const dropEntry = options.dropTarget?.data?.entry;

        const isDropOnRoot = !dropEntry;
        const parentId = isDropOnRoot ? null : dropEntry?.id;

        const now = new Date().getTime();

        const siblings = _tree?.filter((node) => node.parent === parentId);
        const currentIndex = siblings?.findIndex((node) => node.id === draggingEntry.id);
        const prevSibling = siblings?.[currentIndex - 1];
        const nextSibling = siblings?.[currentIndex + 1];

        const prevOrder = prevSibling?.data?.entry.order;
        const nextOrder = nextSibling?.data?.entry.order;

        if (prevOrder && nextOrder) {
            await updateEntry(draggingEntry.id, {
                parent: parentId,
                order: (prevOrder + nextOrder!) / 2
            });
            return;
        }

        if (prevOrder) {
            await updateEntry(draggingEntry.id, {
                parent: parentId,
                order: prevOrder! + 1000
            });
            return;
        }

        if (nextOrder) {
            await updateEntry(draggingEntry.id, {
                parent: parentId,
                order: nextOrder! - 1000
            });
            return;
        }

        await updateEntry(draggingEntry.id, {
            parent: parentId,
            order: now
        });
    }, [updateEntry]);

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
                    <Button size="iconXs" variant="ghost" className="text-primary/50 hover:bg-primary/10" onClick={() => showCreateEntryForm('document')}>
                        <Plus size={16} />
                    </Button>
                </span>
            </div>
            <Tree
                tree={treeData}
                rootId={0}
                render={(node, params) => <DocNode node={node} params={params} />}
                dragPreviewRender={({ item }) => (
                    <DocNodePreview node={item} />
                )}
                onDrop={handleDrop}
                classes={{
                    listItem: '',
                    dropTarget: 'transition-all bg-accent rounded-lg translation',
                    placeholder: 'relative'
                }}
                sort={false}
                insertDroppableFirst={false}
                canDrop={(_tree, { dragSource, dropTargetId }) => {
                    if (dragSource?.parent === dropTargetId) {
                        return true;
                    }
                }}
                dropTargetOffset={5}
                placeholderRender={(_node, { depth }) => (
                    <DocNodeDropPlaceHolder depth={depth} />
                )}
            />
        </DndProvider>
    );
}
