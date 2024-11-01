import { PropsWithChildren, useMemo, useState } from "react";
import { PopupDialogContext, PopupDialogContextType, PopupDialogProps } from "../popup-contexts";
import { PopupDialog } from "./popup-dialog";

export const PopupProvider = ({ children }: PropsWithChildren) => {
    const [dialogProps, setDialogProps] = useState<PopupDialogProps>(() => ({
        visible: false,
        title: '',
    }));

    const dialogContext = useMemo((): PopupDialogContextType => ({
        dialogProps,
        openDialog: (dialogProps) => setDialogProps({
            ...dialogProps,
            visible: true,
        }),
        closeDialog: () => setDialogProps({
            ...dialogProps,
            visible: false,
        })
    }), [dialogProps]);

    return (
        <PopupDialogContext.Provider value={dialogContext}>
            {children}
            <PopupDialog />
        </PopupDialogContext.Provider>
    )
};