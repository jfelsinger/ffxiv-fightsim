export async function sha256(value: string) {
    if (!value) return undefined;

    try {
        // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
        const encoded = new TextEncoder().encode(value);
        const digest = await crypto.subtle.digest('SHA-256', encoded);
        // return new TextDecoder().decode(new Uint8Array(digest));
        const hashArray = Array.from(new Uint8Array(digest));
        const hashHex = hashArray
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('')

        return hashHex;
    } catch (err) {
        console.error(err);
    }

    return undefined;
}

export function hashCode(input: string) {
    input = input?.toString() || '';
    let hash = 0;
    for (const char of input) {
        hash = (hash << 5) - hash + char.charCodeAt(0);
        hash |= 0;
    }
    return hash;
}

export function mulberry32(seed: any) {
    if (typeof seed !== 'number') {
        seed = hashCode(seed);
    }

    return function () {
        let t = (seed += 0x6D2B79F5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
