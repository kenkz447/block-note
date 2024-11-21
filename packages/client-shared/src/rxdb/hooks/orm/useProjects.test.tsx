import { renderHook, act } from '@testing-library/react-hooks';
import { useProjects } from './useProjects';
import { RxdbContext } from '../../rxdbContexts';
import { describe, it, expect, vi } from 'vitest';
import { type RxCollection } from 'rxdb';
import type { AppRxDatabase } from '../../rxdbTypes';

vi.mock('../../../auth', () => ({
    getUserId: vi.fn(() => 'mocked-user-id'),
    useCurrentUser: vi.fn(() => (null))
}));

describe('useProjects', () => {
    const mockInsert = vi.fn();
    const mockFindOne = vi.fn();
    const mockExec = vi.fn();

    const mockCollection = {
        findOne: mockFindOne.mockReturnValue({ exec: mockExec }),
        insert: mockInsert
    } as unknown as RxCollection;

    const mockDb = { collections: { projects: mockCollection } } as unknown as AppRxDatabase;

    const wrapper = ({ children }: { children: React.ReactNode; }) => (
        <RxdbContext.Provider value={{ db: mockDb }}>
            {children}
        </RxdbContext.Provider>
    );

    it('should insert a new project', async () => {
        const { result } = renderHook(() => useProjects({ workspaceId: 'workspace-id' }), { wrapper });

        const params = { name: 'test-project' };
        const mockProject = { _data: { ...params, workspaceId: 'workspace-id' } };

        mockInsert.mockResolvedValueOnce(mockProject);

        let insertedData;
        await act(async () => {
            insertedData = await result.current.insert(params);
        });

        expect(insertedData).toEqual(mockProject._data);
        expect(mockInsert).toHaveBeenCalledWith({
            ...params,
            createdBy: 'mocked-user-id',
            workspaceId: 'workspace-id',
            order: expect.any(Number),
            id: expect.any(String),
            createdAt: expect.any(String)
        });
    });

    it('should update an existing project', async () => {
        const { result } = renderHook(() => useProjects({ workspaceId: 'workspace-id' }), { wrapper });

        const projectId = 'existing-id';
        const params = { name: 'updated-project' };

        const mockDocUpdate = vi.fn();
        const mockProjectDoc = {
            _data: { id: projectId, ...params },
            update: mockDocUpdate
        };

        mockExec.mockResolvedValueOnce(mockProjectDoc);

        let updatedData;
        await act(async () => {
            updatedData = await result.current.update(projectId, params);
        });

        expect(updatedData).toEqual(mockProjectDoc._data);
        expect(mockDocUpdate).toHaveBeenCalledWith({
            $set: params
        });
    });
});
