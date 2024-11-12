import { useEffect, useMemo, useRef } from 'react';
import { useEditorContext } from '../hooks/useEditorContext';
import { Entry } from '@/libs/rxdb';
import { setupEditor } from '../utils/editorUtils';
import { RefNodeSlotsProvider } from '@blocksuite/blocks';
import { useNavigate } from '@tanstack/react-router';

interface EditorContainerProps {
    readonly entry: Entry;
}

export function EditorContainer({ entry }: EditorContainerProps) {
    const { collection } = useEditorContext();

    if (!collection) {
        throw new Error('Collection is not defined');
    }

    const navigate = useNavigate();

    const editorContainerRef = useRef<HTMLDivElement>(null);

    const editor = useMemo(() => {
        const doc = collection!.getDoc(entry.id);
        if (!doc) {
            console.error(`Failed to get doc: ${entry.id}`);
            return;
        }

        doc.load();
        doc.resetHistory();

        const editor = setupEditor(collection);
        editor.doc = doc;
        return editor;

    }, [collection, entry.id]);

    useEffect(() => {
        if (editorContainerRef.current && editor) {
            editorContainerRef.current.innerHTML = '';
            editorContainerRef.current.appendChild(editor);
        }
    }, [editor]);

    useEffect(() => {
        if (!editor) {
            return;
        }

        const disposable = editor.std
            .get(RefNodeSlotsProvider)
            .docLinkClicked.on(({ pageId: docId }) => {
                const target = collection!.getDoc(docId);
                if (!target) {
                    throw new Error(`Failed to jump to doc ${docId}`);
                }

                navigate({
                    from: '/',
                    search: {
                        entryId: target.id
                    }
                });
            });

        return () => {
            disposable.dispose();
        };
    }, [collection, editor, navigate]);

    return (
        <div className="editor-container h-full" ref={editorContainerRef}></div>
    );
}
