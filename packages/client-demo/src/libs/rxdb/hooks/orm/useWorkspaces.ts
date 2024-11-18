import { useCurrentUser } from '@writefy/client-shared';
import { Workspace } from '../../rxdbTypes';
import { useRxOrm } from '../useRxOrm';
import { useCallback } from 'react';

interface WorkspaceInsertValues {
    readonly name: string;
}

export const useWorkspaces = () => {
    const currentUser = useCurrentUser();

    const { insert, ...rest } = useRxOrm<Workspace>('workspaces');

    const userId = currentUser?.uid ?? 'anonymous';

    return {
        ...rest,
        insert: useCallback((values: WorkspaceInsertValues) => insert({
            ...values,
            createdBy: userId,
            activeMembers: [userId],
            owner: userId
        }), [insert, userId])
    };
};
