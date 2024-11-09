import React, { useCallback, useEffect, useState } from "react";
import { EditorContext, EditorContextType } from '../editor-context';
import { createDefaultDocCollection, initDefaultDocCollection } from '../utils/editor-collection-utils';
import { effects as blocksEffects } from '@blocksuite/blocks/effects';
import { effects as presetsEffects } from '@blocksuite/presets/effects';
import { setupEditor } from "../utils/editor-utils";
import { useEventListener } from "@/hooks/useEvent";
import { useCurrentUser } from "@/libs/auth";

blocksEffects();
presetsEffects();

export function EditorProvider({ children }: React.PropsWithChildren) {
  const { currentUser } = useCurrentUser();

  const [context, setContext] = useState<EditorContextType>();

  const setupContext = useCallback(async () => {
    const collection = await createDefaultDocCollection(currentUser?.uid);
    await initDefaultDocCollection(collection);
    const editor = setupEditor(collection)

    setContext({
      editor,
      collection,
    });

  }, [currentUser?.uid]);

  useEffect(() => {
    setupContext();
  }, [setupContext]);

  if (!context) {
    return null;
  }

  return (
    <EditorContext.Provider value={context}>
      {children}
    </EditorContext.Provider>
  );
}
