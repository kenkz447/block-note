import { useEventEmitter } from '@writefy/client-shared';
import { useCallback } from 'react';
import { ShowAlertOptions } from '../components/PopupAlert';

export const usePopupAlert = () => {
    const emitShow = useEventEmitter<ShowAlertOptions>('popup-alert:show');
    const emitHide = useEventEmitter('popup-alert:hide');

    return {
        openAlert: useCallback(({ content }: ShowAlertOptions) => {
            emitShow({ content });
        }, [emitShow]),
        closeAlert: useCallback(() => {
            emitHide();
        }, [emitHide])
    };
};
