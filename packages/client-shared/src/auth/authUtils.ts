import { AppUser } from './authTypes';

export const getUserId = (user: AppUser | null) => {
    return user?.uid ?? 'anonymous';
};

export const getUserDisplayName = (user: AppUser | null) => {
    return user?.displayName ?? 'Anonymous';
};
