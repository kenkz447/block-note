import { env } from '@/config/env';

import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const app = initializeApp(env.firebaseConfig);

export const firestore = getFirestore(app);
