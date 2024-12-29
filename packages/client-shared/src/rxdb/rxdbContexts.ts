import { createContext } from 'react';
import { RxDatabase } from 'rxdb';

export interface RxdbContextType {
    readonly db?: RxDatabase<any>;
}

export const RxdbContext = createContext<RxdbContextType | null>(null);
