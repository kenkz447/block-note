import { RxCollection, RxDatabase } from 'rxdb';

export interface AppRxDocumentBase {
    readonly id: string;
    readonly createdAt: string;
}

export interface Workspace extends AppRxDocumentBase {
    readonly name: string;
}

export interface Project extends AppRxDocumentBase {
    readonly name: string;
    readonly order: number;
}

export interface Entry extends AppRxDocumentBase {
    type: string;
    name: string;
    order: number;
    parent: string | null;
    updates?: {
        timestamp: number;
        update: number[];
    }[];
}

export interface LocalDoc extends AppRxDocumentBase {
    updates: {
        timestamp: number;
        update: number[];
    }[];
}

export type EntryTreeNode = Entry & { children: EntryTreeNode[]; };

export interface AppRxCollections {
    readonly workspaces: RxCollection<Workspace>;
    readonly projects: RxCollection<Project>;
    readonly entries: RxCollection<Entry>;
    readonly localDocs: RxCollection<LocalDoc>;
}

export type AppRxSchema = AppRxDocumentBase | Workspace | Project | Entry | LocalDoc;

export type AppRxDatabase = RxDatabase<AppRxCollections>;
