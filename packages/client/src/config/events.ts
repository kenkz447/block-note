import { Entry } from '@writefy/client-business';
import { CustomEvent } from '@writefy/client-shared';

export const events = {
    ui: {
        entryForm: {
            show: new CustomEvent<Pick<Entry, 'type' | 'parent'>>('ui@entryForm:show'),
        }
    },
    data: {
        entry: {
            removed: new CustomEvent<Pick<Entry, 'id'>>('data@entry:removed'),
        }
    },
    editor: {
        presentation: {
            show: new CustomEvent<void>('editor@presentation:show'),
        }
    }
};
