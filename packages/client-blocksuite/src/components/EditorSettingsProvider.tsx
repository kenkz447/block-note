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


export function EditorSettingsProvider({ db, children }: EditorSettingsProviderProps) {
    const [settings, setSettings] = useState<EditorSettings>();

    useEffect(() => {
        const setupRxState = async () => {
            const rxState = await db.addState('editor-settings') as RxState<EditorSettings>;
            const stateValue = await rxState.get();

            setSettings(stateValue);
        };

        setupRxState();
    }, [db]);

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
