import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { initRxdb, RxdbContext } from '@writefy/client-shared';
import { RxCollectionCreator, RxDatabase } from 'rxdb';
import { RxdbContextType } from '../rxdbContexts';

interface RxdbProviderProps {
    readonly dbName: string;
    readonly schema: Record<string, RxCollectionCreator>;
    readonly children: (contextValue: RxdbContextType) => ReactNode;
}

export const RxdbProvider = ({ dbName, schema, children }: RxdbProviderProps) => {
    const [db, setDb] = useState<RxDatabase>();

    /**
     * Initialize and sync the database
     */
    useEffect(() => {
        if (!dbName || db) {
            return;
        }

        initRxdb(dbName, schema).then(setDb);
    }, [dbName, db, schema]);

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

    const contextValue = useMemo(() => ({ db }), [db]);

    return (
        <RxdbContext.Provider value={contextValue}>
            {children(contextValue)}
        </RxdbContext.Provider>
    );
};
