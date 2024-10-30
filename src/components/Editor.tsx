import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { useDarkMode } from 'usehooks-ts';

export function Editor() {
  // Creates a new editor instance.
  const editor = useCreateBlockNote({
  });

  const { isDarkMode } = useDarkMode()

  // Renders the editor instance using a React component.
  return (
    <div className='editor-wrapper'>
      <BlockNoteView theme={isDarkMode ? 'dark' : 'light'} editor={editor} />
    </div>
  );
}
