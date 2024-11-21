import { Entry, Project, Workspace } from '@writefy/client-shared';
import { createContext } from 'react';

interface AppSidebarContextType {
    readonly setActiveProject: (project: Project | undefined) => void;
    readonly setEntries: (entries: Entry[] | undefined) => void;
    readonly workspace: Workspace;
    readonly projects?: Project[];
    readonly activeProject?: Project;
    readonly entries?: Entry[];
}

export const AppSidebarContext = createContext<AppSidebarContextType | null>(null);
