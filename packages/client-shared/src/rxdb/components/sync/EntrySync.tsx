import { memo, useEffect, useMemo, useState } from 'react';
import { RxFirestoreReplicationState } from 'rxdb/plugins/replication-firestore';
import { shallowEqualByKey, } from '../../../utils';
import { useRxdb } from '../../hooks/useRxdb';
import { createFirebaseReplication } from '../../rxdbHelpers';
import { Entry } from '../../rxdbTypes';
import { firstValueFrom, filter } from 'rxjs';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface EntrySyncProps {
    readonly userId: string;
    readonly workspaceId: string;
    readonly projectId: string;
    readonly children: (workspaceSynced: boolean) => React.ReactNode;
}

function EntrySyncImpl({ userId, workspaceId, projectId, children }: EntrySyncProps) {
    const db = useRxdb();

    const [replicaState, setReplicateState] = useState<RxFirestoreReplicationState<Entry>>();

    const timestampMap = useMemo(() => new Map<string, number>(), []);

    // Start syncing the workspace when the user is logged in
    useEffect(() => {
        const replicateState = createFirebaseReplication<Entry>({
            userId,
            rxCollection: db.collections.entries,
            remotePath: ['workspaces', workspaceId, 'projects', projectId, 'entries'],
            // pullModifier: async (doc) => {
            //     if (!doc?.updates[0] || doc._deleted) {
            //         return doc;
            //     }

            //     const storage = getStorage();
            //     const docRef = ref(storage, doc.updates[0].docRef);
            //     const downloadUrl = await getDownloadURL(docRef);
            //     const response = await fetch(downloadUrl);
            //     const buffer = await response.arrayBuffer();
            //     const update = [...new Uint8Array(buffer)];

            //     const modifiedDoc = {
            //         ...doc,
            //         updates: [{
            //             timestamp: doc.updates[0].timestamp,
            //             update
            //         }]
            //     };

            //     console.log(`${doc.id} - Pulling doc`, modifiedDoc);

            //     return modifiedDoc;
            // },
            pushFilter: (doc) => doc.workspaceId === workspaceId && doc.projectId === projectId,
            // pushModifier: async (doc) => {
            //     if (!doc?.updates) {
            //         return doc;
            //     }

            //     const latestTimestamp = timestampMap.get(doc.id) ?? 0;
            //     const docTimestamp = doc.updates[0].timestamp;

            //     if (docTimestamp <= latestTimestamp) {
            //         return doc;
            //     }

            //     timestampMap.set(doc.id, docTimestamp);

            //     const storage = getStorage();
            //     const docRef = ref(storage, `docs/${workspaceId}/${projectId}/${doc.id}`);

            //     const uploadBuffer = new Uint8Array(doc.updates[0].update);
            //     await uploadBytes(docRef, uploadBuffer);

            //     const modifiedDoc = {
            //         ...doc,
            //         updates: [{
            //             timestamp: doc.updates[0].timestamp,
            //             docRef: docRef.fullPath
            //         }]
            //     };

            //     console.log(`${doc.id} - Pushing doc`, modifiedDoc);

            //     return modifiedDoc;
            // },
        });

        const initializeReplication = async () => {
            db.collections.entries.insertLocal('last-in-sync', { time: 0 }).catch(() => void 0);
            replicateState.active$.subscribe(async () => {
                await replicateState.awaitInSync();
                await db.collections.entries.upsertLocal('last-in-sync', { time: Date.now() });
            });

            // Sync the project data from the last 24 hours
            const oneDay = 1000 * 60 * 60 * 24;

            await firstValueFrom(
                db.collections.entries.getLocal$('last-in-sync').pipe(
                    filter((d) => d!.get('time') > (Date.now() - oneDay))
                )
            );
            setReplicateState(replicateState);
        };

        initializeReplication();

        return () => {
            const stopReplication = async () => {
                if (replicateState) {
                    if (!db.closed) {
                        await replicateState.remove();
                    }
                    setReplicateState(undefined);
                }
            };

            stopReplication();
        };
    }, [db, userId, workspaceId, projectId, timestampMap]);

    return children(replicaState !== undefined);
}

export const EntrySync = memo(EntrySyncImpl, shallowEqualByKey('userId', 'workspaceId', 'projectId'));
