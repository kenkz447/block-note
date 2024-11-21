export function shallowEqualByKey<TProps extends Record<string, unknown>>(...keys: (keyof TProps)[]) {
    return (prev: TProps, next: TProps) => {
        return keys.every(key => prev[key] === next[key]);
    };
}
