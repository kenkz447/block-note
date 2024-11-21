import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, type Mock } from 'vitest';
import { AuthProvider } from './AuthProvider';
import { getAuth, User } from 'firebase/auth';
import { useEventEmitter } from '../../hooks';

vi.mock('firebase/auth');
vi.mock('../../hooks');

describe('AuthProvider', () => {
    it('should render children with the correct context value when user is logged in', async () => {
        const mockUser = { uid: 'test-user' } as User;
        const mockAuth = {
            onAuthStateChanged: vi.fn((callback) => {
                callback(mockUser);
                return vi.fn();
            })
        };
        (getAuth as Mock).mockReturnValue(mockAuth);
        const emitLoggedIn = vi.fn();
        const editLogout = vi.fn();
        (useEventEmitter as Mock).mockImplementation((event) => {
            if (event === 'AUTH:LOGGED_IN') return emitLoggedIn;
            if (event === 'AUTH:LOGGED_OUT') return editLogout;
        });

        const children = vi.fn().mockReturnValue(<div>User Logged In</div>);

        const { getByText } = render(<AuthProvider>{children}</AuthProvider>);

        await waitFor(() => {
            expect(children).toHaveBeenCalledWith({ currentUser: mockUser });
            expect(getByText('User Logged In')).toBeInTheDocument();
            expect(emitLoggedIn).toHaveBeenCalled();
            expect(editLogout).not.toHaveBeenCalled();
        });
    });

    it('should render children with the correct context value when user is logged out', async () => {
        const mockAuth = {
            onAuthStateChanged: vi.fn((callback) => {
                callback(null);
                return vi.fn();
            })
        };
        (getAuth as Mock).mockReturnValue(mockAuth);
        const emitLoggedIn = vi.fn();
        const editLogout = vi.fn();
        (useEventEmitter as Mock).mockImplementation((event) => {
            if (event === 'AUTH:LOGGED_IN') return emitLoggedIn;
            if (event === 'AUTH:LOGGED_OUT') return editLogout;
        });

        const children = vi.fn().mockReturnValue(<div>User Logged Out</div>);

        const { getByText } = render(<AuthProvider>{children}</AuthProvider>);

        await waitFor(() => {
            expect(children).toHaveBeenCalledWith({ currentUser: null });
            expect(getByText('User Logged Out')).toBeInTheDocument();
            expect(emitLoggedIn).not.toHaveBeenCalled();
            expect(editLogout).toHaveBeenCalled();
        });
    });
});
