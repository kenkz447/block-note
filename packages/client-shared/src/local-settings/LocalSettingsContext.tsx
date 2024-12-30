import { createContext } from 'react';

export interface LocalSettingsContextType<TSettings> {
    readonly settings: TSettings;
    readonly setSetting: (key: string, value: any) => void;
}

export const LocalSettingsContext = createContext<LocalSettingsContextType<any> | undefined>(undefined);
