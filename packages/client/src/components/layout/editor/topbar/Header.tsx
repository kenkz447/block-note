import { Button, cn, Tabs, TabsList, TabsTrigger } from '@writefy/client-shadcn';
import { LayoutDashboard, Presentation, TextIcon } from 'lucide-react';
import { memo } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useEventEmitter } from '@writefy/client-shared';

function HeaderImpl() {
    const navigate = useNavigate();
    const emitPresentation = useEventEmitter('EDITOR:PRESENTATION');

    const { mode } = useSearch({
        structuralSharing: true,
        strict: false
    });

    return (
        <header className={cn(
            'flex h-16 py-2 px-6 shrink-0 items-center gap-2',
            {
                'border-b': mode !== 'edgeless',
                'absolute top-0 left-0 z-50': mode === 'edgeless'
            }
        )}>
            <div className="flex items-center gap-2">
                <Tabs
                    value={mode ?? 'page'}
                    onValueChange={(value) => {
                        navigate({
                            from: '/app/editor/$workspaceId/$projectId/$entryId',
                            search: { mode: value }
                        });
                    }}
                >
                    <TabsList className="h-9">
                        <TabsTrigger value="page" className="size-7">
                            <span className="flex"><TextIcon size={14} /></span>
                        </TabsTrigger>
                        <TabsTrigger value="edgeless" className="size-7">
                            <span className="flex"><LayoutDashboard size={14} /></span>
                        </TabsTrigger>
                    </TabsList >
                </Tabs>
                {
                    mode === 'edgeless' && (
                        <Button size="iconSm" variant="ghost" onClick={() => emitPresentation()}>
                            <Presentation />
                        </Button>
                    )
                }
            </div>
        </header>
    );
};

export const Header = memo(HeaderImpl);
