import { PropsWithChildren, useEffect, useState } from "react";
import { RxdbContext } from "../rxdbContexts";
import { initRxdb, syncRxdb } from "../rxdbHelpers";
import { RxDatabase } from "rxdb";
import { User } from "firebase/auth";

const ANONYMOUS_DB_NAME = 'anonymous';

interface RxdbProviderProps {
    readonly currentUser: User | null;
    readonly sync: boolean;
}

export const RxdbProvider = ({ currentUser, sync, children }: PropsWithChildren<RxdbProviderProps>) => {
    const [activeDbName, setActiveDbName] = useState<string>();
    const [db, setDb] = useState<RxDatabase>();

    /**
     * Initialize and sync the database
     */
    useEffect(() => {
        if (!activeDbName || db) {
            return;
        }

        initRxdb(activeDbName).then((db) => {
            setDb(db);
            if (sync) {
                syncRxdb(db);
            }
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

    return (
        <RxdbContext.Provider value={{ db }}>
            {children}
        </RxdbContext.Provider>
    );
};
