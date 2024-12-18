import { AppRxDatabase } from '@writefy/client-shared';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RxState } from 'rxdb';
import { z } from 'zod';
import { EditorSettingsContextType, EditorSettings, EditorSettingValue } from '../editorContext';

interface EditorSettingsProviderProps {
    readonly db: AppRxDatabase;
    readonly children: (settings?: EditorSettingsContextType) => React.ReactNode;
}

const options = {
    pageWidth: [
        { value: '100%', label: '100%' },
        { value: '75%', label: '75%' },
        { value: '50%', label: '50%' }
    ],
};

const settingsSchema = z.object({
    pageWidth: z.enum(options.pageWidth.map((option) => option.value) as [string, ...string[]]),
});

const defaultSettings: EditorSettings = {
    pageWidth: '100%',
};

export function EditorSettingsProvider({ db, children }: EditorSettingsProviderProps) {
    const [settings, setSettings] = useState<EditorSettings>();

    // Initialize settings from rxdb
    useEffect(() => {
        const setupRxState = async () => {
            const rxState = await db.addState('local-settings') as RxState<{
                editor: EditorSettings;
            }>;

            const stateValue = await rxState.get();
            if (stateValue?.editor) {
                setSettings(stateValue.editor);
            }
            else {
                setSettings(defaultSettings);
            }
        };

        setupRxState();
    }, [db]);

    // Save settings to rxdb when settings change
    useEffect(() => {
        if (!settings) {
            return;
        }

        const saveSettings = async () => {
            const rxState = await db.addState('local-settings');
            const stateValue = rxState.get();
            if (stateValue?.editor === settings) {
                return;
            }
            rxState.set('editor', () => settings);
        };

        saveSettings();
    }, [db, settings]);

    const setSettingByKey = useCallback((key: keyof EditorSettings, value: EditorSettingValue) => {
        setSettings((prev) => {
            const nextState = { ...prev, [key]: value };
            settingsSchema.parse(nextState);
            return nextState;
        });
    }, []);

    const contextValue = useMemo(() => {
        if (!settings) {
            return undefined;
        }

        return {
            options,
            settings,
            setSettings: setSettingByKey,
        } satisfies EditorSettingsContextType;
    }, [settings, setSettingByKey]);

    return children(contextValue);
};
