import { useCallback, useEffect } from "react"
import { EventEmitter } from "eventemitter3";

type Event = 'LOGGED_IN' | 'LOGGED_OUT';

const emitter = new EventEmitter();

interface UseEventOptions<TDetail> {
    readonly event: Event;
    readonly listen: (callback: (detail?: TDetail) => void) => void;
}

export const useEventListener = <TDetail = undefined>(options: UseEventOptions<TDetail>) => {
    const { event, listen } = options;

    useEffect(() => {
        if (listen) {
            emitter.addListener(event, listen);
        }

        return () => {
            emitter.removeListener(event, listen);
        };
    }, [event, listen]);

    const dispatch = useCallback((detail?: TDetail) => {
        emitter.emit(event, detail);
    }, [event]);

    return { dispatch };
}

export const useEventEmitter = <TDetail = undefined>(event: Event) => {
    const dispatch = useCallback((detail?: TDetail) => {
        emitter.emit(event, detail);
    }, [event]);

    return dispatch;
}
