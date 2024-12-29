import { useEffect, useState, type ReactNode } from 'react';
import { initRxdb, RxdbContext } from '@writefy/client-shared';
import { RxDatabase, RxJsonSchema } from 'rxdb';

interface RxdbProviderProps {
    readonly dbName: string;
    readonly schemas: Record<string, RxJsonSchema<any>>;
    readonly children: ReactNode;
}

export const RxdbProvider = ({ dbName, schemas, children }: RxdbProviderProps) => {
    const [db, setDb] = useState<RxDatabase>();

    /**
     * Initialize and sync the database
     */
    useEffect(() => {
        if (!dbName || db) {
            return;
        }

        const collections = Object.entries(schemas).reduce((acc: Record<string, any>, [name, schema]) => {
            acc[name] = {
                schema,
                localDocuments: true
            };
            return acc;
        }, {});

        initRxdb(dbName, collections).then(setDb);
    }, [dbName, db, schemas]);

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


    return (
        <RxdbContext.Provider
            value={{ db }}
        >
            {children}
        </RxdbContext.Provider>
    );
};
