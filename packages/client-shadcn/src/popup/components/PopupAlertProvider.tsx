import { PropsWithChildren, useMemo, useState } from 'react';
import { PopupAlertContext, PopupAlertContextType, PopupDialogProps } from '../popupContexts';
import { PopupAlert } from './PopupAlert';

export const PopupAlertProvider = ({ children }: PropsWithChildren) => {
    const [dialogProps, setDialogProps] = useState<PopupDialogProps>(() => ({
        visible: false,
        content: null,
    }));

    const popupAlertContext = useMemo((): PopupAlertContextType => ({
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
        <PopupAlertContext.Provider value={popupAlertContext}>
            {children}
            <PopupAlert />
        </PopupAlertContext.Provider>
    );
};
