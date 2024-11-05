import { useEffect, useRef } from "react";
import { useEditorContext } from "../hooks/useEditorContext";
import { Entry } from "@/libs/rxdb";
import { IndexeddbPersistence } from "y-indexeddb";

interface EditorContainerProps {
    readonly entry: Entry;
}

export function EditorContainer({ entry }: EditorContainerProps) {

    const { editor } = useEditorContext();

    const editorContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorContainerRef.current && editor) {
            editorContainerRef.current.innerHTML = '';
            editorContainerRef.current.appendChild(editor);
        }
    }, [editor]);

    return (
        <div className="editor-container h-full" ref={editorContainerRef}></div>
    )
}
