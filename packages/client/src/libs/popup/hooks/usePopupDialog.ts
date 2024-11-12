import React from "react";
import { usePopupDialogContext } from "./usePopupContexts"

export const usePopupDialog = () => {
    const popupDialogContext = usePopupDialogContext();

    return React.useMemo(() => ({
        openDialog: popupDialogContext.openDialog,
        closeDialog: popupDialogContext.closeDialog,
    }), [popupDialogContext]);
}
