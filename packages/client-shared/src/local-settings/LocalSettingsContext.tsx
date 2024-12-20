import { createContext } from 'react';

export type EditorSettingValue = string | number | boolean | null;
export type EditorSettings = {
    mode: 'page' | 'edgeless';
    pageWidth: EditorSettingValue;
};

export type EditorSettingsOptions = {
    pageWidth: { value: string; label: string; }[];
};

export interface LocalSettingsContextType {
    readonly options: EditorSettingsOptions;
    readonly settings: EditorSettings;
    readonly setSettings: (key: keyof EditorSettings, value: EditorSettingValue) => void;
}

export const LocalSettingsContext = createContext<LocalSettingsContextType | null>(null);
