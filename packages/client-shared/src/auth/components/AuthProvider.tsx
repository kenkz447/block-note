import { useEffect, useMemo, useState } from 'react';
import { getAuth, User } from 'firebase/auth';
import { AuthContextType } from '../authContext';
import { useEventEmitter } from '../../hooks';

interface AuthProviderProps {
    readonly children: (authContext: AuthContextType) => React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {

    const emitLoggedIn = useEventEmitter('AUTH:LOGGED_IN');
    const emitLogout = useEventEmitter('AUTH:LOGGED_OUT');

    const [currentUser, setCurrentUser] = useState<User | null>();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setCurrentUser(user);
            emitLoggedIn();
        });
        return () => unsubscribe();
    }, [emitLoggedIn]);

    const contextValue = useMemo((): AuthContextType => {
        return {
            currentUser,
            signOut: async () => {
                const auth = getAuth();
                await auth.signOut();
                emitLogout();
            }
        };
    }, [currentUser, emitLogout]);

    return children(contextValue);
}
