import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useCallback } from 'react';
import { useEventEmitter } from '../../hooks/useEvents';

export const useAuth = () => {
    const emitLoggedIn = useEventEmitter('AUTH:LOGGED_IN');
    const editLogout = useEventEmitter('AUTH:LOGGED_OUT');

    const showGoogleSignIn = useCallback(async () => {
        const auth = getAuth();
        const provider = new GoogleAuthProvider();

        signInWithPopup(auth, provider)
            .then(async (result) => {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                if (!credential) {
                    throw new Error('Credential not found');
                }
                emitLoggedIn();
            }).catch((error) => {
                console.error(error);
            });
    }, [emitLoggedIn]);

    const signOut = useCallback(async () => {
        const auth = getAuth();
        await auth.signOut();
        editLogout();
    }, [editLogout]);

    return {
        showGoogleSignIn,
        signOut
    };
};
