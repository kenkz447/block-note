import { useCallback } from "react"
import { useRxdbContext } from "./useRxdbContext";

export const useRxdbClean = () => {
    const { db } = useRxdbContext();

    const onClean = useCallback(async () => {
        await db.remove();
    }, [db])

    return onClean;
}
