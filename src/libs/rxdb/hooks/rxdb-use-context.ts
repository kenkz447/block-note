import { useContext } from "react"
import { RxdbContext } from "../rxdb-context"

export const useRxdbContext = () => {
    const context = useContext(RxdbContext)
    if(!context) {
        throw new Error("useRxdbContext must be used within a RxdbContextProvider")
    }

    return context;
}