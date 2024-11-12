import React, { useCallback, useEffect, useRef, useState } from 'react';
import { EditorContext } from '../editorContext';
import { createDefaultDocCollection, initDefaultDocCollection } from '../utils/docCollectionUtils';
import { effects as blocksEffects } from '@blocksuite/blocks/effects';
import { effects as presetsEffects } from '@blocksuite/presets/effects';
import { DocCollection } from '@blocksuite/store';
import { User } from 'firebase/auth';
import { useRxdbContext } from '@/libs/rxdb';

blocksEffects();
presetsEffects();

const ANONYMOUS_COLLECTION_NAME = 'blocksuite-anonymous';

interface EditorProviderProps {
    readonly currentUser: User | null;
    readonly sync: boolean;
}

export function EditorProvider({ currentUser, sync, children }: React.PropsWithChildren<EditorProviderProps>) {
    const { db } = useRxdbContext();

    const collections = useRef<DocCollection[]>([]);
    const [activeCollectionId, setActiveCollectionId] = useState<string>();
    const [collection, setCollection] = useState<DocCollection>();

    const setupCollection = useCallback(async (collectionId: string) => {
        if (!db) {
            return;
        }

        const collection = await createDefaultDocCollection(db, collectionId, sync);
        await initDefaultDocCollection(collection);

        setCollection(collection);
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

    return (
        <EditorContext.Provider value={{ collection }}>
            {children}
        </EditorContext.Provider>
    );
}
