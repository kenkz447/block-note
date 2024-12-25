import { z } from 'zod';

const envSchema = z.object({
    firebaseConfig: z.object({
        apiKey: z.string(),
        authDomain: z.string(),
        projectId: z.string(),
        storageBucket: z.string(),
        messagingSenderId: z.string(),
        appId: z.string(),
        databaseURL: z.string(),
    })
});

const env = {
    firebaseConfig: {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY!,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN!,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID!,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET!,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID!,
        appId: import.meta.env.VITE_FIREBASE_APP_ID!,
        databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL!,
    }
};

envSchema.parse(env);

export { env };
