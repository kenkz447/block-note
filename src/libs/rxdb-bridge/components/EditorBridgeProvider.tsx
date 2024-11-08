import { useEditorContext } from "@/libs/editor/hooks/useEditorContext";
import { useEntries } from "@/libs/rxdb/hooks/useEntries";
import React, { useEffect } from "react";

export function EditorBridgeProvider({ children }: React.PropsWithChildren) {
    const { collection } = useEditorContext();
    const { insert } = useEntries();

    useEffect(() => {
        collection.slots.docAdded.on(async (docId) => {
            insert({
                id: docId,
                type: 'document',
                parent: null,
            });
        });
    }, [collection, insert]);

    return children;
}
