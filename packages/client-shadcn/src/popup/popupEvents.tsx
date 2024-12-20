import { CustomEvent } from '@writefy/client-shared';
import { OpenPopupPayload } from './popupContexts';

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
