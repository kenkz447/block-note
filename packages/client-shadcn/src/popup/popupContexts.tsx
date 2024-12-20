import React, { createContext } from 'react';

export interface PopupProps {
    visible: boolean;
    content: React.ReactNode;
}

export type OpenPopupPayload = Omit<PopupProps, 'visible'>;

export interface PopupDialogContextType {
    dialogProps?: PopupProps;
    openDialog: (payload: OpenPopupPayload) => void;
    closeDialog: () => void;
}

export const PopupDialogContext = createContext<PopupDialogContextType | null>(null);

export interface PopupAlertContextType {
    dialogProps?: PopupProps;
    openDialog: (payload: OpenPopupPayload) => void;
    closeDialog: () => void;
}
export const PopupAlertContext = createContext<PopupAlertContextType | null>(null);
