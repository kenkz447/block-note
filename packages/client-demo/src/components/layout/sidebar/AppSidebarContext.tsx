import { Entry, Project, Workspace } from '@/libs/rxdb';
import { createContext } from 'react';

interface AppSidebarContextType {
    readonly changeActiveProject: (project: Project | undefined) => void;
    readonly workspace: Workspace;
    readonly projects?: Project[];
    readonly activeProject?: Project;
    readonly entries?: Entry[];
}

export const AppSidebarContext = createContext<AppSidebarContextType | null>(null);
