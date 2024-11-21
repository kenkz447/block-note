import { describe, it, expect } from 'vitest';
import { shallowEqualByKey } from './reactUtils';

describe('shallowEqualByKey', () => {
    it('should return true for equal objects by specified keys', () => {
        const objA = { a: 1, b: 2, c: 3 };
        const objB = { a: 1, b: 2, c: 4 };
        expect(shallowEqualByKey('a', 'b')(objA, objB)).toBe(true);
    });

    it('should return false for objects with different values by specified keys', () => {
        const objA = { a: 1, b: 2 };
        const objB = { a: 1, b: 3 };
        expect(shallowEqualByKey('a', 'b')(objA, objB)).toBe(false);
    });

    it('should return false for objects with different keys', () => {
        const objA = { a: 1, b: 2 };
        const objB = { a: 1, c: 2 };
        expect(shallowEqualByKey('a', 'b')(objA, objB)).toBe(false);
    });

    it('should return false for objects with nested objects', () => {
        const objA = { a: { nested: 1 }, b: 2 };
        const objB = { a: { nested: 1 }, b: 2 };
        expect(shallowEqualByKey('a', 'b')(objA, objB)).toBe(false);
    });

    it('should return true for objects with same reference', () => {
        const objA = { a: 1, b: 2 };
        expect(shallowEqualByKey('a', 'b')(objA, objA)).toBe(true);
    });

    it('should return true for empty objects', () => {
        const objA = {};
        const objB = {};
        expect(shallowEqualByKey()(objA, objB)).toBe(true);
    });

    it('should return false for objects with different number of keys', () => {
        const objA = { a: 1 };
        const objB = { a: 1, b: 2 };
        expect(shallowEqualByKey('a', 'b')(objA, objB)).toBe(false);
    });
});
