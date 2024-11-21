import { describe, it, expect, vi } from 'vitest';
import { useEventListener, useEventEmitter } from './useEvents';
import { type AppEvent } from '../types';
import { renderHook } from '@testing-library/react-hooks';

describe('useEvents', () => {
    describe('useEventListener', () => {
        it('should add and remove event listener', () => {
            const event: AppEvent = 'testEvent';
            const handler = vi.fn();

            const { unmount } = renderHook(() =>
                useEventListener({ event, handler })
            );

            expect(handler).not.toHaveBeenCalled();

            renderHook(() => {
                // Emit event to test if handler is called
                const emit = useEventEmitter(event);
                emit();

                expect(handler).toHaveBeenCalled();

                // Unmount the hook to remove the event listener
                unmount();

                // Emit event again to test if handler is removed
                emit();
                expect(handler).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('useEventEmitter', () => {
        it('should emit event', () => {
            const event: AppEvent = 'testEvent';
            const handler = vi.fn();

            renderHook(() => {
                useEventListener({ event, handler });

                const emit = useEventEmitter(event);
                emit();

                expect(handler).toHaveBeenCalled();
            });
        });
    });
});
