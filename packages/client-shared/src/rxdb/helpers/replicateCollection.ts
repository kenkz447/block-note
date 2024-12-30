import { MaybePromise, RxCollection, WithDeleted } from 'rxdb';

import { collection, CollectionReference, getFirestore, QueryFieldFilterConstraint } from 'firebase/firestore';
import { replicateFirestore } from 'rxdb/plugins/replication-firestore';
import { firstValueFrom, filter } from 'rxjs';

export interface CreateFirebaseReplication<T> {
    readonly rxCollection: RxCollection;
    readonly firestorePath: string[];
    readonly pull: {
        readonly filter?: QueryFieldFilterConstraint | QueryFieldFilterConstraint[] | undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        readonly modifier?: (item: any) => MaybePromise<WithDeleted<T>>;
    },
    readonly push: {
        readonly filter?: (item: WithDeleted<T>) => boolean;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        readonly modifier?: (item: T) => MaybePromise<any>;
    };
}

export const replicateCollection = async <T>({
    rxCollection,
    firestorePath: remotePath,
    pull,
    push
}: CreateFirebaseReplication<T>) => {
    const firestore = getFirestore();
    if (!firestore.app) {
        throw new Error('Firestore app not initialized');
    }

    const remoteId = firestore.app.options.projectId!;

    const [path, ...subPath] = remotePath;

    const remoteCollection = collection(firestore, path, ...subPath);

    const replicaState = replicateFirestore(
        {
            replicationIdentifier: remoteId,
            collection: rxCollection,
            firestore: {
                projectId: remoteId,
                database: firestore,
                collection: remoteCollection as CollectionReference<T>
            },
            pull,
            push,
            live: true,
            serverTimestampField: 'serverTimestamp',
            autoStart: true
        }
    );

    replicaState.error$.subscribe(err => {
        console.error(`"${rxCollection.name}" replication:`, err);
    });

    rxCollection.insertLocal('local:last-in-sync', { time: 0 }).catch(() => void 0);
    replicaState.active$.subscribe(async () => {
        await replicaState.awaitInSync();
        await rxCollection.upsertLocal('local:last-in-sync', { time: Date.now() });
    });

    // Sync the project data from the last 24 hours
    const oneDay = 1000 * 60 * 60 * 24;

    await firstValueFrom(
        rxCollection.getLocal$('local:last-in-sync').pipe(
            filter((d) => d!.get('time') > (Date.now() - oneDay))
        )
    );

    return replicaState;
};
