import { z } from 'zod';

interface LocalSettings {
    readonly theme: 'dark' | 'light' | 'system';
}

export const defaultLocalSettings: LocalSettings = {
    theme: 'system',
};

export const localSettingSchema = z.object({
    theme: z.enum(['dark', 'light', 'system']),
});
