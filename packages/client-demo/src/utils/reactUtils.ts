export function shallowEqual<TProps>(...keys: (keyof TProps)[]) {
    return (prev: TProps, next: TProps) => {
        return keys.every(key => prev[key] === next[key]);
    };
}
