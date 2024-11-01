import { createContext } from "react";

export interface PopupDialogProps {
    visible: boolean;
    title: string;
    description?: string;
    renderBody?: () => React.ReactNode;
    renderActions?: () => React.ReactNode;
}

export interface PopupDialogContextType {
    dialogProps?: PopupDialogProps;
    openDialog: (payload: Omit<PopupDialogProps, 'visible'>) => void;
    closeDialog: () => void;
}

export const PopupDialogContext = createContext<PopupDialogContextType | null>(null);