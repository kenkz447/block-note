import { describe, it, expect, vi, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from './useAuth';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(),
    GoogleAuthProvider: vi.fn(),
    signInWithPopup: vi.fn(),
}));

describe('useAuth', () => {
    it('should call signInWithPopup with GoogleAuthProvider', async () => {
        const mockAuth = {};
        const mockProvider = {};
        const mockResult = { user: {} };

        (getAuth as Mock).mockReturnValue(mockAuth);
        (GoogleAuthProvider as unknown as Mock).mockReturnValue(mockProvider);
        (signInWithPopup as Mock).mockResolvedValue(mockResult);

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.showGoogleSignIn();
        });

        expect(getAuth).toHaveBeenCalled();
        expect(GoogleAuthProvider).toHaveBeenCalled();
        expect(signInWithPopup).toHaveBeenCalledWith(mockAuth, mockProvider);
    });

    it('should handle signInWithPopup error', async () => {
        const mockAuth = {};
        const mockProvider = {};
        const mockError = new Error('Sign in error');

        (getAuth as Mock).mockReturnValue(mockAuth);
        (GoogleAuthProvider as unknown as Mock).mockReturnValue(mockProvider);
        (signInWithPopup as Mock).mockRejectedValue(mockError);

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.showGoogleSignIn();
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith(mockError);

        consoleErrorSpy.mockRestore();
    });

    it('should call signOut', async () => {
        const mockAuth = { signOut: vi.fn().mockResolvedValue(undefined) };

        (getAuth as Mock).mockReturnValue(mockAuth);

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.signOut();
        });

        expect(getAuth).toHaveBeenCalled();
        expect(mockAuth.signOut).toHaveBeenCalled();
    });
});
