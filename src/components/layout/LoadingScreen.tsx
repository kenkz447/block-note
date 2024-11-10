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
                <div className="mb-4">
                    <div className="h-12 px-4 flex items-center justify-center mb-4">
                        <span className="tracking-wide">D</span>
                        <span className="tracking-wide relative text-orange-600">
                            <Circle size={26} strokeWidth={1} />
                            <FileText size={16} strokeWidth={1.8} className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]" />
                        </span>
                        <span className="tracking-wide">C SPACE</span>
                    </div>
                </div>
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