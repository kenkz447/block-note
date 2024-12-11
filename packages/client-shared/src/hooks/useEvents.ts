import { useCallback, useEffect } from 'react';
import { EventEmitter } from 'eventemitter3';
import { AppEvent } from '../types';

const emitter = new EventEmitter();

interface UseEventOptions<TDetail> {
    readonly event: AppEvent;
    readonly handler: (detail: TDetail | undefined) => void;
}

export const useEventListener = <TDetail = undefined>(options: UseEventOptions<TDetail>) => {
    const { event, handler } = options;

    useEffect(() => {
        if (handler) {
            emitter.addListener(event, handler);
        }

        return () => {
            emitter.removeListener(event, handler);
        };
    }, [event, handler]);
};

export const useEventEmitter = <TDetail = undefined>(event: AppEvent) => {
    const emit = useCallback((detail?: TDetail) => {
        emitter.emit(event, detail);
    }, [event]);

    return emit;
};
