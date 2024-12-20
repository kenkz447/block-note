import EventEmitter from 'eventemitter3';
import { useCallback, useEffect } from 'react';
import { CustomEvent } from '../instances/CustomEvent';

const emitter = new EventEmitter();

interface UseEventOptions<T> {
    readonly event: CustomEvent<T>;
    readonly handler: (detail: T) => void;
}

export const useEventListener = <T>(options: UseEventOptions<T>) => {
    const { event, handler } = options;

    useEffect(() => {
        if (handler) {
            emitter.addListener(event.type, handler);
        }

        return () => {
            emitter.removeListener(event.type, handler);
        };
    }, [event, handler]);
};

export const useEventEmitter = <T>(event: CustomEvent<T>) => {
    return useCallback((detail: T) => {
        emitter.emit(event.type, detail);
    }, [event]);
};
