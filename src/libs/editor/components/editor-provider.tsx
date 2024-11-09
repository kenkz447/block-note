import React, { useCallback, useEffect, useRef, useState } from "react";
import { EditorContext } from '../editor-context';
import { createDefaultDocCollection, initDefaultDocCollection } from '../utils/editor-collection-utils';
import { effects as blocksEffects } from '@blocksuite/blocks/effects';
import { effects as presetsEffects } from '@blocksuite/presets/effects';
import { useCurrentUser } from "@/libs/auth";
import { DocCollection } from "@blocksuite/store";

blocksEffects();
presetsEffects();

const ANONYMOUS_COLECTION_NAME = 'blocksuite-anonymous';

export function EditorProvider({ children }: React.PropsWithChildren) {
  const { currentUser } = useCurrentUser();

  const collections = useRef<DocCollection[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string>();
  const [collection, setCollection] = useState<DocCollection>();

  const setupCollection = useCallback(async (collectionId: string) => {
    const syncEnable = !!currentUser;
    const collection = await createDefaultDocCollection(collectionId, syncEnable);
    await initDefaultDocCollection(collection);

    setCollection(collection);
  }, [currentUser]);

  useEffect(() => {
    if (!activeCollectionId) {
      return;
    }

    const existingcollection = collections.current.find((collection) => collection.id === activeCollectionId);

    if (existingcollection) {
      setCollection(existingcollection);
    }
    else {
      setupCollection(activeCollectionId);
    }

  }, [activeCollectionId, setupCollection]);

  useEffect(() => {
    collection?.start();
    return () => {
      collection?.waitForGracefulStop().then(collection?.forceStop);
    };
  }, [collection]);

  useEffect(() => {
    if (!currentUser) {
      setActiveCollectionId(ANONYMOUS_COLECTION_NAME);
    }
    else {
      setActiveCollectionId(currentUser.uid);
    }
  }, [currentUser]);

  if (!collection || !collection.meta) {
    return null;
  }

  return (
    <EditorContext.Provider value={{ collection }}>
      {children}
    </EditorContext.Provider>
  );
}
