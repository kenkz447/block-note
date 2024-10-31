import '@blocksuite/presets/themes/affine.css';

import { useMemo } from "react";
import { EditorContext } from '../editor-context';
import { initEditor } from '../editor-helpers';


export function EditorProvider({ children }: { children: React.ReactNode }) {
  const { editor, collection } = useMemo(() => initEditor(), []);

  // Renders the editor instance using a React component.
  return (
    <EditorContext.Provider value={{ editor, collection }}>
      {children}
    </EditorContext.Provider>
  );
}
