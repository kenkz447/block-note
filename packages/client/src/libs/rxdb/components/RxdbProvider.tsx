import { ReactNode, useEffect, useMemo, useState } from 'react';
import { RxdbContextType } from '../rxdbContexts';
import { initRxdb, syncRxdb } from '../rxdbHelpers';
import { User } from 'firebase/auth';
import { AppRxDatabase } from '../rxdbTypes';

const ANONYMOUS_DB_NAME = 'anonymous';

interface RxdbProviderProps {
    readonly currentUser: User | null;
    readonly sync: boolean;
    readonly children: (rxdbContext: RxdbContextType) => ReactNode;
}

export const RxdbProvider = ({ currentUser, sync, children }: RxdbProviderProps) => {
    const [activeDbName, setActiveDbName] = useState<string>();
    const [db, setDb] = useState<AppRxDatabase>();

    /**
     * Initialize and sync the database
     */
    useEffect(() => {
        if (!activeDbName || db) {
            return;
        }

        initRxdb(activeDbName).then((db) => {
            setDb(db);
        });

    }, [activeDbName, db, sync]);

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
        if (!currentUser) {
            setActiveDbName(ANONYMOUS_DB_NAME);
        }
        else {
            setActiveDbName(currentUser.uid);
        }
    }, [currentUser]);

    const contextValue: RxdbContextType = useMemo(() => {
        return {
            db
        };
    }, [db]);

    return children(contextValue);
};
