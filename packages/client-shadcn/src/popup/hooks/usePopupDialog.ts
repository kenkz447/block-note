import { useEventEmitter } from '@writefy/client-shared';
import { popupEvents } from '../popupEvents';
import { useCallback } from 'react';

export const usePopupDialog = () => {
    const emitShow = useEventEmitter(popupEvents.dialog.show);
    const emitHide = useEventEmitter(popupEvents.dialog.hide);

    return {
        openDialog: emitShow,
        closeDialog: useCallback(() => emitHide(undefined), [emitHide])
    };
};
