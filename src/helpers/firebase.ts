import { env } from '@/config/env';

import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, User, signInWithPopup } from "firebase/auth"

initializeApp(env.firebaseConfig);

const provider = new GoogleAuthProvider();

type FirebaseUser = User;

export type {
    FirebaseUser
};

export {
    getAuth
}

export const showSignIn = async () => {
    const auth = getAuth();
    signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            if (!credential) {
                throw new Error("Credential not found");
            }

            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            // IdP data available using getAdditionalUserInfo(result)
            // ...
        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
        });
}