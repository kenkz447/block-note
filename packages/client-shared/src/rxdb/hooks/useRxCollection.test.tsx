import { renderHook } from '@testing-library/react-hooks';
import { useRxCollection } from './useRxCollection';
import { RxdbContext } from '../rxdbContexts';
import { describe, it, expect } from 'vitest';
import { type RxCollection } from 'rxdb';
import type { AppRxDatabase } from '../rxdbTypes';

describe('useRxCollection', () => {
    it('should throw an error if the collection is not found', () => {
        const mockDb = { collections: {} } as unknown as AppRxDatabase;
        const wrapper = ({ children }: { children: React.ReactNode; }) => (
            <RxdbContext.Provider value={{ db: mockDb }}>
                {children}
            </RxdbContext.Provider>
        );

        const { result } = renderHook(() => useRxCollection('entries'), { wrapper });
        expect(result.error).toEqual(new Error('Collection with name "entries" not found'));
    });

    it('should return the collection if it is found', () => {
        const mockCollection = {} as RxCollection;
        const mockDb = { collections: { entries: mockCollection } } as unknown as AppRxDatabase;
        const wrapper = ({ children }: { children: React.ReactNode; }) => (
            <RxdbContext.Provider value={{ db: mockDb }}>
                {children}
            </RxdbContext.Provider>
        );

        const { result } = renderHook(() => useRxCollection('entries'), { wrapper });
        expect(result.current).toBe(mockCollection);
    });
});
