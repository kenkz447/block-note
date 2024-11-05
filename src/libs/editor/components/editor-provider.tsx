import '@blocksuite/presets/themes/affine.css';

import React, { useMemo } from "react";
import { EditorContext } from '../editor-context';
import { Entry } from '@/libs/rxdb';
import { AffineSchemas } from '@blocksuite/blocks';
import { Doc, DocCollection, Schema, Text } from '@blocksuite/store';
import { AffineEditorContainer } from '@blocksuite/presets';
import { IndexeddbPersistence } from 'y-indexeddb';

interface EditorProviderProps {
  readonly entry: Entry;
}

export function EditorProvider({ entry, children }: React.PropsWithChildren<EditorProviderProps>) {

  const context = useMemo(() => {
    const schema = new Schema().register(AffineSchemas);
    const collection = new DocCollection({ schema });

    collection.meta.initialize();


    const doc = collection.createDoc({ id: entry.id });

    const provider = new IndexeddbPersistence(`doc_${doc.id}`, doc.spaceDoc);
    // initDoc(doc);

    provider.on('synced', () => {
      doc.load(() => {
        if (doc.blocks.size === 0) {
          const pageBlockId = doc.addBlock('affine:page', {
            title: new Text(entry.name),
          });
          doc.addBlock('affine:surface', {}, pageBlockId);
          const noteId = doc.addBlock('affine:note', {}, pageBlockId);
          doc.addBlock(
            'affine:paragraph',
            { text: new Text('Hello World!') },
            noteId
          );
        }
      });
    });

    const editor = new AffineEditorContainer();

    editor.doc = doc;

    editor.slots.docLinkClicked.on(({ docId }) => {
      const target = collection.getDoc(docId) as Doc;
      editor.doc = target;
    });

    return { editor, collection };
  }, []);

  return (
    <EditorContext.Provider value={context}>
      {children}
    </EditorContext.Provider>
  );
}
