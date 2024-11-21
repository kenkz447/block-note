import { useEffect, useMemo, useState } from 'react';
import { getAuth, User } from 'firebase/auth';
import { AuthContextType } from '../authContext';
import { useEventEmitter } from '../../hooks';

interface AuthProviderProps {
    readonly children: (authContext: AuthContextType) => React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {

    const emitLoggedIn = useEventEmitter('AUTH:LOGGED_IN');
    const editLogout = useEventEmitter('AUTH:LOGGED_OUT');

    const [currentUser, setCurrentUser] = useState<User | null>();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged(setCurrentUser);
        return () => unsubscribe();
    }, [editLogout, emitLoggedIn]);

    useEffect(() => {
        if (currentUser === undefined) {
            return;
        }

        if (currentUser !== null) {
            emitLoggedIn();
        }
        else {
            editLogout();
        }
    }, [currentUser, editLogout, emitLoggedIn]);

    const contextValue = useMemo((): AuthContextType => {
        return {
            currentUser
        };
    }, [currentUser]);

    return children(contextValue);
}
