import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader } from '@/libs/shadcn-ui/components/card';
import { ArrowRight, FileTerminal, Info, Layers, Plus, PlusCircle, User } from 'lucide-react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from '@/libs/shadcn-ui/components/carousel';
import { useWorkspaces } from '@/libs/rxdb/hooks/orm/useWorkspaces';
import { useEffect, useState } from 'react';
import { Workspace } from '@/libs/rxdb';
import { Button } from '@/libs/shadcn-ui/components/button';

export const Route = createFileRoute('/workspaces/')({
    component: RouteComponent,
});

function RouteComponent() {
    const { subscribe } = useWorkspaces();

    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

    useEffect(() => {
        // const sub = subscribe(setWorkspaces);

        // return () => {
        //     sub.unsubscribe();
        // };
    }, [subscribe]);

    return (
        <div className="h-full flex flex-col justify-center items-center gap-8">
            <div className="flex items-center gap-8">
                <h1 className="text-muted-foreground text-2xl font-mono font-medium">
                    Your Workspaces
                </h1>
                <div className="flex gap-2">
                    <Button variant="secondary" size="icon" className="rounded-full text-muted-foreground" >
                        <Plus strokeWidth={3} />
                    </Button>
                    <Button variant="secondary" size="icon" className="rounded-full text-muted-foreground" >
                        <User strokeWidth={3} />
                    </Button>
                </div>
            </div>
            <Carousel
                opts={{
                    align: 'center',
                    containScroll: false,
                    skipSnaps: true,
                }}
                className="w-full"
            >
                <CarouselContent className="w-full">
                    {
                        workspaces?.map((workspace) => (
                            <CarouselItem key={workspace.id} className="basis-4/5 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                                <Card className="w-full">
                                    <CardHeader>
                                        <div className="flex flex-col justify-center items-center gap-1">
                                            <div className="w-14 h-14 bg-blue-600 text-primary-foreground rounded-xl flex items-center justify-center">
                                                <Layers size={30} />
                                            </div>
                                            <div className="text-center">
                                                <h2 className="text-xl font-semibold leading-tight">
                                                    {workspace.name}
                                                </h2>
                                                <span className="text-primary/70 leading-tight">Owner</span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="text-center">
                                        <p className="text-primary/70">
                                            <Link to={`/workspaces/${workspace.id}`} className="text-blue-600">
                                                Use workspace <ArrowRight size={16} className="inline" />
                                            </Link>
                                        </p>
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))
                    }
                </CarouselContent>
                {
                    workspaces.length === 0 && (
                        <div className="flex w-full items-center justify-center">
                            <Card className="mx-4 w-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                                <CardHeader>
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="w-14 h-14 bg-secondary rounded-lg flex items-center justify-center">
                                            <Info size={30} className="text-secondary-foreground/70" />
                                        </div>
                                        <h2 className="text-xl font-semibold">
                                            No workspace
                                        </h2>
                                    </div>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <p className="text-primary/70">
                                        Create to start freshly
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
            </Carousel>
        </div>
    );
}
