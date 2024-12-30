import type { RxCollection } from 'rxdb';

export interface AppModelBase {
    readonly id: string;
    readonly createdAt: string;
    readonly createdBy: string;
}

export interface Workspace extends AppModelBase {
    readonly name: string;
    readonly owner: string;
    readonly activeMembers: string[];
    readonly members: [{
        id: string;
        name: string;
        role: string;
        addedAt: string;
        addedBy: string;
    }];
}

export interface Project extends AppModelBase {
    readonly workspaceId: string;
    readonly name: string;
    readonly order: number;
}

export interface Entry extends AppModelBase {
    readonly workspaceId: string;
    readonly projectId: string;
    readonly type: string;
    readonly name: string;
    readonly order: number;
    readonly parent: string | null;
    readonly contentTimestamp?: number;
}

export interface AppRxCollections {
    readonly workspaces: RxCollection<Workspace>;
    readonly projects: RxCollection<Project>;
    readonly entries: RxCollection<Entry>;
}
