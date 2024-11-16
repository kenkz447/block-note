import { useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';

export const useEntryPage = () => {
    const navigate = useNavigate();

    return useCallback((entryId: string | null) => {
        if (!entryId) {
            return navigate({
                to: '/editor',
                replace: true
            });
        }

        navigate({
            to: '/editor',
            search: {
                entryId
            }
        });
    }, [navigate]);
};
