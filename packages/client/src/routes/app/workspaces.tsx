import { createFileRoute, Link } from '@tanstack/react-router';
import {
    ChevronRight,
    Info,
    Pen,
    Plus,
    UserRound,
    UserRoundCog,
} from 'lucide-react';
import { useWorkspaces } from '@writefy/client-shared';
import { useEffect, useState } from 'react';
import { Workspace, } from '@writefy/client-shared';
import {
    usePopupDialog,
    Carousel,
    CarouselContent,
    CarouselItem,
    Button,
    Card,
    CardContent,
    CardHeader
} from '@writefy/client-shadcn';
import { CreateWorkspaceForm } from '@/components/forms/workspace/CreateWorkspaceForm';
import { useAuth, useCurrentUser } from '@writefy/client-shared';
import { UserSettings } from '@/components/settings/UserSettings';
import { WorkspaceSettings } from '@/components/settings/WorkspaceSettings';

export const Route = createFileRoute('/app/workspaces')({
    component: RouteComponent,
});

function RouteComponent() {
    const { showGoogleSignIn } = useAuth();
    const currentUser = useCurrentUser();
    const { subscribe, insert } = useWorkspaces();

    const { openDialog, closeDialog } = usePopupDialog();

    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const openUserSettingsDialog = () => {
        openDialog({
            content: <UserSettings hide={closeDialog} />,
        });
    };

    const openCreateWorkspaceDialog = () => {
        openDialog({
            content: (
                <CreateWorkspaceForm
                    onSubmit={async (values) => {
                        await insert(values);
                        closeDialog();
                    }}
                />
            ),
        });
    };

    const openWorkspaceSettings = (workspace: Workspace) => {
        openDialog({
            content: <WorkspaceSettings workspace={workspace} />,
        });
    };

    useEffect(() => {
        const sub = subscribe({}, setWorkspaces);

        return () => {
            sub.unsubscribe();
        };
    }, [subscribe]);

    return (
        <div className="h-full flex flex-col justify-center items-center gap-8">
            <div className="flex items-center gap-8">
                <h1 className="text-muted-foreground text-2xl font-mono font-medium">
                    Your Workspaces
                </h1>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full text-muted-foreground"
                        onClick={openCreateWorkspaceDialog}
                    >
                        <Plus strokeWidth={3} />
                    </Button>
                    {currentUser ? (
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full text-muted-foreground"
                            onClick={openUserSettingsDialog}
                        >
                            <UserRoundCog strokeWidth={3} />
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full text-muted-foreground"
                            onClick={showGoogleSignIn}
                        >
                            <UserRound strokeWidth={3} />
                        </Button>
                    )}
                </div>
            </div>
            {workspaces.length > 0 ? (
                <Carousel
                    opts={{
                        align: 'center',
                        containScroll: false,
                        skipSnaps: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="w-full">
                        {workspaces?.map((workspace) => (
                            <CarouselItem
                                key={workspace.id}
                                className="basis-4/5 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 max-w-[350px]"
                            >
                                <Card className="group w-full relative">
                                    <CardHeader>
                                        <div className="flex flex-col justify-center items-center gap-2">
                                            <div className="bg-secondary flex items-center justify-center gap-4 size-12 rounded-lg">
                                                <div className="text-primary/50 text-lg">{workspace.name[0].toUpperCase()}</div>
                                            </div>
                                            <div className="text-center">
                                                <h2 className="text-lg font-semibold leading-tight">
                                                    {workspace.name}
                                                </h2>
                                                <span className="text-sm text-primary/70 leading-tight">
                                                    Owner
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-primary/70 hidden absolute right-1 top-0 group-hover:flex"
                                            onClick={() => openWorkspaceSettings(workspace)}
                                        >
                                            <Pen />
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="text-center">
                                        <div className="flex h-5 items-center justify-center text-sm">
                                            <Button
                                                className="text-primary/70"
                                                variant="ghost"
                                                asChild
                                            >
                                                <Link
                                                    to="/app/editor/$workspaceId"
                                                    params={{ workspaceId: workspace.id }}
                                                >
                                                    <ChevronRight /> Use workspace
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            ) : (
                <div className="flex w-full items-center justify-center">
                    <Card className="mx-4 w-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 max-w-[400px]">
                        <CardHeader>
                            <div className="flex flex-col items-center justify-center gap-2">
                                <div className="w-14 h-14 bg-secondary rounded-lg flex items-center justify-center">
                                    <Info size={30} className="text-secondary-foreground/70" />
                                </div>
                                <h2 className="text-xl font-semibold">No workspace</h2>
                            </div>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-primary/70">Create to start freshly</p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
