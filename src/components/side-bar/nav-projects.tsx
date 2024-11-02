import {
  FilePlus2,
  FileText,
  Folder,
  Forward,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Entry, generateRxId, RxdbObserver, useRxdbContext, WithRxDoc } from "@/libs/rxdb"
import { useCallback, useEffect, useState } from "react"
import { RxDocument } from "rxdb"
import { usePopupDialog } from "@/libs/popup"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { firstBy } from "thenby"
import { arrayToTree } from "performant-array-to-tree"
import Tree from "rc-tree"
import { Link } from '@tanstack/react-router'

const schema = z.object({
  name: z.string().min(1),
})

export function NavProjects() {
  const { isMobile } = useSidebar()

  const rxdbContext = useRxdbContext()
  const { entries: entriesCollection } = rxdbContext.db.collections

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
        <Button
          onClick={form.handleSubmit(createEntry)}
        >
          Create
        </Button>
      )
    })
  }


  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Documents</SidebarGroupLabel>
      <SidebarMenu>
        <div className="overflow-hidden">
          <Entries />
        </div>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="text-sidebar-foreground/70">
                <Plus className="text-sidebar-foreground/70" />
                <span>New</span>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-48 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align={isMobile ? "end" : "start"}
            >
              <DropdownMenuItem onClick={() => onNewEntries('document')}>
                <FilePlus2 className="text-muted-foreground" />
                <span>New Document</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNewEntries('folder')}>
                <Folder className="text-muted-foreground" />
                <span>New Folder</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}

const Entries = () => {
  const { isMobile } = useSidebar()

  const rxdbContext = useRxdbContext()

  const { entries: entriesCollection } = rxdbContext.db.collections

  const [entries, setEntries] = useState<WithRxDoc<Entry>[]>([])

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

  const onDeleteEntry = useCallback((doc: RxDocument<Entry>) => {
    doc.remove()
  }, [])

  type EntryTreeNode = WithRxDoc<Entry> & { children: EntryTreeNode[] }

  const tree = arrayToTree(entries, { dataField: null, parentId: 'parent' }) as EntryTreeNode[]

  const renderTreeNode = (entry: EntryTreeNode) => {
    const renderTitle = () => {
      const title = (
        <span>
          {entry.id} - <RxdbObserver doc={entry._doc} field="name" defaultValue={`New ${entry.type}`} />
        </span>
      );

      return (
        <SidebarMenuItem key={entry.id} className="grid">
          <SidebarMenuButton asChild>
            {
              entry.type === 'folder'
                ? (<span> <Folder /> {title} </span>)
                : (
                  <Link to='/' search={{ entry: entry.id }}>
                    <FileText />
                    {title}
                  </Link>
                )
            }
          </SidebarMenuButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuAction showOnHover>
                <MoreHorizontal />
                <span className="sr-only">More</span>
              </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-48 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align={isMobile ? "end" : "start"}
            >
              <DropdownMenuItem>
                <Folder className="text-muted-foreground" />
                <span>View {entry.type}</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Forward className="text-muted-foreground" />
                <span>Share {entry.type}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDeleteEntry(entry._doc)}>
                <Trash2 className="text-muted-foreground" />
                <span>Delete {entry.type}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      )
    }

    return (
      <Tree.TreeNode
        key={entry.id}
        title={renderTitle()}
        isLeaf={entry.type !== 'folder'}
      >
        {entry.children.map(renderTreeNode)}
      </Tree.TreeNode>
    )
  }

  return (
    <Tree
      defaultExpandAll={true}
      autoExpandParent={true}
      draggable={true}
      showLine={true}
      expandAction="click"
      defaultExpandedKeys={tree.map((entry) => entry.id)}
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
    </Tree>
  )
}