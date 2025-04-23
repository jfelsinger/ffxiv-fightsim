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
