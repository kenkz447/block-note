import { useEffect, useRef } from "react";
import { useEditorContext } from "../hooks/useEditorContext";

export function EditorContainer() {

    const { editor } = useEditorContext();

    const editorContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorContainerRef.current && editor) {
            editorContainerRef.current.innerHTML = '';
            editorContainerRef.current.appendChild(editor);
        }
    }, [editor]);

    return (
        <div className="editor-container" ref={editorContainerRef}></div>
    )
}
