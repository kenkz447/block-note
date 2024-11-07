import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext, AuthContextType } from "../authContext";
import { getAuth, User } from "firebase/auth";
import { cleanIndexedDb } from "@/helpers/indexedDbHelpers";

export function AuthProvider({ children }: { children: React.ReactNode }) {
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
        await cleanIndexedDb();
    }, []);

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
