export interface Entry {
    id: string
    type: string
    name: string
    order: number
    parent: string
    createdAt: string
}

export type EntryTreeNode = Entry & { children: EntryTreeNode[] }
