import { getUserDisplayName, getUserId, useCurrentUser } from '../../../auth';
import { Workspace } from '../../rxdbTypes';
import { useRxOrm } from '../useRxOrm';
import { useCallback } from 'react';

interface WorkspaceInsertValues {
    readonly name: string;
}

export const useWorkspaces = () => {
    const currentUser = useCurrentUser();

    const { insert, ...rest } = useRxOrm<Workspace>('workspaces');

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
