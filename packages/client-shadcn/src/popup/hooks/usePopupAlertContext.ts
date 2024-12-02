import { useContext } from 'react';
import { PopupDialogContext } from '../popupContexts';

export const usePopupAlertContext = () => {
    const context = useContext(PopupDialogContext);
    if (!context) {
        throw new Error('usePopupAlertContext must be used within a PopupProvider');
    }
    return context;
};
