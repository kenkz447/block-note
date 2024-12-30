import { useEffect, useMemo, useState } from 'react';
import { getAuth, User } from 'firebase/auth';
import { AuthContext, AuthContextType } from '../authContext';
import { useEventEmitter } from '../../events';
import { authEvents } from '../authEvents';

interface AuthProviderProps {
    readonly children: (authContext: AuthContextType) => React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const emitLoggedIn = useEventEmitter(authEvents.user.loggedIn);
    const emitLogout = useEventEmitter(authEvents.user.loggedOut);

    const [currentUser, setCurrentUser] = useState<User | null>();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setCurrentUser(user);
            if (user) {
                emitLoggedIn(user);
            }
        });
        return () => unsubscribe();
    }, [emitLoggedIn]);

    const contextValue = useMemo((): AuthContextType => {
        return {
            currentUser,
            signOut: async () => {
                if (!currentUser) {
                    throw new Error('User is not logged in');
                }

                const auth = getAuth();
                await auth.signOut();
                emitLogout(currentUser);
            }
        };
    }, [currentUser, emitLogout]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children(contextValue)}
        </AuthContext.Provider>
    );
}
