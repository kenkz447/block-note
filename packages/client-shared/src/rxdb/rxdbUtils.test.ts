import { describe, it, expect } from 'vitest';
import { ensureDbExist, ensureCollectionExist, generateRxId } from './rxdbUtils';
import { type AppRxDatabase } from './rxdbTypes';

describe('ensureDbExist', () => {
    it('should throw an error when the database is not initialized', () => {
        expect(() => ensureDbExist(undefined)).toThrow('Database not initialized');
    });

    it('should not throw an error when the database is initialized', () => {
        const mockDb = {} as AppRxDatabase;
        expect(() => ensureDbExist(mockDb)).not.toThrow();
    });
});

describe('ensureCollectionExist', () => {
    it('should throw an error when the database is not initialized', () => {
        expect(() => ensureCollectionExist(undefined, 'entries')).toThrow('Database not initialized');
    });

    it('should throw an error when the collection is not found', () => {
        const mockDb = {} as AppRxDatabase;
        expect(() => ensureCollectionExist(mockDb, 'entries')).toThrow('Collection entries not found');
    });

    it('should not throw an error when the collection is found', () => {
        const mockDb = { entries: {} } as unknown as AppRxDatabase;
        expect(() => ensureCollectionExist(mockDb, 'entries')).not.toThrow();
    });
});

describe('generateRxId', () => {
    it('should generate a string ID', () => {
        const id = generateRxId();
        expect(typeof id).toBe('string');
    });

    it('should generate unique IDs', () => {
        const id1 = generateRxId();
        const id2 = generateRxId();
        expect(id1).not.toBe(id2);
    });
});
