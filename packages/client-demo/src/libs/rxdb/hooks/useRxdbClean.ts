import { useCallback } from 'react';
import { useRxdb } from './useRxdb';

export const useRxdbClean = () => {
    const db = useRxdb();

    const onClean = useCallback(async () => {
        await db.remove();
    }, [db]);

    return onClean;
};
