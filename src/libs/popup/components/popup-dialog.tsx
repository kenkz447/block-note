import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { usePopupDialogContext } from "../hooks/popup-use-contexts"
import { PopupDialogProps } from "../popup-contexts";

const PopupDialogContent = (props: Partial<PopupDialogProps>) => {

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>{props?.title}</DialogTitle>
                {
                    props?.description && (
                        <DialogDescription>
                            {props.description}
                        </DialogDescription>
                    )
                }
            </DialogHeader>
            {props?.renderBody?.()}
            {
                props?.renderActions && (
                    <DialogFooter>
                        {props.renderActions()}
                    </DialogFooter>
                )
            }
        </DialogContent>
    )
}

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
    }

    return (
        <Dialog open={dialogProps?.visible} onOpenChange={onOpenChange}>
            <PopupDialogContent {...dialogProps} />
        </Dialog>
    )
}