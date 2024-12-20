import { type User } from 'firebase/auth';
import { CustomEvent } from '../events';

export const authEvents = {
    user: {
        loggedIn: new CustomEvent<User>('AUTH@USER:LOGGED_IN'),
        loggedOut: new CustomEvent<User>('AUTH@USER:LOGGED_OUT')
    }
};
