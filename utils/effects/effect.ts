import * as Bab from '@babylonjs/core';
import { EventEmitter } from 'eventemitter3';
import { useCastState } from '../../composables/castState';

import Debug from 'debug';
const debug = Debug('game:utils:effect');

const castState = useCastState();

export type EffectTargetType =
    | 'boss' | 'adds'
    | 'all' // All players
    | 'player' | 'party' | 'maintank'
    | 'tank' | 'healer' | 'dps' | `tag-${string}`;

export type EffectTarget =
    // | Bab.Mesh
    | EffectTargetType;

export type EffectPositionType = PositionType;

export type EffectOptions = {
    label?: string
    color?: string
    duration: number | string
    shiftSnapshot: number | string
    collection: FightCollection
    clock?: Clock
    usePlayerTick?: boolean
    telegraph?: number

    target?: EffectTarget | (EffectTarget[])
    position?: PositionOption
    positionType?: EffectPositionType
    followPosition?: boolean

    castName?: string

    positions?: PositionOption[]
    easing?: string,
    positionTypes?: EffectPositionType[]
    positionSteps?: number[]

    // Whether or not the same random target can be selected more than once,
    // when randomly selecting from a group of targets
    repeatTarget?: boolean

    startStatus?: PartialStatus
    endStatus?: PartialStatus
}

const globalTelegraph = useState<number>('telegraph', () => 1.0);

export class Effect extends EventEmitter {
    n?: number;
    scheduledParent?: ScheduledParent<Effect>;

    name: string = 'default';
    label?: string;
    clock: Clock
    collection: FightCollection;
    color?: string;
    isActive: boolean = false;
    usePlayerTick: boolean = false;

    duration: number;
    shiftSnapshot: number;
    target: EffectTarget[] = [];

    position: EffectOptions['position'];
    positionType: EffectOptions['positionType'];
    followPosition: EffectOptions['followPosition'];

    positions?: EffectOptions['positions'];
    positionTypes?: EffectOptions['positionTypes'];
    positionSteps?: EffectOptions['positionSteps'];
    easing?: string

    repeatTarget: boolean;
    telegraph: number;
    telegraphShown = false;

    // The mesh for the effect itself
    mesh?: Bab.Mesh;
    options: EffectOptions;

    get scene() { return this.collection.scene; }

    get adjustedTelegraph() { return this.telegraph * globalTelegraph.value; }

    constructor(options: EffectOptions) {
        super();
        this.options = options;
        this.telegraph = parseNumber(options.telegraph ?? 1.0);
        this.label = options.label;
        this.duration = parseNumber(options.duration ?? 0);
        this.shiftSnapshot = parseNumber(options.shiftSnapshot ?? 0);
        this.collection = options.collection;
        this.clock = options.clock || this.collection.worldClock;
        this.color = options.color;
        this.repeatTarget = options.repeatTarget ?? false;

        if (Array.isArray(options.target)) {
            this.target = options.target;
        } else if (options.target) {
            this.target = [options.target];
        }

        this.position = options.position || Bab.Vector3.Zero();
        this.positionType = options.positionType || 'arena';
        this.followPosition = options.followPosition || false;

        this.positions = options.positions;
        this.positionTypes = options.positionTypes;
        this.positionSteps = options.positionSteps;
        this.easing = options.easing;

        const onTickUpdate = (time: number) => {
            this.tickUpdate(time);
        };

        this.usePlayerTick = options.usePlayerTick || false;
        if (this.usePlayerTick) {
            this.collection.playerClock.on('tick', onTickUpdate);
            this.on('dispose', () => {
                this.collection.playerClock.off('tick', onTickUpdate);
            });
        } else {
            this.clock.on('tick', onTickUpdate);
            this.on('dispose', () => {
                this.clock.off('tick', onTickUpdate);
            });
        }
    }

    setColor(color: string) {
        this.color = color;
    }

