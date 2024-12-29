import { useEffect, useState } from 'react';
import { CreateFirebaseReplication, replicateCollection } from '../helpers/replicateCollection';
import { RxDatabase } from 'rxdb';
import { RxFirestoreReplicationState } from 'rxdb/plugins/replication-firestore';

export const useRxdbReplication = <T>(db: RxDatabase<any>, options: CreateFirebaseReplication<T>) => {
    const [replicaState, setReplicateState] = useState<RxFirestoreReplicationState<T>>();

    useEffect(() => {
        replicateCollection(options).then(setReplicateState);
    }, [options]);

    useEffect(() => {
        if (!replicaState) {
            return;
        }

        return () => {
            const stopReplication = async () => {
                if (!db.closed) {
                    await replicaState.remove();
                }
            };

            stopReplication();
        };
    }, [db.closed, replicaState]);
};
