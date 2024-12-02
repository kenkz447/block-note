import { AlertDialog } from '../../primitive';
import { usePopupAlertContext } from '../hooks/usePopupAlertContext';

export const PopupAlert = () => {
    const popupDialogContext = usePopupAlertContext();

    if (!popupDialogContext) {
        return null;
    }

    const { dialogProps, closeDialog } = popupDialogContext;

    const onOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            closeDialog();
        }
    };

    return (
        <AlertDialog open={dialogProps?.visible} onOpenChange={onOpenChange}>
            {dialogProps?.content}
        </AlertDialog>
    );
};
