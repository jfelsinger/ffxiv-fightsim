import { sha256 } from './crypt';
export default shortHash;
export async function shortHash(val: string, length = 4, salt = 'boing1s') {
    if (!val) { return val; }

    salt = salt += val.length;
    let value = salt + val;
    try {
        // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
        const encoded = new TextEncoder().encode(value);
        const digest = await crypto.subtle.digest('SHA-256', encoded);
        // return new TextDecoder().decode(new Uint8Array(digest));
        value = btoa(
            String.fromCharCode(
                ...(new Uint8Array(digest))
            )
        );

        value = value?.replaceAll(/[/=+\\]/gi, '');

        const arr = value.split('');

        while (arr.length > length) {
            for (let i = Math.floor(length / 2); i < arr.length && arr.length > length; i += 3) {
                arr.splice(i, 1);
            }
        }

        const digits = ('' + val.length).split('');
        for (let i = 0; i < digits.length; i++) {
            if (i === 0) {
                arr.splice(arr.length - 2, 0, digits[i]);
            } else {
                arr.splice((2 * i), 0, digits[i]);
            }
        }
        value = arr.join('');

        return value;
    } catch (err) {
        console.error(err);
    }

    try {
        return (await sha256(value))?.slice(0, length);
    } catch (err) {
        console.error(err);
    }

    return;
}
