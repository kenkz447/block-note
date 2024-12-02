import { Dialog } from '../../primitive';
import { usePopupDialogContext } from '../hooks/usePopupDialogContext';

export const PopupDialog = () => {
    const popupDialogContext = usePopupDialogContext();

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
        <Dialog open={dialogProps?.visible} onOpenChange={onOpenChange}>
            {dialogProps?.content}
        </Dialog>
    );
};
