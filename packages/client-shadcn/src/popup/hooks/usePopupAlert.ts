import React from 'react';
import { usePopupAlertContext } from './usePopupAlertContext';

export const usePopupAlert = () => {
    const popupDialogContext = usePopupAlertContext();

    return React.useMemo(() => ({
        openAlert: popupDialogContext.openDialog,
        closeAlert: popupDialogContext.closeDialog,
    }), [popupDialogContext]);
};
