export interface Workspace {
    readonly id: string;
    readonly name: string;
    readonly order: number;
    readonly createdAt: string;
}

export interface Entry {
    id: string;
    type: string;
    name: string;
    order: number;
    parent: string | null;
    updates: {
        timestamp: number;
        update: number[];
    }[];
    createdAt: string;
}

export interface Doc {
    id: string;
    updates: {
        timestamp: number;
        update: number[];
    }[];
}

export type EntryTreeNode = Entry & { children: EntryTreeNode[]; };
