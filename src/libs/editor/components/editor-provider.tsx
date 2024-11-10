import React, { useCallback, useEffect, useRef, useState } from "react";
import { EditorContext } from '../editor-context';
import { createDefaultDocCollection, initDefaultDocCollection } from '../utils/editor-collection-utils';
import { effects as blocksEffects } from '@blocksuite/blocks/effects';
import { effects as presetsEffects } from '@blocksuite/presets/effects';
import { DocCollection } from "@blocksuite/store";
import { User } from "firebase/auth";

blocksEffects();
presetsEffects();

const ANONYMOUS_COLECTION_NAME = 'blocksuite-anonymous';

interface EditorProviderProps {
  readonly currentUser: User | null;
  readonly sync: boolean;
}

export function EditorProvider({ currentUser, sync, children }: React.PropsWithChildren<EditorProviderProps>) {
  const collections = useRef<DocCollection[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string>();
  const [collection, setCollection] = useState<DocCollection>();

  const setupCollection = useCallback(async (collectionId: string) => {
    const collection = await createDefaultDocCollection(collectionId, sync);
    await initDefaultDocCollection(collection);

    setCollection(collection);
  }, [sync]);

  useEffect(() => {
    if (activeCollectionId !== collection?.id) {
      collection?.waitForGracefulStop().then(() => {
        collection?.forceStop();
        setCollection(undefined);
      });
    }
  }, [activeCollectionId, collection]);

  useEffect(() => {
    const skipCreateColleciton = !activeCollectionId || collection;
    if (skipCreateColleciton) {
      return;
    }

    const existingcollection = collections.current.find((collection) => collection.id === activeCollectionId);

    if (existingcollection) {
      setCollection(existingcollection);
    }
    else {
      setupCollection(activeCollectionId);
    }

  }, [activeCollectionId, collection, setupCollection]);

  useEffect(() => {
    if (!currentUser) {
      setActiveCollectionId(ANONYMOUS_COLECTION_NAME);
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
