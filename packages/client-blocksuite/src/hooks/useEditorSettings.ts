import { useContext } from 'react';
import { EditorSettingsContext } from '../editorContext';

export const usePageSettings = () => {
    const context = useContext(EditorSettingsContext);
    if (!context) {
        throw new Error('usePageSettings must be used within a EditorSettingsContext');
    }

    return context;
};
