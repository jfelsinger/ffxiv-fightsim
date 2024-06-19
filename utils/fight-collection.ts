import * as Bab from '@babylonjs/core';
import { Clock } from './clock';
import { Character } from './character';
import { Arena } from '../utils/arenas/arena';
import { Effect } from './effects';
import { hasTags } from './meta-helpers';

export type CharacterName =
    | 'player'
    | `party.${number}`
    | `ally.${number}`

export type FightCollectionOptions = {
    scene: Bab.Scene;
    worldClock: Clock;
    playerClock: Clock;
    arena?: Arena;
}

export class FightCollection {
    characters: Partial<Record<CharacterName, Character>> = {};
    activeEffects: Partial<Record<string, Effect>> = {};
    scene: Bab.Scene;
    worldClock: Clock;
    playerClock: Clock;
    arena?: Arena;
    gl?: Bab.GlowLayer;

    get player(): Character | undefined { return this.characters.player }
    set player(value: Character) { this.characters.player = value; }

    get groundMesh() { return this.getMeshByName('ground'); }
    get bossMesh() { return this.getMeshByName('boss'); }

    addGlow(mesh: Bab.Mesh) {
        if (!this.gl) {
            this.gl = new Bab.GlowLayer('glow', this.scene);
        }
        this.gl.addIncludedOnlyMesh(mesh);
    }

    getMeshByName(name: string) {
        return this.scene.getMeshByName(name);
    }

    addCharacter(character: Character, name?: CharacterName) {
        name = name || (character.name as CharacterName);
        if (name) {
            this.characters[name] = character;
        }
    }

    addActiveEffect(effect: Effect, label?: string) {
        label = label || effect.label || effect.name || effect?.mesh?.name;
        if (label) {
            this.activeEffects[label] = effect;
        }
    }

    filterCharacters(func: (key: string, char: Character) => boolean) {
        const results: Character[] = [];

        for (const [key, char] of Object.entries(this.characters)) {
            if (char && func(key, char)) {
                results.push(char);
            }
        }

        return results;
    }

    getPartyCharacters() {
        return this.filterCharacters((key) => key === 'player' || key.startsWith('party'));
    }

    getCharactersWithTags(tags: string[] | string) {
        const tagsArray = Array.isArray(tags) ? tags : [tags];
        return this.filterCharacters((_, char) => tagsArray.every((tag) => char.tags.has(tag)));
    }

    getMeshesWithTags(tags: string[] | string) {
        return this.scene.meshes.filter((mesh) => hasTags(mesh, tags));
    }

    getAllWithTags(tags: string[] | string) {
        const characters = this.getCharactersWithTags(tags);
        const meshes = this.getMeshesWithTags(tags).filter(m => !characters.some(c => c.uniqueId === m.uniqueId));
        return [
            ...characters,
            ...meshes,
        ];
    }

    getRandomTagged(tags: string[] | string) {
        const chars = this.getCharactersWithTags(tags);
        return chars[Math.floor(Math.random() * chars.length)];
    }

    setArena(arena: Arena) {
        this.arena = arena;
    }

    constructor(options: FightCollectionOptions) {
        this.playerClock = options.playerClock;
        this.worldClock = options.worldClock;
        this.scene = options.scene;
        this.arena = options.arena;
    }
}
