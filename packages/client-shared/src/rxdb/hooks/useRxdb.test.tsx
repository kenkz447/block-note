import { renderHook } from '@testing-library/react-hooks';
import { useRxdb } from './useRxdb';
import { RxdbContext } from '../rxdbContexts';
import { describe, it, expect } from 'vitest';
import type { AppRxDatabase } from '../rxdbTypes';

describe('useRxdb', () => {
    it('should throw an error if used outside of RxdbContextProvider', () => {
        const { result } = renderHook(() => useRxdb());
        expect(result.error).toEqual(new Error('useRxdb must be used within a RxdbContextProvider'));
    });

    it('should throw an error if db is missing from RxdbContext', () => {
        const wrapper = ({ children }: { children: React.ReactNode; }) => (
            <RxdbContext.Provider value={{ db: null as unknown as AppRxDatabase }}>
                {children}
            </RxdbContext.Provider>
        );

        const { result } = renderHook(() => useRxdb(), { wrapper });
        expect(result.error).toEqual(new Error('Db missing from RxdbContext'));
    });

    it('should return db if RxdbContext is provided with a valid db', () => {
        const mockDb = {} as unknown as AppRxDatabase;
        const wrapper = ({ children }: { children: React.ReactNode; }) => (
            <RxdbContext.Provider value={{ db: mockDb }}>
                {children}
            </RxdbContext.Provider>
        );

        const { result } = renderHook(() => useRxdb(), { wrapper });
        expect(result.current).toBe(mockDb);
    });
});
