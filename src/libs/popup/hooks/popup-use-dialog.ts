import React from "react";
import { usePopupDialogContext } from "./popup-use-contexts"

export const usePopupDialog = () => {
    const popupDialogContext = usePopupDialogContext();

    return React.useMemo(() => ({
        openDialog: popupDialogContext.openDialog,
        closeDialog: popupDialogContext.closeDialog,
    }), [popupDialogContext]);
}