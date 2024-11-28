import { memo, useEffect, useRef, useState } from 'react';

interface DocNodeEditableProps {
    readonly value: string;
    readonly onFinish: () => void;
    readonly onSubmit: (value: string) => Promise<void>;
}

export function DocNodeEditableImpl({ value, onFinish, onSubmit }: DocNodeEditableProps) {
    const [inputValue, setInputValue] = useState<string | null>(value);

    const handleSubmit = async () => {
        const isEmpty = !inputValue?.trim();
        const isSame = inputValue === value;

        if (isEmpty || isSame) {
            return void onFinish();
        }

        await onSubmit(inputValue!);
        onFinish();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSubmit();
            e.currentTarget.blur();
        }

        if (e.key === 'Escape') {
            onFinish();
        }
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.currentTarget.value);
    };

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const focus = (el: HTMLInputElement | null) => {
            if (!el) return;

            el.select();
        };
        focus(inputRef.current);
    }, []);

    return (
        <input
            ref={inputRef}
            className="grow bg-transparent whitespace-nowrap overflow-hidden text-ellipsis user-select-all"
            contentEditable={true}
            onChange={onChange}
            onBlur={handleSubmit}
            onKeyDown={handleKeyDown}
            value={inputValue ?? ''}
        />
    );
};

export const DocNodeEditable = memo(DocNodeEditableImpl);
