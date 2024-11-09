import { Entry, EntryTreeNode, useEntries } from "@/libs/rxdb"
import { InboxIcon } from "lucide-react"
import { arrayToTree } from "performant-array-to-tree"
import Tree from "rc-tree"
import React, { useEffect, useMemo, useState } from "react"
import { EntryTreeItem } from "./entry-tree-item"
import { useSearch } from "@tanstack/react-router";
import { cn } from "@/libs/shadcn-ui/utils"
import { useEntryPage } from "@/hooks/editor/use-entry-page"

interface EntryTreeProps {
    readonly search?: string
}

export function EntryTree({ search }: EntryTreeProps) {
    const { entryId } = useSearch({ from: '/' })
    const navigateToEntry = useEntryPage()
    const { update, subscribe } = useEntries()

    const [entries, setEntries] = useState<Entry[] | undefined>(undefined)
    const [openKeys, setOpenKeys] = useState<React.Key[]>(() => {
        return localStorage.getItem('openKeys')?.split(',') ?? []
    })

    const tree = useMemo(() => {
        const _tree = arrayToTree(entries ?? [], { dataField: null, parentId: 'parent' }) as EntryTreeNode[];
        return _tree;
    }, [entries])

    useEffect(() => {
        const sub = subscribe((entries) => {
            let filteredEntries = entries ?? [];
            if (!search) {
                setEntries(filteredEntries)
                return;
            }

            filteredEntries = entries.filter((entry) => {
                if (entry.type === 'folder') {
                    return true
                }

                return entry.name.toLowerCase().includes(search.toLowerCase())
            })

            filteredEntries = filteredEntries?.filter((entry) => {
                if (entry.type !== 'folder') {
                    return true
                }

                const children = filteredEntries.filter((child) => child.parent === entry.id)
                return children.length > 0
            });

            setEntries(filteredEntries)
            setOpenKeys(filteredEntries.filter((entry) => entry.type === 'folder').map((entry) => entry.id))
        });
        return () => {
            sub.unsubscribe();
        };
    }, [search, subscribe])

    useEffect(() => {
        localStorage.setItem('openKeys', openKeys.join(','))
    }, [openKeys])

    if (!entries) {
        return (
            <div className="h-[32px] px-[16px] flex items-center">
                Loading data...
            </div>
        )
    }

    const renderTreeNode = (entry: EntryTreeNode) => {
        const isActive = entryId === entry.id;

        return (
            <Tree.TreeNode
                selected={isActive}
                domRef={(e) => {
                    if (!e) return;
                    e.setAttribute('tabindex', '0');
                    e.onclick = () => {
                        if (entry.type !== 'document') {
                            return;
                        }
                        navigateToEntry(entry.id);
                    }
                }}
                key={entry.id}
                title={<EntryTreeItem entry={entry} expanded={openKeys.includes(entry.id)} />}
                isLeaf={entry.type !== 'folder'}
                className={cn('group')}
            >
                {entry.children.map(renderTreeNode)}
            </Tree.TreeNode>
        )
    }

    return (
        <div>
            <Tree
                defaultExpandAll={true}
                autoExpandParent={false}
                draggable={true}
                showLine={true}
                expandAction="click"
                expandedKeys={openKeys}
                dropIndicatorRender={() => null}
                selectedKeys={entryId ? [entryId] : []}
                onExpand={(keys) => {
                    setOpenKeys(keys)
                }}
                allowDrop={({ dropNode }) => {
                    const dropEntry = entries.find((entry) => entry.id === dropNode.key)
                    return dropEntry?.type === 'folder'
                }}
                onDrop={async (info) => {
                    const draggingEntry = entries.find((entry) => entry.id === info.dragNode.key)
                    if (!draggingEntry) {
                        return
                    }

                    const isFirstInRoot = info.dropPosition === -1;
                    if (isFirstInRoot) {
                        const rootEntries = entries.filter((entry) => entry.parent === null)
                        const firstEntry = rootEntries[0]

                        return await update(draggingEntry.id, {
                            order: firstEntry ? firstEntry.order - 1 : 0,
                            parent: null
                        })
                    }

                    const isFirstInParent = info.dropToGap === false;
                    if (isFirstInParent) {
                        const parentEntry = entries.find((entry) => entry.id === info.node.key)
                        const children = entries.filter((entry) => entry.parent === parentEntry?.id)
                        const firstChild = children[0]
                        return await update(draggingEntry.id, {
                            order: firstChild ? firstChild.order - 1 : 0,
                            parent: parentEntry?.id
                        })
                    }

                    const fromEntry = entries.find((entry) => entry.id === info.node.key)
                    if (!fromEntry) {
                        return
                    }
                    const sibling = entries.filter((entry) => entry.parent === fromEntry.parent)
                    const dropTo = sibling[info.dropPosition]

                    return await update(draggingEntry.id, {
                        order: dropTo ? (fromEntry.order + dropTo.order) / 2 : fromEntry.order + 1,
                        parent: fromEntry?.parent
                    })
                }}
            >
                {tree.map(renderTreeNode)}
            </Tree>
            {
                entries.length === 0 && (
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
    )
}
