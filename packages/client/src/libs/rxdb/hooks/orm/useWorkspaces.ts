import { Workspace } from '../../rxdbTypes';
import { useRxOrm } from '../useRxOrm';

export const useWorkspaces = () => {
    const { subscribeSingle } = useRxOrm<Workspace>('workspaces');

    return {
        subscribeSingle,
    };
};
