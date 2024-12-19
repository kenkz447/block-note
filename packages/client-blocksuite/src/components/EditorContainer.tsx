import './EditorContainer.css';

import { useEffect, useMemo, useRef } from 'react';
import { useDocCollection } from '../hooks/useDocCollection';
import { Entry } from '@writefy/client-shared';
import { setupEditor } from '../utils/editorUtils';
import { ColorScheme, RefNodeSlotsProvider } from '@blocksuite/blocks';
import { useNavigate } from '@tanstack/react-router';
import { cn, useTheme } from '@writefy/client-shadcn';
import { editorTheme } from '../editorServices';
import { usePageSettings } from '../hooks/useEditorSettings';

interface EditorContainerProps {
    readonly entry: Entry;
}

export function EditorContainer({ entry }: EditorContainerProps) {
    const { settings } = usePageSettings();

    const { theme } = useTheme();

    const docCollection = useDocCollection();

    if (!docCollection) {
        throw new Error('docCollection is not defined');
    }

    const navigate = useNavigate();

    const editorContainerRef = useRef<HTMLDivElement>(null);

    const editor = useMemo(() => {
        return setupEditor(docCollection, entry.id);
    }, [docCollection, entry.id]);

    useEffect(() => {
        if (editorContainerRef.current && editor) {
            editorContainerRef.current.innerHTML = '';
            editorContainerRef.current.appendChild(editor);
        }
    }, [editor]);

    useEffect(() => {
        editor?.switchEditor(settings.mode);
    }, [editor, settings.mode]);

    useEffect(() => {
        if (!editor) {
            return;
        }

        const disposable = editor.std
            .get(RefNodeSlotsProvider)
            .docLinkClicked.on(({ pageId: docId }) => {
                const target = docCollection!.getDoc(docId);
                if (!target) {
                    throw new Error(`Failed to jump to doc ${docId}`);
                }

                navigate({
                    to: '/app/editor/$workspaceId/$projectId/$entryId',
                    params: {
                        workspaceId: entry.workspaceId,
                        projectId: entry.projectId,
                        entryId: docId,
                    }
                });
            });

        return () => {
            disposable.dispose();
            editor.remove();
        };
    }, [docCollection, editor, entry.projectId, entry.workspaceId, navigate]);

    // Set editor theme
    useEffect(() => {
        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
            const editorColorScheme = systemTheme.matches ? ColorScheme.Dark : ColorScheme.Light;
            editorTheme.setTheme(editorColorScheme);
            return;
        }

        const editorColorScheme = theme === 'dark' ? ColorScheme.Dark : ColorScheme.Light;
        editorTheme.setTheme(editorColorScheme);
    }, [theme]);

    const classNames = cn('editor-container', {
        'size-full': settings.pageWidth === '100%',
        'size-75': settings.pageWidth === '75%',
        'size-50': settings.pageWidth === '50%',
        'h-full': settings.mode === 'edgeless',
    });

    return (
        <div className={classNames} ref={editorContainerRef} />
    );
}
