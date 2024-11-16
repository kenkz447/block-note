import { createContext } from 'react';
import { AppRxDatabase } from './rxdbTypes';

export interface RxdbContextType {
    readonly db?: AppRxDatabase;
}

export const RxdbContext = createContext<RxdbContextType | null>(null);
