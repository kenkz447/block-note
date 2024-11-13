import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorContextType } from '../editorContext';
import { createDefaultDocCollection, initDefaultDocCollection } from '../utils/docCollectionUtils';
import { DocCollection } from '@blocksuite/store';
import { User } from 'firebase/auth';
import { RxCollection, RxDatabase } from 'rxdb';
import { Entry } from '@/libs/rxdb';
import { createDefaultDoc } from '@blocksuite/blocks';


const ANONYMOUS_COLLECTION_NAME = 'blocksuite-anonymous';

interface EditorProviderProps {
    readonly db: RxDatabase;
    readonly currentUser: User | null;
    readonly sync: boolean;
    readonly children: (editorContext: EditorContextType) => React.ReactNode;
}

export function EditorProvider({ db, currentUser, sync, children }: EditorProviderProps) {

    const collections = useRef<DocCollection[]>([]);
    const [activeCollectionId, setActiveCollectionId] = useState<string>();
    const [collection, setCollection] = useState<DocCollection>();

    const setupCollection = useCallback(async (collectionId: string) => {
        if (!db) {
            return;
        }

        const collection = await createDefaultDocCollection(db, collectionId, sync);
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
    }, [db, sync]);

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

    useEffect(() => {
        if (!currentUser) {
            setActiveCollectionId(ANONYMOUS_COLLECTION_NAME);
        }
        else {
            setActiveCollectionId(currentUser.uid);
        }
    }, [currentUser]);

    const contextValue = useMemo((): EditorContextType => {
        return {
            collection
        };
    }, [collection]);

    return children(contextValue)
}
