import { useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';

export const useEntryPage = () => {
    const navigate = useNavigate();

    return useCallback((entryId: string | null) => {
        if (!entryId) {
            return navigate({
                to: '/',
                replace: true
            });
        }

        navigate({
            to: '/',
            search: {
                entryId
            }
        });
    }, [navigate]);
};