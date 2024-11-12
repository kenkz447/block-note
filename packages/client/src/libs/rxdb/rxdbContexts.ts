import { createContext } from 'react';
import { RxDatabase } from 'rxdb';

interface RxdbContextType {
    readonly db?: RxDatabase;
}

export const RxdbContext = createContext<RxdbContextType | null>( null);