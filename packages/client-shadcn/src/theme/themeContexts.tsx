import { createContext } from 'react';

export type Theme = 'dark' | 'light' | 'system';

export type ThemeProviderContextType = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderContextType = {
    theme: 'system',
    setTheme: () => null,
};

export const ThemeProviderContext = createContext<ThemeProviderContextType>(initialState);
