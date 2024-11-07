import { getAuth } from '@/bootstraps/firebase';
import { useCallback } from 'react';

export const useLogout = () => {
    return useCallback(() => {
        return getAuth().signOut();
    }, []);
};
