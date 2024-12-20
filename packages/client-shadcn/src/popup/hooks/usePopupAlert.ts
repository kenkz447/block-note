import { useEventEmitter } from '@writefy/client-shared';
import { popupEvents } from '../popupEvents';

export const usePopupAlert = () => {
    const emitShow = useEventEmitter(popupEvents.alert.show);
    const emitHide = useEventEmitter(popupEvents.alert.hide);

    return {
        openAlert: emitShow,
        closeAlert: emitHide
    };
};
