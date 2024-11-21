import { renderHook, act } from '@testing-library/react-hooks';
import { useWorkspaces } from './useWorkspaces';
import { RxdbContext } from '../../rxdbContexts';
import { describe, it, expect, vi } from 'vitest';
import { type RxCollection } from 'rxdb';
import type { AppRxDatabase } from '../../rxdbTypes';

vi.mock('../../../auth', () => ({
    getUserId: vi.fn(() => 'mocked-user-id'),
    getUserDisplayName: vi.fn(() => 'Mocked User'),
    useCurrentUser: vi.fn(() => ({ uid: 'mocked-user-id' }))
}));

describe('useWorkspaces', () => {
    const mockInsert = vi.fn();

    const mockCollection = {
        insert: mockInsert
    } as unknown as RxCollection;

    const mockDb = { collections: { workspaces: mockCollection } } as unknown as AppRxDatabase;

    const wrapper = ({ children }: { children: React.ReactNode; }) => (
        <RxdbContext.Provider value={{ db: mockDb }}>
            {children}
        </RxdbContext.Provider>
    );

    it('should insert a new workspace', async () => {
        const { result } = renderHook(() => useWorkspaces(), { wrapper });

        const params = { name: 'test-workspace' };
        const now = new Date().getTime();
        const mockWorkspace = { _data: { ...params, createdBy: 'mocked-user-id', createdByName: 'Mocked User', createdAt: now } };

        mockInsert.mockResolvedValueOnce(mockWorkspace);

        let insertedData;
        await act(async () => {
            insertedData = await result.current.insert(params);
        });

        expect(insertedData).toEqual(mockWorkspace._data);
        expect(mockInsert).toHaveBeenCalledWith({
            ...params,
            owner: 'mocked-user-id',
            createdBy: 'mocked-user-id',
            activeMembers: ['mocked-user-id'],
            members: [{
                id: 'mocked-user-id',
                name: 'Mocked User',
                role: 'owner',
                addedAt: expect.any(String),
                addedBy: 'mocked-user-id'
            }],
            id: expect.any(String),
            createdAt: expect.any(String)
        });
    });
});
