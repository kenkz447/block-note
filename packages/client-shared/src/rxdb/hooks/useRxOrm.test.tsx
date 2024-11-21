import { renderHook, act } from '@testing-library/react-hooks';
import { useRxOrm } from './useRxOrm';
import { RxdbContext } from '../rxdbContexts';
import { describe, it, expect, vi } from 'vitest';
import { type RxCollection } from 'rxdb';
import type { AppRxDatabase, AppRxDocumentBase } from '../rxdbTypes';

vi.mock('../rxdbUtils', () => ({
    generateRxId: vi.fn(() => 'mocked-id')
}));

describe('useRxOrm', () => {
    const mockInsert = vi.fn();
    const mockFindOne = vi.fn();
    const mockExec = vi.fn();

    const mockCollection = {
        insert: mockInsert,
        findOne: mockFindOne.mockReturnValue({ exec: mockExec })
    } as unknown as RxCollection;

    const mockDb = { collections: { entries: mockCollection } } as unknown as AppRxDatabase;
    const wrapper = ({ children }: { children: React.ReactNode; }) => (
        <RxdbContext.Provider value={{ db: mockDb }}>
            {children}
        </RxdbContext.Provider>
    );

    it('should insert a new document', async () => {
        const { result } = renderHook(() => useRxOrm('entries'), { wrapper });

        const params = { name: 'test' } as unknown as AppRxDocumentBase;
        const mockEntry = { _data: { ...params, id: 'mocked-id' } };

        mockInsert.mockResolvedValueOnce(mockEntry);

        let insertedData;
        await act(async () => {
            insertedData = await result.current.insert(params);
        });

        expect(insertedData).toEqual(mockEntry._data);
        expect(mockInsert).toHaveBeenCalledWith({
            ...params,
            id: 'mocked-id',
            createdAt: expect.any(String)
        });
    });

    it('should update an existing document', async () => {
        const { result } = renderHook(() => useRxOrm('entries'), { wrapper });

        const entryId = 'existing-id';
        const params = { name: 'updated' };
        const mockDoc = { update: vi.fn(), _data: { id: entryId, ...params } };

        mockExec.mockResolvedValueOnce(mockDoc);

        await act(async () => {
            await result.current.update(entryId, params);
        });

        expect(mockFindOne).toHaveBeenCalledWith(entryId);
        expect(mockDoc.update).toHaveBeenCalledWith({ $set: params });
    });

    it('should throw an error if the document is not found', async () => {
        const { result } = renderHook(() => useRxOrm('entries'), { wrapper });

        const entryId = 'non-existent-id';
        const params = { name: 'updated' };

        mockExec.mockResolvedValueOnce(null);

        await expect(result.current.update(entryId, params)).rejects.toThrow(`Workspace not found: ${entryId}`);
        expect(mockFindOne).toHaveBeenCalledWith(entryId);
    });
});
