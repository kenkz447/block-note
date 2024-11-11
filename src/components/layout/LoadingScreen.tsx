import { useEditorContext } from "@/libs/editor/hooks/useEditorContext";
import { useRxdbContext } from "@/libs/rxdb";
import { Skeleton } from "@/libs/shadcn-ui/components/skeleton";
import { Circle, FileText } from "lucide-react";

interface LoadingScreenProps {
    readonly children?: React.ReactNode;
}

export const LoadingScreen = ({ children }: LoadingScreenProps) => {
    const { db } = useRxdbContext();
    const { collection } = useEditorContext();

    if (!db || !collection) {

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

    return children
};
