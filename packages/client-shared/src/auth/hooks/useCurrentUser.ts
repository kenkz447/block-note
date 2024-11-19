import { useAuthContext } from './useAuthContext';

export const useCurrentUser = () => {
    const { currentUser } = useAuthContext();

    if (currentUser === undefined) {
        throw new Error('useCurrentUser must be used within an AuthProvider');
    }

    return currentUser;
};
