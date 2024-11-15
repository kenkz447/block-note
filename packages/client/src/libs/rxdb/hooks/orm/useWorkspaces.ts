import { Workspace } from '../../rxdbTypes';
import { useRxOrm } from '../useRxOrm';

export const useWorkspaces = () => {
    const { ...rest } = useRxOrm<Workspace>('workspaces');

    return {
        ...rest,
    };
};
