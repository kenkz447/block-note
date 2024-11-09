import { useEditorContext } from "@/libs/editor/hooks/useEditorContext";
import { useEntries } from "@/libs/rxdb/hooks/useEntries";
import React, { useEffect } from "react";

export function EditorBridgeProvider({ children }: React.PropsWithChildren) {
    const { collection } = useEditorContext();
    const { insert, checkEntryExists } = useEntries();

    useEffect(() => {
        const disposable = collection.slots.docAdded.on(async (docId) => {
            const isEntryExists = await checkEntryExists(docId);
            if (isEntryExists) {
                return;
            }

            insert({
                id: docId,
                type: 'document',
                parent: null,
            });
        });

        return () => {
            disposable.dispose();
        }
    }, [checkEntryExists, collection, insert]);

    return children;
}
