import { useEventListener } from '@writefy/client-shared';
import { Dialog } from '../../primitive';
import { popupEvents } from '../popupEvents';
import { useCallback, useState } from 'react';

export interface ShowDialogOptions {
    content: React.ReactNode;
}

interface PopupDialogState extends ShowDialogOptions {
    visible: boolean;
}

export const PopupDialog = () => {
    const [dialogState, setDialogState] = useState<PopupDialogState>({ visible: false, content: null });

    const hide = useCallback(() => {
        setDialogState(({ content }) => ({ visible: false, content: content }));
    }, []);

    useEventListener({
        event: popupEvents.dialog.show,
        handler: useCallback((options?: ShowDialogOptions) => {
            if (!options) {
                throw new Error('popup-dialog:show event must have options');
            }

            setDialogState({
                content: options.content,
                visible: true
            });
        }, [])
    });

    useEventListener({
        event: popupEvents.dialog.hide,
        handler: hide
    });

    const onOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            hide();
        }
    };

    return (
        <Dialog open={dialogState.visible} onOpenChange={onOpenChange}>
            {dialogState.content}
        </Dialog>
    );
};
