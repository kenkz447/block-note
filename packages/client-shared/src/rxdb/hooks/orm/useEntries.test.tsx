import { act } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { useEntries } from './useEntries';
import { RxdbContext } from '../../rxdbContexts';
import { describe, it, expect, vi } from 'vitest';
import { type RxCollection } from 'rxdb';
import type { AppRxDatabase } from '../../rxdbTypes';
import { AuthContext } from '../../../auth/authContext';

vi.mock('../../../auth', () => ({
    getUserId: vi.fn(() => 'mocked-user-id'),
    useCurrentUser: vi.fn(() => null)
}));

describe('useEntries', () => {
    const mockFind = vi.fn();
    const mockInsert = vi.fn();
    const mockFindOne = vi.fn();
    const mockExec = vi.fn();
    const mockSubscribe = vi.fn();
    const mockObservable = { subscribe: vi.fn() };

    const mockCollection = {
        find: mockFind.mockReturnValue({ exec: mockExec }),
        findOne: mockFindOne.mockReturnValue({ exec: mockExec }),
        insert: mockInsert,
        subscribe: mockSubscribe,
        $: mockObservable
    } as unknown as RxCollection;

    const mockDb = { collections: { entries: mockCollection } } as unknown as AppRxDatabase;

    const wrapper = ({ children }: { children: React.ReactNode; }) => (
        <AuthContext.Provider value={{ currentUser: null }}>
            <RxdbContext.Provider value={{ db: mockDb }}>
                {children}
            </RxdbContext.Provider>
        </AuthContext.Provider>
    );

    const mockOptions = { workspaceId: 'workspace-id', projectId: 'project-id' };

    it('should check if an entry exists', async () => {
        const { result } = renderHook(() => useEntries(mockOptions), { wrapper });

        const entryId = 'existing-id';
        mockExec.mockResolvedValueOnce({ id: entryId });

        let exists;
        await act(async () => {
            exists = await result.current.checkEntryExists(entryId);
        });

        expect(exists).toBe(true);
        expect(mockFindOne).toHaveBeenCalledWith(entryId);
    });

    it('should return false if the entry does not exist', async () => {
        const { result } = renderHook(() => useEntries(mockOptions), { wrapper });

        const entryId = 'non-existent-id';
        mockExec.mockResolvedValueOnce(null);

        let exists;
        await act(async () => {
            exists = await result.current.checkEntryExists(entryId);
        });

        expect(exists).toBe(false);
        expect(mockFindOne).toHaveBeenCalledWith(entryId);
    });

    it('should subscribe to entries and sort them', async () => {
        const { result } = renderHook(() => useEntries(mockOptions), { wrapper });

        const entries = [
            { _data: { order: 2, name: 'Entry 2' } },
            { _data: { order: 1, name: 'Entry 1' } }
        ];

        const callback = vi.fn();
        const sortedEntries = [
            { order: 1, name: 'Entry 1' },
            { order: 2, name: 'Entry 2' }
        ];

        mockSubscribe.mockImplementationOnce((query, cb) => {
            cb(entries);
            return { unsubscribe: vi.fn() };
        });

        mockExec.mockImplementationOnce(() => entries);

        await act(async () => {
            result.current.subscribe(callback);
        });

        expect(callback).toHaveBeenCalledWith(sortedEntries);
    });

    it('should insert a new entry', async () => {
        const { result } = renderHook(() => useEntries(mockOptions), { wrapper });

        const params = {
            name: 'test-entry',
            parent: null,
            type: 'folder'
        };
        const now = new Date().getTime();
        const mockEntry = { _data: { ...params, order: now, createdBy: 'mocked-user-id', workspaceId: 'workspace-id', projectId: 'project-id' } };

        mockInsert.mockResolvedValueOnce(mockEntry);

        let insertedData;
        await act(async () => {
            insertedData = await result.current.insert(params);
        });

        expect(insertedData).toEqual(mockEntry._data);
        expect(mockInsert).toHaveBeenCalledWith({
            ...params,
            name: 'test-entry',
            createdBy: 'mocked-user-id',
            workspaceId: 'workspace-id',
            projectId: 'project-id',
            order: expect.any(Number),
            id: expect.any(String),
            createdAt: expect.any(String)
        });
    });
});
