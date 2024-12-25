import { ReactNode, useEffect, useMemo, useState } from 'react';
import { RxdbContextType } from '../rxdbContexts';
import { initRxdb } from '../rxdbHelpers';
import { User } from 'firebase/auth';
import { AppRxDatabase } from '../rxdbTypes';
import { getUserId } from '../../auth';

interface RxdbProviderProps {
    readonly currentUser: User | null;
    readonly children: (rxdbContext: RxdbContextType) => ReactNode;
}

export const RxdbProvider = ({ currentUser, children }: RxdbProviderProps) => {
    const [activeName, setActiveName] = useState<string>();
    const [db, setDb] = useState<AppRxDatabase>();

    /**
     * Initialize and sync the database
     */
    useEffect(() => {
        if (!activeName || db) {
            return;
        }

        initRxdb(activeName).then(setDb);
    }, [activeName, db]);

    /**
     * Destroy the database when the user changes
     */
    useEffect(() => {
        if (!db) {
            return;
        }
        return () => {
            db.close().then(() => setDb(undefined));
        };
    }, [db]);

    /**
     * Set the active database name based on the current user
     */
    useEffect(() => {
        const userId = getUserId(currentUser);
        const nextDbName = `user_${userId.toLowerCase()}`;
        setActiveName(nextDbName);
    }, [currentUser]);

    const contextValue: RxdbContextType = useMemo(() => {
        return {
            db
        };
    }, [db]);

    return children(contextValue);
};
