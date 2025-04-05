import * as Bab from '@babylonjs/core';

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
        return this.filterCharacters((key, char) => key === 'player' || key.startsWith('party') || char.tags.has('player'));
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

    setupStandardParty() {
        const { role: playerRole } = useRole();
        this.setupPlayerRole(playerRole.value);

        const roles = shuffleArray(getOtherRoles(playerRole.value));
        const npcs = roles.map((npcRole, i) => this.makeNpc(`npc-${i}-${npcRole}`, '0,0', npcRole));
        return {
            npcs,
        };
    }

    setupPlayerRole(role: Role) {
        let player = this.characters['player'];
        let roleType = getRoleType(role);
        if (player) {
            player.role = role;
            player.tags.add(role);
            player.tags.add(roleType);
            if (isSupportRole(role)) {
                player.tags.add('support');
            }

            if (roleType === 'tank') {
                (player.body.material as Bab.StandardMaterial).diffuseColor = Bab.Color3.FromHexString('#465ece');
                (player.body.material as Bab.StandardMaterial).specularColor = Bab.Color3.FromHexString('#889aef');
            } else if (roleType === 'healer') {
                (player.body.material as Bab.StandardMaterial).diffuseColor = Bab.Color3.FromHexString('#477938');
                (player.body.material as Bab.StandardMaterial).specularColor = Bab.Color3.FromHexString('#a2cc96');
            } else if (roleType === 'dps') {
                (player.body.material as Bab.StandardMaterial).diffuseColor = Bab.Color3.FromHexString('#7b3839');
                (player.body.material as Bab.StandardMaterial).specularColor = Bab.Color3.FromHexString('#de9899');
            }
        }

        return {
            player,
            role,
            roleType,
        };
    }

    makeNpc(name: string, position: string, role: Role) {
        const roleType = getRoleType(role);
        let color = Bab.Color3.FromHexString('#e9c8aa');
        let specular = Bab.Color3.FromHexString('#e9c8aa');

        if (roleType === 'tank') {
            color = Bab.Color3.FromHexString('#889aef');
            specular = Bab.Color3.FromHexString('#465ece');
        } else if (roleType === 'healer') {
            color = Bab.Color3.FromHexString('#a2cc96');
            specular = Bab.Color3.FromHexString('477938');
        } else if (roleType === 'dps') {
            color = Bab.Color3.FromHexString('#de9899');
            specular = Bab.Color3.FromHexString('#7b3839');
        }

        const npc = new Character(name, {
            role: role as any,
            diffuseColor: color,
            specularColor: specular,
            startPosition: getPosition(
                position,
                'arena',
                this
            ),
        }, this.scene, this.worldClock);
        npc.tags.clear();
        npc.tags.add(role);
        npc.tags.add(roleType);
        if (isSupportRole(role)) {
            npc.tags.add('support');
        }

        this.addCharacter(npc);
        return npc;
    }

    constructor(options: FightCollectionOptions) {
        this.playerClock = options.playerClock;
        this.worldClock = options.worldClock;
        this.scene = options.scene;
        this.arena = options.arena;
    }
}
