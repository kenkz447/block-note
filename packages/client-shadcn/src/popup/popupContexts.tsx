import React, { createContext } from 'react';

export interface PopupDialogProps {
    visible: boolean;
    content: React.ReactNode;
}

export interface PopupDialogContextType {
    dialogProps?: PopupDialogProps;
    openDialog: (payload: Omit<PopupDialogProps, 'visible'>) => void;
    closeDialog: () => void;
}

export const PopupDialogContext = createContext<PopupDialogContextType | null>(null);

export const PopupAlertContext = createContext<PopupDialogContextType | null>(null);
