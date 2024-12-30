import { useEventEmitter } from '@writefy/client-shared';
import { popupEvents } from '../popupEvents';
import { useCallback } from 'react';

export const usePopupDialog = () => {
    const emitShow = useEventEmitter(popupEvents.alert.show);
    const emitHide = useEventEmitter(popupEvents.alert.hide);

    return {
        openDialog: emitShow,
        closeDialog: useCallback(() => emitHide(undefined), [emitHide])
    };
};
