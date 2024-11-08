import { Separator } from '@/libs/shadcn-ui/components/separator';

export function TopBar() {
    return (
        <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
        </header>
    );
}
