import { memo, useMemo } from 'react';

interface DocNodeDropPlaceHolderProps {
    depth: number;
}

function DocNodeDropPlaceHolderImpl(props: DocNodeDropPlaceHolderProps) {
    const style = useMemo(() => ({ left: props.depth * 24 }), [props.depth]);
    return <div className="bg-primary/10 h-1 absolute top-0 right-0" style={style}></div>;
}

export const DocNodeDropPlaceHolder = memo(DocNodeDropPlaceHolderImpl);
