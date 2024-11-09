import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { RxdbContext } from "../rxdbContexts";
import { initRxdb } from "../rxdbHelpers";
import { RxDatabase } from "rxdb";
import { useEventListener } from "@/hooks/useEvent";

export const RxdbProvider = ({ children }: PropsWithChildren) => {
    const [db, setDb] = useState<RxDatabase>();

    const resetDb = useCallback(async () => {
        await db?.remove();
        await db?.destroy();
        setDb(undefined);
    }, [db]);

    useEventListener({
        event: 'LOGGED_OUT',
        listen: resetDb
    });

    useEventListener({
        event: 'LOGGED_IN',
        listen: resetDb
    });

    useEffect(() => {
        if (db) {
            return;
        }

        const init = async () => {
            const db = await initRxdb();
            setDb(db);
        };
        init();
    }, [db]);

    if (!db) {
        return null;
    }

    return (
        <RxdbContext.Provider value={{ db }}>
            {children}
        </RxdbContext.Provider>
    );
};
