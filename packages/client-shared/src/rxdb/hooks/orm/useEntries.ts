import { firstBy } from 'thenby';
import { useCallback } from 'react';
import { Entry } from '../../rxdbTypes';
import { useRxOrm } from '../useRxOrm';
import { getUserId, useCurrentUser } from '../../../auth';

export interface InsertEntryParams {
    readonly id?: string;
    readonly type: string;
    readonly parent: string | null;
    readonly name: string;
}

export interface UpdateEntryParams {
    readonly name: string;
}

const DEFAULT_ENTRY_NAME = 'Untitled Document';

interface UserEntryOptions {
    readonly workspaceId: string;
    readonly projectId: string;
}

export const useEntries = ({ workspaceId, projectId }: UserEntryOptions) => {
    const currentUser = useCurrentUser();
    const userId = getUserId(currentUser);

    const { collection, insert, subscribe, ...rest } = useRxOrm<Entry>('entries');

    const checkEntryExists = useCallback(async (entryId: string) => {
        const doc = await collection.findOne(entryId).exec();
        return !!doc;
    }, [collection]);

    return {
        checkEntryExists,
        subscribe: useCallback((callback: (entry: Entry[]) => void) => {
            const getEntries = async (entries: Entry[]) => {
                const sortedEntries = entries.sort(
                    firstBy<Entry>((a, b) => {
                        const aId = a.order;
                        const bId = b.order;
                        return aId < bId ? -1 : aId > bId ? 1 : 0;
                    })
                );

                callback(sortedEntries);
            };

            const subscription = subscribe({
                selector: {
                    workspaceId,
                    projectId
                }
            }, getEntries);

            return subscription;
        }, [projectId, subscribe, workspaceId]),
        insert: useCallback(async (params: InsertEntryParams) => {
            const now = new Date();
            const entry = await insert({
                ...params,
                name: params.name || DEFAULT_ENTRY_NAME,
                order: now.getTime(),
                createdAt: now.toISOString(),
                createdBy: userId,
                workspaceId,
                projectId
            });
            return entry;
        }, [insert, projectId, userId, workspaceId]),
        collection,
        ...rest
    };
};
