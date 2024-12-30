import { CustomEvent } from '@writefy/client-shared';

export interface PopupProps {
    visible: boolean;
    content: React.ReactNode;
}

export type OpenPopupPayload = Omit<PopupProps, 'visible'>;


export const popupEvents = {
    dialog: {
        show: new CustomEvent<OpenPopupPayload>('popup@dialog:show'),
        hide: new CustomEvent('popup@dialog:hide')
    },
    alert: {
        show: new CustomEvent<OpenPopupPayload>('popup@alert:show'),
        hide: new CustomEvent('popup@alert:hide')
    }
};
