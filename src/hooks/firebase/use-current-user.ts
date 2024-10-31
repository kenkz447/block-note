import { useEffect, useState } from 'react';

import { FirebaseUser, getAuth } from '@/helpers/firebase';

export const useCurrentUser = () => {
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    useEffect(() => {
        const unsubscribe = getAuth().onAuthStateChanged(setCurrentUser);
        return () => unsubscribe();
    }, []);
    return currentUser;
}