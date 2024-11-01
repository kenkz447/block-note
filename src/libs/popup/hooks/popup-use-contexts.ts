import { useContext } from "react";
import { PopupDialogContext } from "../popup-contexts";

export const usePopupDialogContext = () => {
    const context = useContext(PopupDialogContext);
    if (!context) {
        throw new Error('usePopupDialogContext must be used within a PopupProvider');
    }
    return context;
}