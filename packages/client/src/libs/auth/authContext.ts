import { User } from 'firebase/auth';
import { createContext } from 'react';

export interface AuthContextType {
  currentUser: User | null | undefined;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
