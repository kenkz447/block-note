import { usePopupDialog } from "@/libs/popup"
import { Entry, generateRxId, RxdbObserver, useRxdbContext, WithRxDoc } from "@/libs/rxdb"
import { Button } from "@/libs/shadcn-ui/components/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "@/libs/shadcn-ui/components/dropdown-menu"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/libs/shadcn-ui/components/form"
import { Input } from "@/libs/shadcn-ui/components/input"
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { FilePlus, FileText, Folder, FolderOpen, FolderPlus, Menu, MoreHorizontal, Plus, Trash, TriangleAlert } from "lucide-react"
import { arrayToTree } from "performant-array-to-tree"
import Tree from "rc-tree"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { RxDocument } from "rxdb"
import { firstBy } from "thenby"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

interface EntryTreeItemProps {
    entry: WithRxDoc<Entry>
    expanded: boolean
}

const schema = z.object({
    name: z.string().min(1),
})


function EntryTreeItem({ entry, expanded }: EntryTreeItemProps) {
    const onDeleteEntry = useCallback(() => {
        entry._doc.remove()
    }, [])

    const icon = entry.type === 'folder'
        ? expanded ? <FolderOpen size={16} /> : <Folder size={16} />
        : <FileText size={16} />

    return (
        <div className="h-[32px] flex items-center pr-2 gap-2">
            <div>{icon}</div>
            <div className="grow grid">
                <div className="block whitespace-nowrap	overflow-hidden text-ellipsis">
                    <RxdbObserver doc={entry._doc} field="name" defaultValue={`New ${entry.type}`} />
                </div>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="opacity-0 group-hover:opacity-100" variant="link" size='iconSm' >
                        <MoreHorizontal size={16} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="right">
                    <DropdownMenuItem onClick={() => onDeleteEntry()}><Trash />Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export function EntryTree() {
    const rxdbContext = useRxdbContext()

    const { entries: entriesCollection } = rxdbContext.db.collections

    const [entries, setEntries] = useState<WithRxDoc<Entry>[] | undefined>(undefined)
    const [openKeys, setOpenKeys] = useState<React.Key[]>([])

    type EntryTreeNode = WithRxDoc<Entry> & { children: EntryTreeNode[] }


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

    const form = useForm({
        resolver: zodResolver(schema),
    })

    const onNewEntries = (type: string) => {
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
            form.reset()
        }

        openDialog({
            title: `New ${type}`,
            description: type === 'folder' ? 'Create a folder to organize your documents' : 'Create a new document',
            renderBody: () => (
                <Form {...form}>
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="Name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </Form>
            ),
            renderActions: () => (
                <Button onClick={form.handleSubmit(createEntry)}>
                    Create
                </Button>
            )
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
                        <DropdownMenuItem onClick={() => onNewEntries('folder')}><FolderPlus /> Folder</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onNewEntries('document')}><FilePlus /> Document</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )} />
        </Tree>
    )
}