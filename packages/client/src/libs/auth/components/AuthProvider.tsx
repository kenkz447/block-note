import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext, AuthContextType } from "../authContext";
import { getAuth, User } from "firebase/auth";
import { useEventEmitter } from "@/hooks/useEvent";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const emitSignedOut = useEventEmitter('LOGGED_OUT');

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
        emitSignedOut();
    }, [emitSignedOut]);

    const contextValue = useMemo((): AuthContextType => {
        return {
            currentUser,
            signOut,
        };
    }, [currentUser, signOut]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}
