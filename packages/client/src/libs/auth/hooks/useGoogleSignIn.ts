import { useEventEmitter } from "@/hooks/useEvent";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useCallback } from "react"

export const useGoogleSignIn = () => {
    const emitSignedIn = useEventEmitter('LOGGED_IN');

    const showSignIn = useCallback(async () => {
        const auth = getAuth();
        const provider = new GoogleAuthProvider();

        signInWithPopup(auth, provider)
            .then(async (result) => {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                if (!credential) {
                    throw new Error("Credential not found");
                }

                emitSignedIn();
            }).catch((error) => {
                console.error(error);
            });
    }, [emitSignedIn]);

    return showSignIn;
}
