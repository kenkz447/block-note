import { render, waitFor } from '@testing-library/react';
import { EntrySync } from './EntrySync';
import { useRxdb } from '@/libs/rxdb';
import { createFirebaseReplication } from '@/libs/rxdb/rxdbHelpers';
import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';

vi.mock('@/libs/rxdb');
vi.mock('@/libs/rxdb/rxdbHelpers');

describe('EntrySync', () => {
    const mockUseRxdb = useRxdb as Mock;
    const mockCreateFirebaseReplication = createFirebaseReplication as Mock;

    const mockDb = {
        collections: {
            projects: {},
        },
    };

    const mockReplicationState = {
        awaitInitialReplication: vi.fn().mockResolvedValue(undefined),
        cancel: vi.fn().mockResolvedValue(undefined),
        remove: vi.fn().mockResolvedValue(undefined),
    };

    beforeEach(() => {
        mockUseRxdb.mockReturnValue(mockDb);
        mockCreateFirebaseReplication.mockReturnValue(mockReplicationState);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should render children with workspaceSynced as true after initial replication', async () => {
        const children = vi.fn().mockReturnValue(<div>Synced</div>);

        const { getByText } = render(
            <EntrySync userId="user1" workspaceId="workspace1" projectId="project1">
                {children}
            </EntrySync>
        );

        await waitFor(() => expect(children).toHaveBeenCalledWith(true));
        expect(getByText('Synced')).toBeInTheDocument();
    });

    it('should cancel and remove replication state on unmount', async () => {
        const children = vi.fn().mockReturnValue(<div>Synced</div>);

        const { unmount } = render(
            <EntrySync userId="user1" workspaceId="workspace1" projectId="project1">
                {children}
            </EntrySync>
        );

        unmount();

        expect(mockReplicationState.cancel).toHaveBeenCalled();
        expect(mockReplicationState.remove).toHaveBeenCalled();
    });
});