    getColor() {
        if (this.color) {
            if (this.color.startsWith('#')) {
                return Bab.Color3.FromHexString(this.color);
            } else if (this.color.includes(',')) {
                const entries = this.color.split(',').map(_ => +_);
                if (entries.length === 3) {
                    if (entries.every((e) => e <= 1)) {
                        return new Bab.Color3(entries[0], entries[1], entries[2]);
                    } else {
                        return Bab.Color3.FromInts(entries[0], entries[1], entries[2]);
                    }
                }
            }
        }

        return Bab.Color3.FromInts(255, 150, 20);
    }

    getTargets() {
        const targets: (Character | Bab.AbstractMesh)[] = [];

        const len = this.target.length;
        for (let i = 0; i < len; i++) {
            const target = this.getTarget(this.target[i], targets);
            if (target) {
                targets.push(...target);
            }
        }

        const uniqueTargets = [...new Map(targets.map(item => [item.uniqueId, item])).values()];
        return uniqueTargets;
    }

    getTarget(targetType: EffectTargetType, currentTargets?: (Character | Bab.AbstractMesh)[]) {
        let results: (Character | Bab.AbstractMesh)[] = [];

        if (targetType === 'player') {
            const player = this.collection.player;
            if (player && !currentTargets?.some(t => t.uniqueId === player?.uniqueId)) {
                results.push(player);
            }
        } else if (targetType.startsWith('tag-')) {
            const tag = targetType.split('-').slice(1).join('-');
            results = this.collection.getAllWithTags(tag);
        }

        return results;
    }

    setDuration(duration: number | string) {
        this.duration = parseNumber(duration);
    }

    getDuration() {
        return this.duration || 0;
    }

    getShift() {
        return this.shiftSnapshot || 0;
    }

    setTelegraph(telegraph: number | string) {
        this.telegraph = parseNumber(telegraph);
    }

    getPosition(value?: number): Bab.Vector3 {
        // const target = this.getTarget('player')
        const target = this.getTargets();
        if (this.scheduledParent?.scheduled?.item) {
            if (this.position === 'parent') {
                return this.scheduledParent.scheduled.item.getPosition();
            } else if (this.position === 'parent-end') {
                return this.scheduledParent.scheduled.item.getPosition(1.0);
            } else if (this.position === 'parent-start') {
                return this.scheduledParent.scheduled.item.getPosition(0.0);
            } else if (typeof (this.position) === 'string' && this.position.startsWith('parent-')) {
                const v = parseNumber(this.position.split('-').slice(1).join('-'));
                return this.scheduledParent.scheduled.item.getPosition(v);
            }
        }

        if (this.positions) {
            return getInterpolatedPosition({
                positions: this.positions,
                positionTypes: this.positionTypes,
                positionType: this.positionType,
                steps: this.positionSteps,
                value: value ?? this.getDurationPercent(),
                easing: this.easing,
                collection: this.collection,
                target
            });
        }

        return getPosition(
            this.position,
            this.positionType,
            this.collection,
            target
        )
    }

    updatePosition(value?: number) {
        if ((this.positions || this.followPosition) && this.mesh) {
            const { x, z } = this.getPosition(value);
            const y = this.mesh.position.y;
            this.mesh.position.set(x, y, z);
        }
    }

    tickUpdate(time: number, delta) {
        if (this.isActive) {
            const durationPercent = this.getDurationPercent();
            const adjustedTelegraph = this.adjustedTelegraph;
            if (this.options.castName) {
                if (durationPercent < 1) {
                    castState.value = {
                        name: this.options.castName,
                        percent: durationPercent,
                    };
                }
            }

            if (!this.telegraphShown && adjustedTelegraph && durationPercent >= adjustedTelegraph) {
                this.telegraphShown = true;
                this.emit('show-telegraph', {
                    time,
                    durationPercent,
                    telegraph: adjustedTelegraph,
                });
            }

            this.updatePosition(durationPercent);
            this.emit('tick', {
                time,
                delta,
                durationPercent,
                telegraph: adjustedTelegraph,
            });
        }
    }

    startTime: number = 0;
    endTime: number = 0;
    get elapsed() { return this.clock.time - this.startTime; }

