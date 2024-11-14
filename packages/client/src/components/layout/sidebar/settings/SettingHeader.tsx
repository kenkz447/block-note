import { Separator } from '@/libs/shadcn-ui/components/separator';

interface SettingHeaderProps {
    readonly title: string;
    readonly description: string;
}

export function SettingHeader({ title, description }: SettingHeaderProps) {
    return (
        <div className="w-full">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-gray-500">{description}</p>
            <Separator orientation="horizontal" className="my-6" />
        </div>
    );
}
