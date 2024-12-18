import { createContext } from 'react';

import { DocCollection } from '@blocksuite/store';

export interface EditorContextType {
    readonly collection?: DocCollection;
}

export const EditorContext = createContext<EditorContextType | null>(null);

export type EditorSettingValue = string | number | boolean | null;
export type EditorSettings = {
    mode: 'page' | 'edgeless';
    pageWidth: EditorSettingValue;
};

export type EditorSettingsOptions = {
    pageWidth: { value: string; label: string; }[];
};

export interface EditorSettingsContextType {
    readonly options: EditorSettingsOptions;
    readonly settings: EditorSettings;
    readonly setSettings: (key: keyof EditorSettings, value: EditorSettingValue) => void;
}

export const EditorSettingsContext = createContext<EditorSettingsContextType | null>(null);
