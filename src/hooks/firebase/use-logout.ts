import { getAuth } from '@/helpers/firebase';
import { useCallback } from 'react';

export const useLogout = () => {
    return useCallback(() => {
        return getAuth().signOut();
    }, []);
};