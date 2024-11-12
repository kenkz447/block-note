import { useCallback } from 'react';
import { useRxdbContext } from './useRxdbContext';
import { RxDocument } from 'rxdb';
import { Workspace } from '../rxdbTypes';
import { firstBy } from 'thenby';
import { ensureCollectionExist } from '../rxdbUtils';

interface InsertWorkspaceParams {
    id: string;
    type: string;
    parent: string | null;
    name?: string;
}

interface UpdateWorkspaceParams {
    name?: string;
    parent?: string | null;
    order?: number;
}

const DEFAULT_WORKSPACE_NAME = 'Untitled Version';


export const useWorkspaces = () => {
    const { db } = useRxdbContext();

    const insert = useCallback(async (params: InsertWorkspaceParams): Promise<Workspace> => {
        ensureCollectionExist(db, 'Workspaces');

        const now = new Date();

        return await db!.collections.Workspaces.insert({
            ...params,
            name: params.name || DEFAULT_WORKSPACE_NAME,
            order: now.getTime(),
            createdAt: now.toISOString(),
        });
    }, [db]);

    const update = useCallback(async (entryId: string, params: UpdateWorkspaceParams) => {
        ensureCollectionExist(db, 'Workspaces');

        const doc = await db!.collections.Workspaces.findOne(entryId).exec() as RxDocument<Workspace>;
        if (!doc) {
            throw new Error(`Workspace not found: ${entryId}`);
        }

        return doc.update({
            $set: params
        });
    }, [db]);

    const remove = useCallback(async (entryId: string) => {
        ensureCollectionExist(db, 'Workspaces');

        const doc = await db!.collections.Workspaces.findOne(entryId).exec() as RxDocument<Workspace>;
        if (!doc) {
            throw new Error(`Workspace not found: ${entryId}`);
        }

        return doc.remove();
    }, [db]);

    const subscribe = useCallback((callback: (entry: Workspace[]) => void) => {
        ensureCollectionExist(db, 'Workspaces');

        const getWorkspaces = async () => {
            const WorkspacesData = await db!.collections.Workspaces.find().exec() as RxDocument<Workspace>[];
            const Workspaces = WorkspacesData.map((doc) => doc._data);

            const sortedWorkspaces = Workspaces.sort(
                firstBy<Workspace>((a, b) => {
                    const aId = a.order;
                    const bId = b.order;
                    return aId < bId ? -1 : aId > bId ? 1 : 0;
                })
            );

            callback(sortedWorkspaces);
        };

        getWorkspaces();

        const subscription = db!.collections.Workspaces.$.subscribe(getWorkspaces);

        return subscription;
    }, [db]);

    const subscribeSingle = useCallback((entryId: string, callback: (entry: Workspace | null) => void) => {
        ensureCollectionExist(db, 'Workspaces');

        const subscription = db!.collections.Workspaces.findOne(entryId).$.subscribe((doc: RxDocument<Workspace>) => {
            if (!doc) {
                callback(null);
                return;
            }

            callback(doc._data);
        });

        return subscription;
    }, [db]);

    const checkWorkspaceExists = useCallback(async (entryId: string) => {
        ensureCollectionExist(db, 'Workspaces');

        const doc = await db!.collections.Workspaces.findOne(entryId).exec() as RxDocument<Workspace>;
        return !!doc;
    }, [db]);

    return {
        subscribe,
        subscribeSingle,
        checkWorkspaceExists,
        insert,
        update,
        remove,
    };
};
