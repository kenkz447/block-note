import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useIsMobile } from '@/libs/shadcn-ui/hooks/use-mobile';
import { MasterLayoutMobile } from '@/components/layout/MasterLayoutMobile';
import { MasterLayout } from '@/components/layout/MasterLayout';
import { z } from 'zod';

export const Route = createFileRoute('/editor')({
    component: RouteComponent,
    validateSearch: z.object({
        workspaceId: z.string().optional(),
        projectId: z.string().optional(),
        entryId: z.string().optional(),
    }),
});

function RouteComponent() {
    const isMobile = useIsMobile();
    const Layout = isMobile ? MasterLayoutMobile : MasterLayout;

    return (
        <Layout>
            <Outlet />
        </Layout>
    );
}
