import { useEffect, useState } from "react";
import { RxDocument } from "rxdb";

interface RxdbObserverProps {
    doc: RxDocument<any>;
    field: string;
    defaultValue?: any;
}

export const RxdbObserver = (props: RxdbObserverProps) => {
    const { doc, field, defaultValue } = props;
    const [value, setValue] = useState();

    useEffect(() => {
        const subscription = doc.get$(field).subscribe((newValue) => {
            setValue(newValue ?? defaultValue);
        });
        return () => {
            subscription.unsubscribe();
        };
    }, [doc, field]);

    return <>{value}</>;
};