import { useContext } from 'react';
import { PopupAlertContext } from '../popupContexts';

export const usePopupAlertContext = () => {
    const context = useContext(PopupAlertContext);
    if (!context) {
        throw new Error('usePopupAlertContext must be used within a PopupAlertProvider');
    }
    return context;
};
