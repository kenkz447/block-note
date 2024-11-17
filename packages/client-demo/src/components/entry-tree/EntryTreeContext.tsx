import { createContext } from 'react';

interface EntryTreeContextType {
    readonly activeEntryId?: string;
}

export const EntryTreeContext = createContext<EntryTreeContextType | null>(null);
