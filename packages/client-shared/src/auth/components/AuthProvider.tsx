import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAuth, User } from 'firebase/auth';
import { AuthContextType } from '../authContext';

interface AuthProviderProps {
    readonly children: (authContext: AuthContextType) => React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [currentUser, setCurrentUser] = useState<User | null>();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setCurrentUser(user);
        });

        return () => unsubscribe();
    }, []);

    const signOut = useCallback(async () => {
        const auth = getAuth();
        await auth.signOut();
    }, []);

    const contextValue = useMemo((): AuthContextType => {
        return {
            currentUser,
            signOut,
        };
    }, [currentUser, signOut]);

    return children(contextValue);
}
