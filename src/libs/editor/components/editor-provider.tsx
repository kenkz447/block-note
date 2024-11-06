import React, { useCallback, useEffect, useState } from "react";
import { EditorContext, EditorContextType } from '../editor-context';
import { createDefaultDocCollection, initDefaultDocCollection } from '../utils/editor-collection-utils';
import { effects as blocksEffects } from '@blocksuite/blocks/effects';
import { effects as presetsEffects } from '@blocksuite/presets/effects';
import { setupEditor } from "../utils/editor-utils";

blocksEffects();
presetsEffects();

export function EditorProvider({ children }: React.PropsWithChildren) {

  const [context, setContext] = useState<EditorContextType>();

  const setUpEditor = useCallback(async () => {
    const collection = await createDefaultDocCollection();
    await initDefaultDocCollection(collection);
    const editor = setupEditor(collection)

    setContext({
      editor,
      collection,
    });
  }, []);

  useEffect(() => {
    setUpEditor();
  }, [setUpEditor]);

  if (!context) {
    return null;
  }

  return (
    <EditorContext.Provider value={context}>
      {children}
    </EditorContext.Provider>
  );
}
