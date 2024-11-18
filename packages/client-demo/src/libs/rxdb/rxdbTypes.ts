import { RxCollection, RxDatabase } from 'rxdb';

export interface AppRxDocumentBase {
    readonly id: string;
    readonly createdAt: string;
    readonly createdBy: string;
}

export interface Workspace extends AppRxDocumentBase {
    readonly name: string;
    readonly owner: string;
    readonly activeMembers: string[];
}

export interface Project extends AppRxDocumentBase {
    readonly workspaceId: string;
    readonly name: string;
    readonly order: number;
}

export interface Entry extends AppRxDocumentBase {
    readonly workspaceId: string;
    readonly projectId: string;
    readonly type: string;
    readonly name: string;
    readonly order: number;
    readonly parent: string | null;
    readonly updates?: {
        timestamp: number;
        update: number[];
    }[];
}

export interface LocalDoc extends AppRxDocumentBase {
    readonly updates: {
        timestamp: number;
        update: number[];
    }[];
}

export type EntryTreeNode = Entry & { children: EntryTreeNode[]; };

export interface AppRxCollections {
    readonly workspaces: RxCollection<Workspace>;
    readonly projects: RxCollection<Project>;
    readonly entries: RxCollection<Entry>;
    readonly local_docs: RxCollection<LocalDoc>;
}

export type AppRxSchema = AppRxDocumentBase | Workspace | Project | Entry | LocalDoc;

export type AppRxDatabase = RxDatabase<AppRxCollections>;
