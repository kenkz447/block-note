import { Entry, Project, Workspace } from '@writefy/client-business';
import { createContext } from 'react';

interface AppSidebarContextType {
    readonly setActiveProject: (project: Project | undefined) => void;
    readonly setEntries: (entries: Entry[] | undefined) => void;
    readonly setActiveEntry: (entry: Entry | undefined) => void;
    readonly workspace: Workspace;
    readonly projects?: Project[];
    readonly activeProject?: Project;
    readonly entries?: Entry[];
    readonly activeEntry?: Entry;
}

export const AppSidebarContext = createContext<AppSidebarContextType | null>(null);
