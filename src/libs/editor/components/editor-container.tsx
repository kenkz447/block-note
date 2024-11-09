import { useEffect, useRef } from "react";
import { useEditorContext } from "../hooks/useEditorContext";
import { Entry } from "@/libs/rxdb";
import { AffineEditorContainer } from "@blocksuite/presets";

interface EditorContainerProps {
    readonly entry: Entry;
    readonly editor: AffineEditorContainer;
}

export function EditorContainer({ entry, editor }: EditorContainerProps) {
    const { collection } = useEditorContext();

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
