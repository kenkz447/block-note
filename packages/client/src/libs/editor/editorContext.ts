import { createContext } from 'react';

import { DocCollection } from '@blocksuite/store';

export interface EditorContextType {
  readonly collection?: DocCollection;
}

export const EditorContext = createContext<EditorContextType | null>(null);
