import { memo, useEffect, useMemo, useState } from 'react';
import { RxFirestoreReplicationState } from 'rxdb/plugins/replication-firestore';
import { shallowEqualByKey, } from '../../../utils';
import { useRxdb } from '../../hooks/useRxdb';
import { createFirebaseReplication } from '../../rxdbHelpers';
import { Entry } from '../../rxdbTypes';
import { firstValueFrom, filter } from 'rxjs';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { mergeUpdates } from 'yjs';

interface EntrySyncProps {
    readonly userId: string;
    readonly workspaceId: string;
    readonly projectId: string;
    readonly children: (workspaceSynced: boolean) => React.ReactNode;
}

function EntrySyncImpl({ userId, workspaceId, projectId, children }: EntrySyncProps) {
    const db = useRxdb();
    const entryCollection = db.collections.entries;

    const [replicaState, setReplicateState] = useState<RxFirestoreReplicationState<Entry>>();

    const timestampMap = useMemo(() => new Map<string, number>(), []);

    // Start syncing the workspace when the user is logged in
    useEffect(() => {
        const replicateState = createFirebaseReplication<Entry>({
            userId,
            rxCollection: entryCollection,
            remotePath: ['workspaces', workspaceId, 'projects', projectId, 'entries'],
            pullModifier: async (doc) => {
                if (doc._deleted) {
                    return doc;
                }

                const localDoc = await entryCollection.getLocal(doc.id);
                if (localDoc && localDoc._data.data.timestamp >= doc.contentTimestamp) {
                    return doc;
                }

                try {
                    const storage = getStorage();
                    const docRef = ref(storage, `docs/${workspaceId}/${projectId}/${doc.id}`);
                    const downloadUrl = await getDownloadURL(docRef);
                    const response = await fetch(downloadUrl);
                    const buffer = await response.arrayBuffer();
                    const remoteUpdate = new Uint8Array(buffer);
                    const localUpdate = new Uint8Array(localDoc?._data.data.update ?? [0]);
                    const mergedUpdate = mergeUpdates([localUpdate, remoteUpdate]);

                    await entryCollection.upsertLocal(doc.id, {
                        timestamp: doc.contentTimestamp ?? 0,
                        update: mergedUpdate
                    });
                } catch (e) {
                    console.error('Failed to download doc content', e);
                }

                console.debug(`${doc.id} - Pulled doc`, doc);

                return doc;
            },
            pushFilter: (doc) => doc.workspaceId === workspaceId && doc.projectId === projectId,
            pushModifier: async (doc) => {
                const latestTimestamp = timestampMap.get(doc.id) ?? 0;
                const docTimestamp = doc.contentTimestamp ?? 0;

                if (docTimestamp <= latestTimestamp) {
                    return doc;
                }

                timestampMap.set(doc.id, docTimestamp);

                const storage = getStorage();
                const docRef = ref(storage, `docs/${workspaceId}/${projectId}/${doc.id}`);

                const localDoc = await entryCollection.getLocal(doc.id);
                if (!localDoc) {
                    return doc;
                }

                const uploadBuffer = new Uint8Array(localDoc._data.data.update);
                await uploadBytes(docRef, uploadBuffer);

                console.log(`${doc.id} - Pushing doc`, doc);

                return doc;
            },
        });

        const initializeReplication = async () => {
            entryCollection.insertLocal('last-in-sync', { time: 0 }).catch(() => void 0);
            replicateState.active$.subscribe(async () => {
                await replicateState.awaitInSync();
                await entryCollection.upsertLocal('last-in-sync', { time: Date.now() });
            });

            // Sync the project data from the last 24 hours
            const oneDay = 1000 * 60 * 60 * 24;

            await firstValueFrom(
                entryCollection.getLocal$('last-in-sync').pipe(
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
    }, [db, userId, workspaceId, projectId, timestampMap, entryCollection]);

    return children(replicaState !== undefined);
}

export const EntrySync = memo(EntrySyncImpl, shallowEqualByKey('userId', 'workspaceId', 'projectId'));
