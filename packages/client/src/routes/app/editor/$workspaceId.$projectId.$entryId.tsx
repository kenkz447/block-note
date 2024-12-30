import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { useEventListener } from '@writefy/client-shared';
import { useCallback, useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { z } from 'zod';
import { setPageTitle } from '@/utils/pageUtils';
import { events } from '@/config/events';
import { Entry, useEntries } from '@writefy/client-business';

export const Route = createFileRoute(
    '/app/editor/$workspaceId/$projectId/$entryId',
)({
    component: RouteComponent,
    validateSearch: z.object({}),
});

function RouteComponent() {
    const navigate = useNavigate();
    const { entryId, projectId, workspaceId } = useParams({
        from: '/app/editor/$workspaceId/$projectId/$entryId',
    });

    const { subscribeSingle } = useEntries({
        workspaceId,
        projectId,
    });

    const [entry, setEntry] = useState<Entry | null>();

    useEffect(() => {
        if (!entryId) {
            return;
        }

        const sub = subscribeSingle(entryId, setEntry);

        return () => {
            sub.unsubscribe();
        };
    }, [subscribeSingle, entryId]);

    // Set page title
    useEffect(() => {
        setPageTitle(entry?.name);
    }, [entry]);

    useEventListener({
        event: events.data.entry.removed,
        handler: useCallback(async () => {
            navigate({
                to: '/app/editor/$workspaceId/$projectId',
                params: {
                    workspaceId,
                    projectId,
                }
            });
        }, [navigate, projectId, workspaceId]),
    });

    if (entry === null) {
        throw new Error('Entry not found');
    }

    if (entry === undefined) {
        return <LoadingScreen />;
    }

    return null;
}
