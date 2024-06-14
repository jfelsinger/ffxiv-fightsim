import { Character } from './character';
export type Tags = Set<string>;
export type Stacks = Partial<Record<string, number>>;

type Meta = {
    tags?: Set<string>
    stacks?: Partial<Record<string, number>>
    character?: Character
}

type MeshMeta = {
    metadata?: Meta
}

function isMeshMeta(v: unknown): v is MeshMeta {
    return typeof v === 'object' && v != null && 'metadata' in v;
}

export function addStacks(target: Character | MeshMeta | Meta, name: string, count = 1) {
    if (isMeshMeta(target)) {
        if (target?.metadata?.character) {
            addStacks(target.metadata.character, name, count);
        } else {
            if (!target?.metadata?.stacks) {
                target.metadata = {
                    ...target.metadata,
                    stacks: {},
                }
            }
            addStacks(target.metadata, name, count);
        }
    } else {
        if (!target?.stacks) {
            target.stacks = {};
        }

        target.stacks[name] = (target.stacks[name] || 0) + count;
    }
}

export function getStacks(target: Character | MeshMeta | Meta, name: string) {
    if (isMeshMeta(target)) {
        if (target?.metadata?.character) {
            return getStacks(target.metadata.character, name);
        } else {
            if (!target?.metadata?.stacks) {
                target.metadata = {
                    ...target.metadata,
                    stacks: {},
                }
            }
            return getStacks(target.metadata, name);
        }
    } else {
        if (!target?.stacks) {
            target.stacks = {};
        }

        return target.stacks[name];
    }
}

export function clearStacks(target: Character | MeshMeta | Meta, name: string) {
    if (isMeshMeta(target)) {
        if (target?.metadata?.character) {
            clearStacks(target.metadata.character, name);
        } else {
            if (!target?.metadata?.stacks) {
                target.metadata = {
                    ...target.metadata,
                    stacks: {},
                }
            }
            clearStacks(target.metadata, name);
        }
    } else {
        if (!target?.stacks) {
            target.stacks = {};
        }

        target.stacks[name] = 0;
    }
}

export function removeStacks(target: Character | MeshMeta | Meta, name: string, count = 1) {
    if (isMeshMeta(target)) {
        if (target?.metadata?.character) {
            removeStacks(target.metadata.character, name, count);
        } else {
            if (!target?.metadata?.stacks) {
                target.metadata = {
                    ...target.metadata,
                    stacks: {},
                }
            }
            removeStacks(target.metadata, name, count);
        }
    } else {
        if (!target?.stacks) {
            target.stacks = {};
        }

        target.stacks[name] = Math.max(0, (target.stacks[name] || 0) - count);
    }
}

export function addTag(target: Character | MeshMeta | Meta, tag: string) {
    if (isMeshMeta(target)) {
        if (target?.metadata?.character) {
            addTag(target.metadata.character, tag);
        } else {
            if (!target?.metadata?.tags) {
                target.metadata = {
                    ...target.metadata,
                    tags: new Set<string>(),
                }
            }
            addTag(target.metadata, tag);
        }
    } else {
        if (!target?.tags) {
            target.tags = new Set<string>();
        }

        target.tags.add(tag);
    }
}

export function hasTags(target: Character | MeshMeta | Meta, tags: string[] | string) {
    if (typeof (tags) === 'string') { tags = [tags]; }
    if (!tags.length) return false;

    if (isMeshMeta(target)) {
        if (target?.metadata?.character) {
            return tags.every(t => target?.metadata?.character?.tags?.has(t));
        } else if (target?.metadata?.tags) {
            return tags.every(t => target?.metadata?.tags?.has(t));
        }
    } else if ((target as any)?.character) {
        return tags.every(t => (target as any)?.character?.tags?.has(t));
    } else if ((target as any)?.tags) {
        return tags.every(t => (target as any)?.tags?.has(t));
    }

    return false;
}

export function removeTag(target: Character | MeshMeta | Meta, tag: string | string) {
    if (isMeshMeta(target)) {
        if (target?.metadata?.character) {
            return target?.metadata?.character?.tags?.delete(tag);
        } else if (target?.metadata?.tags) {
            return target?.metadata?.tags?.delete(tag);
        }
    } else if ((target as any)?.character) {
        return (target as any)?.character?.tags?.delete(tag);
    } else if ((target as any)?.tags) {
        return (target as any)?.tags?.delete(tag);
    }
    return false;
}
