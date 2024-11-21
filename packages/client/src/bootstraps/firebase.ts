import { env } from '../config/env';

import { initializeApp } from 'firebase/app';

initializeApp(env.firebaseConfig);