    getDurationPercent(duration?: number, unshifted?: boolean) {
        duration = duration || (this.getDuration() - (unshifted ? 0 : this.getShift()));
        if (!duration || (!this.isActive && !this.startTime)) {
            return 0;
        }

        if (this.endTime > this.startTime) {
            return 1.0;
        }

        const elapsed = Math.min(duration, this.elapsed);
        return Math.min(1.0, Math.max(0.0, elapsed / duration));
    }


    async start(n = 0, parent?: ScheduledParent<Effect>) {
        this.n = n;
        this.scheduledParent = parent;
        this.telegraphShown = false;
        // console.log('EFFECT: ', n, parent, parent?.scheduled?.item, parent?.scheduled?.item?.position, parent?.scheduled?.item?.getPosition());

        // TODO: Implement this somewhere else.
        // TODO: if tutorial mode
        // this.on('show-telegraph', () => {
        //     this.clock.pause();
        // });

        // this.on('pre-snapshot', () => {
        //     this.clock.pause();
        // });

        this.startTime = this.clock.time;
        // console.log('EFFECT START: ', this.name, this.startTime, this);
        this.emit('start');
        await this.startup();

        this.emit('post-startup');
        await this.execute();
        this.emit('pre-cleanup');

        await this.cleanup();
        this.endTime = this.clock.time;
        this.emit('end');
    }

    async execute() {
        const status = this.options.startStatus;
        if (status) {
            const targets = this.getTargets();
            targets.forEach(target => {
                if ((target as any)?.addStatus) {
                    (target as Character).addStatus(status);
                }
            })
        }

        if (this.duration) {
            await this.clock.wait(this.duration - this.shiftSnapshot);
        }

        await this.preSnapshot();
        this.snapshot();

        if (this.shiftSnapshot) {
            await this.clock.wait(this.shiftSnapshot);
        }
    }

    async preSnapshot() {
        if (!this.isActive) { return; }
        // else:

        this.emit('pre-snapshot', { mesh: this.mesh });

        // Shhh. No-one has to know that we're throwing the timing off by
        // ~1ms + whatever the clock/frame delay is
        await this.clock.wait(1);
    }

    snapshot() {
        if (!this.isActive) { return; }
        // else:

        const status = this.options.endStatus;
        if (status) {
            const targets = this.getTargets();
            targets.forEach(target => {
                if ((target as any)?.addStatus) {
                    (target as Character).addStatus(status);
                }
            })
        }
        this.emit('snapshot', { mesh: this.mesh });
        this.checkCollisions();
    }

    checkCollisions(skipEmit?: boolean) {
        // TODO: Add checks for different party members later

        const target = this.collection.player;
        if (target && this.checkCharacterCollision(target)) {
            if (!skipEmit) {
                this.emit('effect-hit', {
                    effect: this,
                    target: this.collection.player,
                });
            }

            return true;
        }

        return false;
    }

    checkCharacterCollision(target: Character) {
        return this.checkMeshCollision(target.collider);
    }

    checkMeshCollision(target: Bab.Mesh) {
        const mesh = this.mesh;
        if (mesh && target?.intersectsMesh(mesh, false)) {
            return true;
        }

        return false;
    }

    async startup() {
        this.isActive = true;
        this.collection.addActiveEffect(this);
    }

    async cleanup() {
        this.isActive = false;
        if (this.options.castName) {
            castState.value = undefined;
        }
    }

    async dispose() {
        this.isActive = false;
        this.emit('dispose');
        await this.cleanup();
    }

    toJSON() {
        let positionValue = typeof (this.options.position) === 'function' ? this.options.position() : this.options.position;
        if (positionValue && typeof (positionValue) !== 'string' && !Array.isArray(positionValue)) {
            positionValue = [
                positionValue!.x,
                positionValue!.y,
                positionValue!.z,
            ].join(',');
        }

        const results = getBasicValues(this.options);
        return {
            label: this.options.label,
            name: this.name,
            ...results,
            duration: this.options.duration || this.duration,
            position: positionValue,
            positionType: this.options.positionType || this.positionType,

            positions: this.options.positions,
            positionSteps: this.options.positionSteps,
            positionTypes: this.options.positionTypes,
        }
    }
}
