import { useContext } from 'react';
import { EditorContext } from '../editorContext';

export const useEditorContext = () => {
    const editorContext = useContext(EditorContext);
    if (!editorContext) {
        throw new Error('EditorContext is not provided');
    }

    return editorContext;
};
