import { cn } from '@writefy/client-shadcn';
import { memo } from 'react';

function HeaderImpl() {

    return (
        <header className={cn('flex h-16 py-2 px-6 shrink-0 items-center gap-2')}>
            <div className="flex items-center gap-2">
                {null}
            </div>
        </header>
    );
};

export const Header = memo(HeaderImpl);
