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
    const [activeDbName, setActiveDbName] = useState<string>();
    const [db, setDb] = useState<AppRxDatabase>();

    /**
     * Initialize and sync the database
     */
    useEffect(() => {
        if (!activeDbName || db) {
            return;
        }

        initRxdb(activeDbName).then(setDb);

    }, [activeDbName, db]);

    /**
     * Destroy the database when the user changes
     */
    useEffect(() => {
        if (activeDbName !== db?.name) {
            db?.destroy().then(() => {
                setDb(undefined);
            });
        }
    }, [activeDbName, db]);

    /**
     * Set the active database name based on the current user
     */
    useEffect(() => {
        const userId = getUserId(currentUser);
        const nextDbName = `user_${userId.toLowerCase()}`;
        setActiveDbName(nextDbName);
    }, [currentUser]);

    const contextValue: RxdbContextType = useMemo(() => {
        return {
            db
        };
    }, [db]);

    return children(contextValue);
};
