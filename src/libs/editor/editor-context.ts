import { createContext } from "react";

import { AffineEditorContainer } from '@blocksuite/presets';
import { DocCollection } from '@blocksuite/store';

export interface EditorContextType {
  readonly editor: AffineEditorContainer;
  readonly collection: DocCollection;
}

export const EditorContext = createContext<EditorContextType | null>(null);
