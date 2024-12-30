import { useContext } from 'react';
import { LocalSettingsContext, LocalSettingsContextType } from '../LocalSettingsContext';

export const useLocalSettings = <TSettings>() => {
    const context = useContext(LocalSettingsContext);
    if (!context) {
        throw new Error('useLocalSettings must be used within a LocalSettingsContext');
    }

    return context as LocalSettingsContextType<TSettings>;
};
