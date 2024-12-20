import { useContext } from 'react';
import { LocalSettingsContext } from '../LocalSettingsContext';

export const useLocalSettings = () => {
    const context = useContext(LocalSettingsContext);
    if (!context) {
        throw new Error('useLocalSettings must be used within a LocalSettingsContext');
    }

    return context;
};
