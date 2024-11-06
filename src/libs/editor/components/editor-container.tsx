import { useEffect, useRef } from "react";
import { useEditorContext } from "../hooks/useEditorContext";
import { Entry } from "@/libs/rxdb";

interface EditorContainerProps {
    readonly entry: Entry;
}

export function EditorContainer({ entry }: EditorContainerProps) {

    const { editor, collection } = useEditorContext();

    const editorContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorContainerRef.current && editor) {
            editorContainerRef.current.innerHTML = '';
            editorContainerRef.current.appendChild(editor);
        }
    }, [editor]);

    useEffect(() => {
        const doc = collection.getDoc(entry.id);
        if (!doc) {
            console.error(`Failed to get doc: ${entry.id}`);
            return;
        }

        doc.load();
        doc.resetHistory();
        editor.doc = doc;
    }, [collection, editor, entry]);

    return (
        <div className="editor-container h-full" ref={editorContainerRef}></div>
    )
}
