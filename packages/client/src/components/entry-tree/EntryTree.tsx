import { Entry, EntryTreeNode, InsertEntryParams, useEntries } from '@writefy/client-shared';
import { FilePlus, FolderPlus, InboxIcon, Plus } from 'lucide-react';
import { arrayToTree } from 'performant-array-to-tree';
import Tree from 'rc-tree';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { EntryTreeItem } from './children/EntryTreeItem';
import { usePopupDialog, cn, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, Input } from '@writefy/client-shadcn';
import { useParams } from '@tanstack/react-router';
import { CreateEntryForm, CreateEntryValues } from '../forms/entry/CreateEntryForm';

interface EntryTreeProps {
    readonly entries?: Entry[];
}

export function EntryTree({ entries }: EntryTreeProps) {
    const { projectId, workspaceId } = useParams({
        from: '/app/editor/$workspaceId/$projectId',
    });

    const { entryId: activeEntryId } = useParams({
        strict: false
    });

    const [filteredEntries, setFilteredEntries] = useState<Entry[] | undefined>(entries);

    const [openKeys, setOpenKeys] = useState<React.Key[]>(() => {
        return localStorage.getItem('openKeys')?.split(',') ?? [];
    });

    const tree = useMemo(() => {
        const _tree = arrayToTree(filteredEntries ?? [], { dataField: null, parentId: 'parent' }) as EntryTreeNode[];
        return _tree;
    }, [filteredEntries]);

    useEffect(() => {
        let _filteredEntries = entries ?? [];
        if (!search) {
            setFilteredEntries(_filteredEntries);
            return;
        }

        _filteredEntries = _filteredEntries.filter((entry) => {
            if (entry.type === 'folder') {
                return true;
            }

            return entry.name.toLowerCase().includes(search.toLowerCase());
        });

        _filteredEntries = _filteredEntries?.filter((entry) => {
            if (entry.type !== 'folder') {
                return true;
            }

            const children = _filteredEntries.filter((child) => child.parent === entry.id);
            return children.length > 0;
        });

        setFilteredEntries(_filteredEntries);
        setOpenKeys(_filteredEntries.filter((entry) => entry.type === 'folder').map((entry) => entry.id));
    }, [entries, search]);

    useEffect(() => {
        localStorage.setItem('openKeys', openKeys.join(','));
    }, [openKeys]);

    if (!filteredEntries) {
        return (
            <div className="h-[32px] px-[16px] flex items-center">
                Loading data...
            </div>
        );
    }

    const renderTreeNode = (entry: EntryTreeNode) => {
        const isActive = activeEntryId === entry.id;

        return (
            <Tree.TreeNode
                selected={isActive}
                key={entry.id}
                title={(
                    <EntryTreeItem
                        entry={entry}
                        entryUrl={`/app/editor/${workspaceId}/${projectId}/${entry.id}`}
                        expanded={openKeys.includes(entry.id)}
                        handleEntryCreate={insert}
                        handleEntryUpdate={update}
                        handleEntryDelete={remove}
                    />
                )}
                isLeaf={entry.type !== 'folder'}
                className={cn('group')}
            >
                {entry.children.map(renderTreeNode)}
            </Tree.TreeNode>
        );
    };

    return (
        <div>

            {
                tree.length > 0 && (
                    <Tree
                        defaultExpandAll={true}
                        autoExpandParent={false}
                        draggable={true}
                        showLine={true}
                        expandAction="click"
                        expandedKeys={openKeys}
                        dropIndicatorRender={() => null}
                        selectedKeys={activeEntryId ? [activeEntryId] : []}
                        onExpand={(keys) => setOpenKeys(keys)}
                        allowDrop={({ dropNode }) => {
                            const dropEntry = filteredEntries.find((entry) => entry.id === dropNode.key);
                            return dropEntry?.type === 'folder';
                        }}
                        onDrop={async (info) => {
                            const draggingEntry = filteredEntries.find((entry) => entry.id === info.dragNode.key);
                            if (!draggingEntry) {
                                return;
                            }

                            const isFirstInRoot = info.dropPosition === -1;
                            if (isFirstInRoot) {
                                const rootEntries = filteredEntries.filter((entry) => entry.parent === null);
                                const firstEntry = rootEntries[0];

                                return await update(draggingEntry.id, {
                                    order: firstEntry ? firstEntry.order - 1 : 0,
                                    parent: null
                                });
                            }

                            const isFirstInParent = info.dropToGap === false;
                            if (isFirstInParent) {
                                const parentEntry = filteredEntries.find((entry) => entry.id === info.node.key);
                                const children = filteredEntries.filter((entry) => entry.parent === parentEntry?.id);
                                const firstChild = children[0];
                                return await update(draggingEntry.id, {
                                    order: firstChild ? firstChild.order - 1 : 0,
                                    parent: parentEntry?.id
                                });
                            }

                            const fromEntry = filteredEntries.find((entry) => entry.id === info.node.key);
                            if (!fromEntry) {
                                return;
                            }
                            const sibling = filteredEntries.filter((entry) => entry.parent === fromEntry.parent);
                            const dropTo = sibling[info.dropPosition];

                            return await update(draggingEntry.id, {
                                order: dropTo ? (fromEntry.order + dropTo.order) / 2 : fromEntry.order + 1,
                                parent: fromEntry?.parent
                            });
                        }}
                    >
                        {tree.map(renderTreeNode)}
                    </Tree>
                )
            }
            {
                (tree.length === 0 && entries?.length === 0) && (
                    <div className="flex flex-col items-center justify-center h-[50vh] gap-6 px-4">
                        <div className="flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full dark:bg-gray-800">
                            <InboxIcon className="w-12 h-12 text-gray-500 dark:text-gray-400" />
                        </div>
                        <div className="space-y-2 text-center">
                            <h2 className="text-2xl font-semibold tracking-tight">No data found</h2>
                            <p className="text-gray-500 dark:text-gray-400 line-clamp-2">
                                It looks like there's no data to display. Try adding some new items.
                            </p>
                        </div>
                    </div>
                )
            }
        </div>
    );
}
