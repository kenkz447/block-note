import { describe, it, expect } from 'vitest';
import { getUserId, getUserDisplayName } from './authUtils';
import { type AppUser } from './authTypes';

describe('authUtils', () => {
    describe('getUserId', () => {
        it('should return "anonymous" when user is null', () => {
            const result = getUserId(null);
            expect(result).toBe('anonymous');
        });

        it('should return user uid when user is provided', () => {
            const user = { uid: '12345', displayName: 'John Doe' } as AppUser;
            const result = getUserId(user);
            expect(result).toBe('12345');
        });
    });

    describe('getUserDisplayName', () => {
        it('should return "Anonymous" when user is null', () => {
            const result = getUserDisplayName(null);
            expect(result).toBe('Anonymous');
        });

        it('should return user displayName when user is provided', () => {
            const user = { uid: '12345', displayName: 'John Doe' } as AppUser;
            const result = getUserDisplayName(user);
            expect(result).toBe('John Doe');
        });
    });
});
