import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, Mock } from 'vitest';
import { WorkspaceSync } from './WorkspaceSync';
import { useRxdb } from '@/libs/rxdb';
import { createFirebaseReplication } from '@/libs/rxdb/rxdbHelpers';

vi.mock('@/libs/rxdb');
vi.mock('@/libs/rxdb/rxdbHelpers');

describe('WorkspaceSync', () => {
    it('should render children with workspaceSynced as true after replication', async () => {
        const mockDb = {
            collections: {
                workspaces: {}
            }
        };
        const mockReplicationState = {
            awaitInitialReplication: vi.fn().mockResolvedValueOnce(undefined),
            cancel: vi.fn(),
            remove: vi.fn()
        };

        (useRxdb as Mock).mockReturnValue(mockDb);
        (createFirebaseReplication as Mock).mockReturnValue(mockReplicationState);

        const children = vi.fn().mockReturnValue(<div>Workspace Synced</div>);

        const { getByText } = render(<WorkspaceSync userId="test-user">{children}</WorkspaceSync>);

        await waitFor(() => {
            expect(children).toHaveBeenCalledWith(true);
            expect(getByText('Workspace Synced')).toBeInTheDocument();
        });
    });

    it('should render children with workspaceSynced as false initially', () => {
        const mockDb = {
            collections: {
                workspaces: {}
            }
        };

        (useRxdb as Mock).mockReturnValue(mockDb);
        (createFirebaseReplication as Mock).mockReturnValue({
            awaitInitialReplication: vi.fn(),
            cancel: vi.fn(),
            remove: vi.fn()
        });

        const children = vi.fn().mockReturnValue(<div>Workspace Not Synced</div>);

        const { getByText } = render(<WorkspaceSync userId="test-user">{children}</WorkspaceSync>);

        expect(children).toHaveBeenCalledWith(false);
        expect(getByText('Workspace Not Synced')).toBeInTheDocument();
    });
});
