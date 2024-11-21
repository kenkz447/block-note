import { useContext } from 'react';
import { EditorContext } from '../editorContext';

export const useDocCollection = () => {
    const editorContext = useContext(EditorContext);
    if (!editorContext) {
        throw new Error('EditorContext is not provided');
    }

    const { collection } = editorContext;

    if (!collection) {
        throw new Error('Collection missing from EditorContext');
    }

    return collection;
};
