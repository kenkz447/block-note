import { useEditorContext } from "@/libs/editor/hooks/useEditorContext";
import { useRxdbContext } from "@/libs/rxdb/hooks/useRxdbContext";
import { createDefaultDoc } from "@blocksuite/blocks";
import React, { useEffect } from "react";

export function RxdbBridgeProvider({ children }: React.PropsWithChildren) {
    const { db } = useRxdbContext();
    const { collection: editorCollection } = useEditorContext();

    useEffect(() => {
        if (!db) {
            return;
        }

        const subscribes = [
            // Create a new document in the editor collection when a new entry is created in the database
            db.collections.entries.insert$.subscribe((e) => {
                if (e.documentData.type === 'folder') {
                    return;
                }
                const isDocExists = editorCollection.getDoc(e.documentId);
                if (isDocExists) {
                    return;
                }
                createDefaultDoc(editorCollection, { id: e.documentId })
            }),
            db.collections.entries.remove$.subscribe((e) => {
                if (e.documentData.type === 'folder') {
                    return;
                }
                const isDocExists = editorCollection.getDoc(e.documentId);
                if (!isDocExists) {
                    return;
                }
                editorCollection.removeDoc(e.documentId)
            })
        ];

        return () => {
            subscribes.forEach((s) => s.unsubscribe());
        }
    }, [db, editorCollection]);

    return children;
}
