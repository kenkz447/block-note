import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useCallback } from 'react';

export const useAuth = () => {
    const showGoogleSignIn = useCallback(async () => {
        const auth = getAuth();
        const provider = new GoogleAuthProvider();

        signInWithPopup(auth, provider)
            .then(async (result) => {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                if (!credential) {
                    throw new Error('Credential not found');
                }

            }).catch((error) => {
                console.error(error);
            });
    }, []);

    const signOut = useCallback(async () => {
        const auth = getAuth();
        await auth.signOut();
    }, []);

    return {
        showGoogleSignIn,
        signOut
    };
};
