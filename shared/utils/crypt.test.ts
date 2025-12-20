import { expect, test, describe, vi } from 'vitest';
import * as crypt from './crypt';

describe('Crypt', () => {
    describe('mulberry32', () => {
        test('should be a function', () => {
            expect(typeof crypt.mulberry32).toBe('function');
        });

        test('should return a function', () => {
            let seed: any = '1234';
            expect(typeof crypt.mulberry32(seed)).toBe('function');

            seed = 1234;
            expect(typeof crypt.mulberry32(seed)).toBe('function');
        });
    });

    describe('hashCode', () => {
        test('should be a function', () => {
            expect(typeof crypt.hashCode).toBe('function');
        });

        test('should return a random hash given any input', () => {
            expect(typeof crypt.hashCode('test')).toBe('number');
            expect(typeof crypt.hashCode(0 as any)).toBe('number');
        });

        test('rand function should return a value between 0 and 1', () => {
            const rand = crypt.mulberry32('test');
            let calls = 0;
            while (calls < 100) {
                calls++;
                const result = rand();
                expect(result).toBeGreaterThanOrEqual(0);
                expect(result).toBeLessThanOrEqual(1);
            }
        });

        test('results should be different between calls with different seeds', () => {
            const rand1 = crypt.mulberry32('!@J#KDSfsdfjk');
            const results: any[] = [];
            while (results.length < 10) {
                results.push(rand1());
            }

            const rand2 = crypt.mulberry32('234lkjjksdfjlksd');
            for (let i = 0; i < results.length; i++) {
                expect(rand2()).not.toBe(results[i]);
            }
        });

        test('results should be consistent between calls with the same seed', () => {
            const seed = 'asDFK@#$SJKDFsj';
            const rand1 = crypt.mulberry32(seed);
            const results: any[] = [];
            while (results.length < 100) {
                results.push(rand1());
            }

            const rand2 = crypt.mulberry32(seed);
            for (let i = 0; i < results.length; i++) {
                expect(rand2()).toBe(results[i]);
            }
        });
    });

    describe('sha256', () => {
        test('should be a function', () => {
            expect(typeof crypt.sha256).toBe('function');
        });
    });
});
