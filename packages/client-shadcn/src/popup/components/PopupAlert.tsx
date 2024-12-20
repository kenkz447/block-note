import { useCallback, useState } from 'react';
import { AlertDialog } from '../../primitive';
import { useEventListener } from '@writefy/client-shared';
import { popupEvents } from '../popupEvents';

export interface ShowAlertOptions {
    content: React.ReactNode;
}

interface PopupAlertState extends ShowAlertOptions {
    visible: boolean;
}

export const PopupAlert = () => {
    const [alertState, setAlertState] = useState<PopupAlertState>({ visible: false, content: null });

    const hide = useCallback(() => {
        setAlertState(({ content }) => ({ visible: false, content: content }));
    }, []);

    useEventListener({
        event: popupEvents.alert.show,
        handler: useCallback((options?: ShowAlertOptions) => {
            if (!options) {
                throw new Error('popup-alert:show event must have options');
            }

            setAlertState({
                content: options.content,
                visible: true
            });
        }, [])
    });

    useEventListener({
        event: popupEvents.alert.hide,
        handler: hide
    });

    const onOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            hide();
        }
    };

    return (
        <AlertDialog open={alertState.visible} onOpenChange={onOpenChange}>
            {alertState.content}
        </AlertDialog>
    );
};
