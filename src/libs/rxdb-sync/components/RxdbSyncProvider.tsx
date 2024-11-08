import { useCurrentUser } from "@/libs/auth";
import { useRxdbContext } from "@/libs/rxdb/hooks/useRxdbContext";
import React, { useEffect } from "react";
import { useRxSync } from "../hooks/useRxSync";

export function RxdbSyncProvider({ children }: React.PropsWithChildren) {
    const db = useRxdbContext();
    if (!db) {
        throw new Error("RxdbSyncProvider must be a descendant of RxdbProvider");
    }

    const { currentUser } = useCurrentUser();
    const syncRxCollection = useRxSync();

    useEffect(() => {
        if (!currentUser) {
            return;
        }

        syncRxCollection();
    }, [currentUser, db, syncRxCollection]);

    return children;
}
