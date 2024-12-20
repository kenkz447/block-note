import { CustomEvent } from '@writefy/client-shared';

export const editorEvents = {
    editor: {
        presentation: {
            show: new CustomEvent<void>('editor@presentation:show'),
        }
    }
};
