import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { EditorContextType } from '../editorContext';
import { createDefaultDocCollection, initDefaultDocCollection } from '../utils/docCollectionUtils';
import { DocCollection } from '@blocksuite/store';
import { useEntries, useRxdb } from '@writefy/client-shared';
import { createDefaultDoc } from '@blocksuite/blocks';

import { effects as blocksEffects } from '@blocksuite/blocks/effects';
import { effects as presetsEffects } from '@blocksuite/presets/effects';
import { shallowEqualByKey } from '@writefy/client-shared/src/utils';

blocksEffects();
presetsEffects();

interface EditorProviderProps {
    readonly workspaceId: string;
    readonly projectId: string;
    readonly children: (editorContext: EditorContextType) => React.ReactNode;
}

function EditorProviderImpl({
    workspaceId,
    projectId,
    children
}: EditorProviderProps) {
    const db = useRxdb();

    const {
        insert: insertEntry,
        checkEntryExists,
        collection: entryCollection
    } = useEntries({ workspaceId, projectId });

    const [docCollection, setDocCollection] = useState<DocCollection>();

    const setupCollection = useCallback(async () => {
        const collection = await createDefaultDocCollection({
            db,
            collectionId: 'local:collection',
            enableSync: db.name !== 'user_anonymous',
            messageChannel: `/docs/${workspaceId}/${projectId}`
        });

        await initDefaultDocCollection(collection, 'local:home');

        const entries = await entryCollection.find().exec();

        for (const entry of entries) {
            const existingDoc = collection.getDoc(entry.id);
            if (existingDoc) {
                continue;
            }

            createDefaultDoc(
                collection,
                { id: entry.id, title: entry.name }
            );
        }

        collection.docs.forEach((doc) => {
            const isEntryExists = entries.find((e) => e.id === doc.id);
            if (!isEntryExists) {
                collection.removeDoc(doc.id);
            }
        });

        return collection;
    }, [db, entryCollection, projectId, workspaceId]);

    useEffect(() => {
        let closeCollection: () => void;
        setupCollection()
            .then(async (collection) => {
                setDocCollection(collection);
                closeCollection = async () => {
                    await collection.waitForGracefulStop();
                    collection.forceStop();
                };
            });

        return () => {
            closeCollection();
            setDocCollection(undefined);
        };
    }, [setupCollection]);

    /**
     * Subscribe events
     */
    useEffect(() => {
        if (!docCollection) {
            return;
        }

        // RxDB events handling
        const entriesSubscribes = [
            // Create a new document in the editor collection when a new entry is created in the database
            entryCollection.insert$.subscribe((e) => {
                if (e.documentData.type === 'folder') {
                    return;
                }
                const isDocExists = docCollection.getDoc(e.documentId);
                if (isDocExists) {
                    return;
                }
                createDefaultDoc(docCollection, { id: e.documentId, title: e.documentData.name });
            }),
            entryCollection.remove$.subscribe((e) => {
                if (e.documentData.type === 'folder') {
                    return;
                }
                const isDocExists = docCollection.getDoc(e.documentId);
                if (!isDocExists) {
                    return;
                }
                docCollection.removeDoc(e.documentId);
            })
        ];

        // Blocksuite events handling
        const docAdded = docCollection.slots.docAdded.on(async (docId) => {
            if (docId.startsWith('local')) {
                return;
            }

            const isEntryExists = await checkEntryExists(docId);
            if (isEntryExists) {
                return;
            }

            await insertEntry({
                id: docId,
                parent: null,
                type: 'document',
                name: 'Untitled Document'
            });
        });

        return () => {
            entriesSubscribes.forEach((s) => s.unsubscribe());
            docAdded.dispose();
            // docUpdated.dispose();
        };
    }, [checkEntryExists, docCollection, entryCollection.insert$, entryCollection.remove$, entryCollection.update$, insertEntry]);

    const contextValue = useMemo((): EditorContextType => {
        return {
            collection: docCollection,
        };
    }, [docCollection]);

    return children(contextValue);
}

export const EditorProvider = React.memo(EditorProviderImpl, shallowEqualByKey('workspaceId', 'projectId'));
