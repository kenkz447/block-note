import { createContext } from 'react';

interface EntryTreeContextType {
    // Mutator methods
    readonly setActiveEntryId: (entryId: string | undefined) => void;
    readonly setOnActiveEntryChange: (onActiveEntryChange: (entryId: string | undefined) => void) => void;
    readonly setGetEntryLink: () => (entryId: string) => string;

    // Accessor properties
    readonly activeEntryId?: string;
    readonly onActiveEntryChange: (entryId: string | undefined) => void;
    readonly getEntryLink: (entryId: string) => string;
}

export const EntryTreeContext = createContext<EntryTreeContextType | null>(null);
