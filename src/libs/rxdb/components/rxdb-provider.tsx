import { PropsWithChildren, useEffect, useState } from "react";
import { RxdbContext } from "../rxdb-context";
import { initRxdb } from "../rxdb-helpers";
import { RxDatabase } from "rxdb";

export const RxdbProvider = ({ children }: PropsWithChildren) => {
    const [db, setDb] = useState<RxDatabase>();
    useEffect(() => {
        const init = async () => {
            const db = await initRxdb();
            setDb(db);
        };
        init();
    }, []);

    if (!db) {
        return null;
    }

    return (
        <RxdbContext.Provider value={{ db }}>
            {children}
        </RxdbContext.Provider>
    );
};