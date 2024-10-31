import { createContext } from "react";

import { AffineEditorContainer } from '@blocksuite/presets';
import { DocCollection } from '@blocksuite/store';
import '@blocksuite/presets/themes/affine.css';

export const EditorContext = createContext<{
    editor: AffineEditorContainer;
    collection: DocCollection;
  } | null>(null);
  