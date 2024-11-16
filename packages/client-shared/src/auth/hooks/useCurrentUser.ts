import { useAuthContext } from './useAuthContext';

export const useCurrentUser = () => {
    const { currentUser } = useAuthContext();
    return currentUser;
};
