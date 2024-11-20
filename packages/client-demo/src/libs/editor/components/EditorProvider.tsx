import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorContextType } from '../editorContext';
import { createDefaultDocCollection, initDefaultDocCollection } from '../utils/docCollectionUtils';
import { DocCollection } from '@blocksuite/store';
import { useEntries, useRxdb } from '@writefy/client-shared';
import { createDefaultDoc } from '@blocksuite/blocks';


const ANONYMOUS_COLLECTION_NAME = 'blocksuite-anonymous';

interface EditorProviderProps {
    readonly workspaceId: string;
    readonly projectId: string;
    readonly children: (editorContext: EditorContextType) => React.ReactNode;
}

export function EditorProvider({ workspaceId, projectId, children }: EditorProviderProps) {
    const db = useRxdb();

    const {
        insert: insertEntry,
        checkEntryExists,
        collection: entryCollection
    } = useEntries({ workspaceId, projectId });

    const docCollections = useRef<DocCollection[]>([]);
    const [activeCollectionId, setActiveCollectionId] = useState<string>(ANONYMOUS_COLLECTION_NAME);
    const [docCollection, setDocCollection] = useState<DocCollection>();

    const setupCollection = useCallback(async (collectionId: string) => {
        if (!db) {
            return;
        }

        const collection = await createDefaultDocCollection(db, collectionId);
        await initDefaultDocCollection(collection);

        const entries = await entryCollection.find().exec();

        for (const entry of entries) {
            const existingDoc = collection.getDoc(entry.id);
            if (existingDoc) {
                continue;
            }

            createDefaultDoc(collection, { id: entry.id });
        }

        setDocCollection(collection);
        setActiveCollectionId(collection.id);
    }, [db]);

    useEffect(() => {
        if (activeCollectionId !== docCollection?.id) {
            docCollection?.waitForGracefulStop().then(() => {
                docCollection?.forceStop();
                setDocCollection(undefined);
            });
        }
    }, [activeCollectionId, docCollection]);

    useEffect(() => {
        const skipCreateCollection = !activeCollectionId || docCollection;
        if (skipCreateCollection) {
            return;
        }

        const existingCollection = docCollections.current.find((collection) => collection.id === activeCollectionId);

        if (existingCollection) {
            setDocCollection(existingCollection);
        }
        else {
            setupCollection(activeCollectionId);
        }

    }, [activeCollectionId, docCollection, setupCollection]);

    /**
     * Subscribe events
     */
    useEffect(() => {
        if (!docCollection) {
            return;
        }

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
                createDefaultDoc(docCollection, { id: e.documentId });
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

        const docAdded = docCollection.slots.docAdded.on(async (docId) => {
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
        };
    }, [checkEntryExists, docCollection, entryCollection.insert$, entryCollection.remove$, insertEntry]);

    const contextValue = useMemo((): EditorContextType => {
        return {
            collection: docCollection
        };
    }, [docCollection]);

    return children(contextValue);
}
