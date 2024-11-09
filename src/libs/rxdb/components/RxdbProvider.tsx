import { PropsWithChildren, useEffect, useState } from "react";
import { RxdbContext } from "../rxdbContexts";
import { initRxdb } from "../rxdbHelpers";
import { RxDatabase } from "rxdb";
import { useCurrentUser } from "@/libs/auth";

const ANONYMOUS_DB_NAME = 'anonymous';

export const RxdbProvider = ({ children }: PropsWithChildren) => {
    const { currentUser } = useCurrentUser();

    const [activeDbName, setActiveDbName] = useState<string>();
    const [db, setDb] = useState<RxDatabase>();

    useEffect(() => {
        if (!activeDbName || db) {
            return;
        }

        initRxdb(activeDbName).then((db) => {
            setDb(db);
        });

    }, [activeDbName, db]);

    useEffect(() => {
        if (activeDbName !== db?.name) {
            db?.destroy().then(() => {
                setDb(undefined);
            });
        }
    }, [activeDbName, db]);

    useEffect(() => {
        if (!currentUser) {
            setActiveDbName(ANONYMOUS_DB_NAME);
        }
        else {
            setActiveDbName(currentUser.uid);
        }
    }, [currentUser]);

    if (!db || db.destroyed) {
        return null;
    }

    return (
        <RxdbContext.Provider value={{ db }}>
            {children}
        </RxdbContext.Provider>
    );
};
