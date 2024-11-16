import { User } from 'firebase/auth';
import { useWorkspaceReplica } from '../hooks/sync/useWorkspaceReplica';
import { AppRxDatabase } from '../rxdbTypes';

interface RxdbWorkspaceProviderProps {
    readonly db: AppRxDatabase;
    readonly user: User | null;
    readonly children: (workspaceReplica: ReturnType<typeof useWorkspaceReplica>) => React.ReactNode;
}

export function RxdbWorkspaceProvider({ db, user, children }: RxdbWorkspaceProviderProps) {
    const workspaceReplica = useWorkspaceReplica(db, user?.uid);
    return children(workspaceReplica);
}
