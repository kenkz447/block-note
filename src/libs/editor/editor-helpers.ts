
import { AffineEditorContainer } from '@blocksuite/presets';
import { Doc, Schema } from '@blocksuite/store';
import { DocCollection, Text } from '@blocksuite/store';
import { AffineSchemas } from '@blocksuite/blocks';
import { IndexeddbPersistence } from 'y-indexeddb';

export interface EditorContextType {
  editor: AffineEditorContainer | null;
  collection: DocCollection | null;
  updateCollection: (newCollection: DocCollection) => void;
}

export function initEditor() {
  const schema = new Schema().register(AffineSchemas);
  const collection = new DocCollection({ schema });

  collection.meta.initialize();

  const editor = new AffineEditorContainer();

  const doc = collection.createDoc({ id: 'getting-started' });

  // const provider = new IndexeddbPersistence('provider-demo', doc.spaceDoc);
  // // initDoc(doc);

  // provider.on('synced', () => {
  //   doc.load(() => {
  //     if (doc.blocks.size === 0) {
  //       const pageBlockId = doc.addBlock('affine:page', {
  //         title: new Text('Getting Started'),
  //       });
  //       doc.addBlock('affine:surface', {}, pageBlockId);
  //       const noteId = doc.addBlock('affine:note', {}, pageBlockId);
  //       doc.addBlock(
  //         'affine:paragraph',
  //         { text: new Text('Hello World!') },
  //         noteId
  //       );
  //     }
  //   });
  // });

  editor.doc = doc;

  editor.slots.docLinkClicked.on(({ docId }) => {
    const target = <Doc>collection.getDoc(docId);
    editor.doc = target;
  });

  return { editor, collection };
}