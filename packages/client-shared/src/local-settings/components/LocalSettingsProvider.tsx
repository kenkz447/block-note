import { useCallback, useEffect, useMemo, useState } from 'react';
import { RxState } from 'rxdb';
import { z } from 'zod';
import { LocalSettingsContextType, LocalSettingsContext } from '../LocalSettingsContext';
import { useRxdb } from '../../rxdb';

interface LocalSettingsProviderProps<TSettings> {
    readonly defaultSettings: TSettings;
    readonly validationSchema: z.ZodSchema<TSettings>;
    readonly children: (contextValue: LocalSettingsContextType<TSettings> | undefined) => React.ReactNode;
}

export function LocalSettingsProvider<TSettings>({ defaultSettings, validationSchema: schema, children }: LocalSettingsProviderProps<TSettings>) {
    const db = useRxdb();
    const [settings, setSettings] = useState<TSettings>();

    // Initialize settings from rxdb
    useEffect(() => {
        const setupRxState = async () => {
            const rxState = await db.addState('local-settings') as RxState<TSettings>;

            const settings = await rxState.get();
            if (settings) {
                setSettings(settings);
            }
            else {
                setSettings(defaultSettings);
            }
        };

        setupRxState();
    }, [db, defaultSettings]);

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

    const setSettingByKey = useCallback((key: string, value: any) => {
        setSettings((prev) => {
            const nextState = { ...prev!, [key]: value };
            schema.parse(nextState);
            return nextState;
        });
    }, [schema]);

    const contextValue = useMemo(() => {
        if (!settings) {
            return undefined;
        }

        return {
            settings,
            setSetting: setSettingByKey,
        } satisfies LocalSettingsContextType<TSettings>;
    }, [settings, setSettingByKey]);

    return (
        <LocalSettingsContext.Provider value={contextValue}>
            {children(contextValue)}
        </LocalSettingsContext.Provider>
    );
};
