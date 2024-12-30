import { Workspace } from '@writefy/client-business';
import { memo } from 'react';

interface WorkspaceAvatarProps {
    readonly workspace: Workspace;
}

function WorkspaceAvatarImpl({ workspace }: WorkspaceAvatarProps) {
    return (
        <div className="bg-primary/10 flex items-center justify-center size-8 rounded-md">
            <div className="text-primary/50">{workspace.name[0].toUpperCase()}</div>
        </div>
    );
};

export const WorkspaceAvatar = memo(WorkspaceAvatarImpl);
