import { Skeleton } from '@/libs/shadcn-ui/components/skeleton';

export const LoadingScreen = () => {
    return (
        <div className="fixed h-full w-full flex flex-col items-center justify-center">
            <div className="flex flex-col space-y-3">
                <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        </div>
    );
}
