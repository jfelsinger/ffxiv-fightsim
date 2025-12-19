import { expect, test, describe, vi } from 'vitest';
import * as crypt from './crypt';

describe('Crypt', () => {
    describe('mulberry32', () => {
        test('should be a function', () => {
            expect(typeof crypt.mulberry32).toBe('function');
        });
    });

    describe('hashCode', () => {
        test('should be a function', () => {
            expect(typeof crypt.hashCode).toBe('function');
        });
    });

    describe('sha256', () => {
        test('should be a function', () => {
            expect(typeof crypt.sha256).toBe('function');
        });
    });
});
