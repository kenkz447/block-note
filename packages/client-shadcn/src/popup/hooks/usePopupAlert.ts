import React from 'react';
import { usePopupAlertContext } from './usePopupAlertContext';

export const usePopupAlert = () => {
    const popupDialogContext = usePopupAlertContext();

    return React.useMemo(() => ({
        openDialog: popupDialogContext.openDialog,
        closeDialog: popupDialogContext.closeDialog,
    }), [popupDialogContext]);
};
