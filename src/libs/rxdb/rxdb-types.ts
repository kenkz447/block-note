import { RxDocument } from "rxdb"

export type WithRxDoc<T> = T & { _doc: RxDocument<T> }

export interface Entry {
    id: string
    type: string
    name: string
    order: number
    parent: string
    createdAt: string
}

export type EntryTreeNode = WithRxDoc<Entry> & { children: EntryTreeNode[] }