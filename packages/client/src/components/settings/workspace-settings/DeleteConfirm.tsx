import { AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, Input, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@writefy/client-shadcn';
import { memo, useState } from 'react';

interface DeleteConfirmProps {
    readonly confirmText: string;
    readonly onConfirm: () => void;
}

function DeleteConfirmImpl({ onConfirm, confirmText }: DeleteConfirmProps) {
    const [allowDelete, setAllowDelete] = useState(false);
    const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAllowDelete(e.target.value === confirmText);
    };

    return (
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action is irreversible. All data will be lost.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <Input onChange={onInput} placeholder="Type 'DELETE' to confirm" />
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    disabled={!allowDelete}
                    onClick={onConfirm}
                >
                    Continue
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    );
};

export const DeleteConfirm = memo(DeleteConfirmImpl);
