import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorContextType } from '../editorContext';
import { createDefaultDocCollection, initDefaultDocCollection } from '../utils/docCollectionUtils';
import { DocCollection } from '@blocksuite/store';
import { RxCollection } from 'rxdb';
import { AppRxDatabase, Entry } from '@/libs/rxdb';
import { createDefaultDoc } from '@blocksuite/blocks';


const ANONYMOUS_COLLECTION_NAME = 'blocksuite-anonymous';

interface EditorProviderProps {
    readonly db: AppRxDatabase;
    readonly children: (editorContext: EditorContextType) => React.ReactNode;
}

export function EditorProvider({ db, children }: EditorProviderProps) {

    const collections = useRef<DocCollection[]>([]);
    const [activeCollectionId, setActiveCollectionId] = useState<string>(ANONYMOUS_COLLECTION_NAME);
    const [collection, setCollection] = useState<DocCollection>();

    const setupCollection = useCallback(async (collectionId: string) => {
        if (!db) {
            return;
        }

        const collection = await createDefaultDocCollection(db, collectionId);
        await initDefaultDocCollection(collection);

        const entryCollection = db.collections.entries as RxCollection<Entry>;
        const entries = await entryCollection.find().exec();

        for (const entry of entries) {
            const existingDoc = collection.getDoc(entry.id);
            if (existingDoc) {
                continue;
            }

            createDefaultDoc(collection, { id: entry.id });
        }

        setCollection(collection);
        setActiveCollectionId(collection.id);
    }, [db]);

    useEffect(() => {
        if (activeCollectionId !== collection?.id) {
            collection?.waitForGracefulStop().then(() => {
                collection?.forceStop();
                setCollection(undefined);
            });
        }
    }, [activeCollectionId, collection]);

    useEffect(() => {
        const skipCreateCollection = !activeCollectionId || collection;
        if (skipCreateCollection) {
            return;
        }

        const existingCollection = collections.current.find((collection) => collection.id === activeCollectionId);

        if (existingCollection) {
            setCollection(existingCollection);
        }
        else {
            setupCollection(activeCollectionId);
        }

    }, [activeCollectionId, collection, setupCollection]);

    const contextValue = useMemo((): EditorContextType => {
        return {
            collection
        };
    }, [collection]);

    return children(contextValue);
}
