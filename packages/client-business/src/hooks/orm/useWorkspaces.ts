import { useCallback } from 'react';
import { Workspace } from '../../Models';
import { getUserDisplayName, getUserId, useCurrentUser, useRxdbOrm } from '@writefy/client-shared';

interface WorkspaceInsertValues {
    readonly name: string;
}

export const useWorkspaces = () => {
    const currentUser = useCurrentUser();

    const { insert, ...rest } = useRxdbOrm<Workspace>('workspaces');

    const userId = getUserId(currentUser);
    const userDisplayName = getUserDisplayName(currentUser);

    return {
        ...rest,
        insert: useCallback((values: WorkspaceInsertValues) => {
            const now = new Date().toISOString();

            return insert({
                ...values,
                createdAt: now,
                createdBy: userId,
                owner: userId,
                activeMembers: [userId],
                members: [{
                    id: userId,
                    name: userDisplayName,
                    role: 'owner',
                    addedAt: now,
                    addedBy: userId,
                }]
            });
        }, [userDisplayName, insert, userId])
    };
};
