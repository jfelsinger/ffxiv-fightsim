import { expect, test, describe, vi } from 'vitest';
import { Clock } from './clock';

describe('Clock', () => {
    test('should construct a Clock instance', () => {
        const clock = new Clock();
        expect(clock.time).toBe(0);
    });
    test('should construct with defaults', () => {
        const clock = new Clock();
        expect(clock.time).toBe(0);
        expect(clock._prevTime).toBe(0);
        expect(clock.scaling).toBe(1.0);
        expect(clock.lastDelta).toBe(0);
        expect(clock.executeOnTick).toBe(true);

        expect(clock.isPaused).toBe(false);
    });

    describe('start', () => {
        test('shout set paused to false', () => {
            const clock = new Clock({ paused: true });
            expect(clock.isPaused).toBe(true);

            clock.start();
            expect(clock.isPaused).toBe(false);
        });

        test('shout call start event', () => {
            const clock = new Clock({ paused: true, duration: 1000, startTime: 200 });
            const emitSpy = vi.spyOn(clock, 'emit');
            function onStart(p1: any) {
                expect(clock.time).toBe(200);
                expect(p1).toBe(200);
            }
            clock.on('start', onStart);


            clock.start();
            expect(clock.isPaused).toBe(false);
            expect(emitSpy).toHaveBeenCalledWith('start', 200, clock);
        });
    });

    describe('pause', () => {
        test('shout set paused to false', () => {
            const clock = new Clock();

            expect(clock.isPaused).toBe(false);
            clock.pause();
            expect(clock.isPaused).toBe(true);
        });

        test('shout call pause event', () => {
            const clock = new Clock({ duration: 1000, startTime: 200 });
            const emitSpy = vi.spyOn(clock, 'emit');
            function onPause(p1: any) {
                expect(clock.time).toBe(200);
                expect(p1).toBe(200);
            }
            clock.on('pause', onPause);


            clock.pause();
            expect(clock.isPaused).toBe(true);
            expect(emitSpy).toHaveBeenCalledWith('pause', 200, clock);
        });
    });

    describe('setTime', () => {
        test('should set time to given value', () => {
            const clock = new Clock({ duration: 1000 });
            expect(clock.time).toBe(0);
            clock.setTime(500);
            expect(clock.time).toBe(500);
        });

        test('should not advance time past duration', () => {
            const clock = new Clock({ duration: 1000 });
            clock.setTime(9999);
            expect(clock.time).toBe(1000);

            clock.setTime(10);
            expect(clock.time).toBe(10);

            clock.setTime(1000);
            expect(clock.time).toBe(1000);
        });

        test.skip('should not record delta', () => {
            const clock = new Clock({ duration: 1000 });
            expect(clock.lastDelta).toBe(0);
            clock.setTime(25);
            expect(clock.lastDelta).toBe(0);

            clock.tick(10);
            clock.setTime(500);
            expect(clock.lastDelta).toBe(10);
        });
    });

    describe('tick', () => {
        test('should advance time by delta', () => {
            const clock = new Clock({ duration: 1000 });
            expect(clock.time).toBe(0);
            clock.tick(25);
            expect(clock.time).toBe(25);

            clock.setTime(500);
            clock.tick(10);
            expect(clock.time).toBe(510);
        });

        test('should record delta', () => {
            const clock = new Clock({ duration: 1000 });
            expect(clock.lastDelta).toBe(0);
            clock.tick(25);
            expect(clock.lastDelta).toBe(25);

            clock.setTime(500);
            clock.tick(10);
            expect(clock.lastDelta).toBe(10);
        });

        test('should not advance time past duration', () => {
            const clock = new Clock({ duration: 1000 });
            clock.tick(9999);
            expect(clock.time).toBe(1000);
            clock.tick(10);
            expect(clock.time).toBe(1000);
        });

        test('should not advance time when paused', () => {
            const clock = new Clock({ duration: 1000 });
            clock.pause();
            clock.tick(10);
            expect(clock.time).toBe(0);

            clock.start();
            clock.tick(10);
            expect(clock.time).toBe(10);

            clock.pause();
            clock.tick(10);
            expect(clock.time).toBe(10);
        });
    });

    describe('toJSONSnapshot', () => {
        test('should return a JSON snapshot of the basic clock state', () => {
            const clock = new Clock({ duration: 1000 });
            clock.setTime(500);
            clock.tick(25);
            const snapshot = clock.toJSONSnapshot();
            expect(snapshot).toMatchObject({
                time: 525,
                lastDelta: 25,
                _prevTime: 500,
                scaling: 1.0,
                duration: 1000,
                executeOnTick: true,
            });
        });
    });

    describe('loadJSONSnapshot', () => {
        test('should load the clock state from a JSON snapshot', () => {
            const clock = new Clock({ duration: 1000 });
            clock.setTime(500);
            clock.tick(25);
            const snapshot = clock.toJSONSnapshot();

            const clock2 = new Clock();
            clock2.loadJSONSnapshot(snapshot);
            expect(clock2).toMatchObject({
                time: 525,
                // lastDelta: 25,
                // _prevTime: 500,
                scaling: 1.0,
                duration: 1000,
                executeOnTick: true,
            });
        });
    });
});
