import { useContext } from "react";
import { EditorContext } from "../editor-context";

export const useEditorContext = () => {
    const editorContext = useContext(EditorContext);
    if (!editorContext) {
        throw new Error('EditorContext is not provided');
    }

    return editorContext;
}