import { useContext } from 'react';
import { RxdbContext } from '../rxdbContexts';

export const useRxdb = () => {
    const context = useContext(RxdbContext);
    if (!context) {
        throw new Error('useRxdb must be used within a RxdbContextProvider');
    }

    const { db } = context;
    if (!db) {
        throw new Error('Db missing from RxdbContext');
    }

    return db;
};
