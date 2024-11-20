import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, Mock } from 'vitest';
import { ProjectSync } from './ProjectSync';
import { useRxdb } from '@/libs/rxdb';
import { createFirebaseReplication } from '@/libs/rxdb/rxdbHelpers';

vi.mock('@/libs/rxdb');
vi.mock('@/libs/rxdb/rxdbHelpers');

describe('ProjectSync', () => {
    const mockDb = {
        collections: {
            projects: {}
        }
    };

    const mockReplicationState = {
        awaitInitialReplication: vi.fn().mockResolvedValue(undefined),
        cancel: vi.fn().mockResolvedValue(undefined),
        remove: vi.fn().mockResolvedValue(undefined)
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useRxdb as Mock).mockReturnValue(mockDb);
        (createFirebaseReplication as Mock).mockReturnValue(mockReplicationState);
    });

    it('renders children with workspaceSynced as true after initial replication', async () => {
        render(
            <ProjectSync userId="user1" workspaceId="workspace1">
                {(workspaceSynced) => (
                    <div>{workspaceSynced ? 'Synced' : 'Not Synced'}</div>
                )}
            </ProjectSync>
        );

        expect(await screen.findByText('Synced')).toBeInTheDocument();
    });

    it('renders children with workspaceSynced as false before initial replication', () => {
        render(
            <ProjectSync userId="user1" workspaceId="workspace1">
                {(workspaceSynced) => (
                    <div>{workspaceSynced ? 'Synced' : 'Not Synced'}</div>
                )}
            </ProjectSync>
        );

        expect(screen.getByText('Not Synced')).toBeInTheDocument();
    });
});
