import { EditorProvider } from './src/components/EditorProvider';
import { EditorContainer } from './src/components/EditorContainer';
import { EditorSettingsProvider } from './src/components/EditorSettingsProvider';

import { Doc } from '@blocksuite/store';

type EditorDoc = Doc;

export type {
    EditorDoc
};

export {
    EditorProvider,
    EditorContainer,
    EditorSettingsProvider
};

export * from './src/editorContext';
export * from './src/hooks/useEditorSettings';
export * from './src/hooks/useEditorSettings';
