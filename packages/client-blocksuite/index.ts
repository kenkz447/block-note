import { EditorProvider } from './src/components/EditorProvider';
import { EditorContainer } from './src/components/EditorContainer';

import { Doc } from '@blocksuite/store';

type EditorDoc = Doc;

export type {
    EditorDoc
};

export {
    EditorProvider,
    EditorContainer
};

export * from './src/editorContext';
