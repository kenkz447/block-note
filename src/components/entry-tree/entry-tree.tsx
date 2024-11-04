import { usePopupDialog } from "@/libs/popup"
import { Entry, EntryTreeNode, generateRxId, useRxdbContext, WithRxDoc } from "@/libs/rxdb"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "@/libs/shadcn-ui/components/dropdown-menu"
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { FilePlus, FolderPlus, Plus, TriangleAlert } from "lucide-react"
import { arrayToTree } from "performant-array-to-tree"
import Tree from "rc-tree"
import React, { useEffect, useState } from "react"
import { RxDocument } from "rxdb"
import { firstBy } from "thenby"
import { CreateEntryForm } from "@/components/forms/create-entry-form"
import { EntryTreeItem } from "./entry-tree-item"

export function EntryTree() {
    const rxdbContext = useRxdbContext()

    const { entries: entriesCollection } = rxdbContext.db.collections

    const [entries, setEntries] = useState<WithRxDoc<Entry>[] | undefined>(undefined)
    const [openKeys, setOpenKeys] = useState<React.Key[]>([])


    useEffect(() => {
        const fetchEntries = async () => {
            const entriesData = await entriesCollection.find().exec() as RxDocument<Entry>[]

            const sortedEntries = entriesData.sort(
                firstBy<RxDocument>((a, b) => {
                    const aId = a.get('order')
                    const bId = b.get('order')
                    return aId < bId ? -1 : aId > bId ? 1 : 0
                })
                    .thenBy((a, b) => {
                        const aName = a.get('createdAt')
                        const bName = b.get('createdAt')
                        return aName < bName ? -1 : aName > bName ? 1 : 0
                    })
            )

            setEntries(sortedEntries.map((doc) => {
                return {
                    id: doc.get('id'),
                    type: doc.get('type'),
                    name: doc.get('name'),
                    order: doc.get('order'),
                    parent: doc.get('parent'),
                    createdAt: doc.get('createdAt'),
                    _doc: doc
                }
            }))
        }

        fetchEntries()

        const subscription = entriesCollection.$.subscribe(fetchEntries)

        return () => {
            subscription.unsubscribe()
        }

    }, [entriesCollection])

    const { openDialog, closeDialog } = usePopupDialog()

    const onNewEntry = (type: string) => {
        const createEntry = async (formValues: Partial<Entry>) => {
            const now = new Date();

            await entriesCollection.insert({
                id: generateRxId(),
                type: type,
                name: formValues.name,
                order: now.getTime(),
                createdAt: now.toISOString(),
            });

            closeDialog()
        }

        openDialog({
            content: <CreateEntryForm type={type} onSubmit={createEntry} />
        })
    }

    if (!entries) {
        return (
            <div className="h-[32px] px-[16px] flex items-center">
                Loading data...
            </div>
        )
    }

    const tree = arrayToTree(entries, { dataField: null, parentId: 'parent' }) as EntryTreeNode[]

    const renderTreeNode = (entry: EntryTreeNode) => {
        return (
            <Tree.TreeNode
                domRef={(e) => {
                    e?.setAttribute('tabindex', '0');
                }}
                key={entry.id}
                title={<EntryTreeItem entry={entry} expanded={openKeys.includes(entry.id)} />}
                isLeaf={entry.type !== 'folder'}
                className="group"
            >
                {entry.children.map(renderTreeNode)}
            </Tree.TreeNode>
        )
    }

    return (
        <Tree
            defaultExpandAll={true}
            autoExpandParent={false}
            draggable={true}
            showLine={true}
            expandAction="click"
            expandedKeys={openKeys}
            dropIndicatorRender={() => null}
            onExpand={(keys) => {
                setOpenKeys(keys)
            }}
            allowDrop={({ dropNode }) => {
                const dropEntry = entries.find((entry) => entry.id === dropNode.key)
                return dropEntry?.type === 'folder'
            }}
            onDrop={async (info) => {
                const draggingEntry = entries.find((entry) => entry.id === info.dragNode.key)

                const isFirstInRoot = info.dropPosition === -1;
                if (isFirstInRoot) {
                    const rootEntries = entries.filter((entry) => entry.parent === null)
                    const firstEntry = rootEntries[0]

                    return await draggingEntry?._doc.update({
                        $set: {
                            order: firstEntry ? firstEntry.order - 1 : 0,
                            parent: null
                        }
                    })
                }

                const isFirstInParent = info.dropToGap === false;
                if (isFirstInParent) {
                    const parentEntry = entries.find((entry) => entry.id === info.node.key)
                    const children = entries.filter((entry) => entry.parent === parentEntry?.id)
                    const firstChild = children[0]
                    return await draggingEntry?._doc.update({
                        $set: {
                            order: firstChild ? firstChild.order - 1 : 0,
                            parent: parentEntry?.id
                        }
                    })
                }

                const fromEntry = entries.find((entry) => entry.id === info.node.key)
                if (!fromEntry) {
                    return
                }
                const sibling = entries.filter((entry) => entry.parent === fromEntry.parent)
                const dropTo = sibling[info.dropPosition]

                return await draggingEntry?._doc.update({
                    $set: {
                        order: dropTo ? (fromEntry.order + dropTo.order) / 2 : fromEntry.order + 1,
                        parent: fromEntry?.parent
                    }
                })
            }}
        >
            {tree.map(renderTreeNode)}
            {
                entries.length === 0 && (
                    <Tree.TreeNode key="no-entry" title={(
                        <div className="h-[32px] flex items-center gap-2 text-sidebar-foreground/70">
                            <div>
                                <TriangleAlert size={16} />
                            </div>
                            <div className="grow grid">
                                <div className="block whitespace-nowrap	overflow-hidden text-ellipsis">
                                    No data, click new to create
                                </div>
                            </div>
                        </div>
                    )} />
                )
            }
            <Tree.TreeNode key="new" title={(
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="h-[32px] flex items-center text-sidebar-foreground/70">
                            <div className="mr-2"><Plus size={16} /></div>
                            New
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="right">
                        <DropdownMenuItem onClick={() => onNewEntry('folder')}><FolderPlus /> Folder</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onNewEntry('document')}><FilePlus /> Document</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )} />
        </Tree>
    )
}