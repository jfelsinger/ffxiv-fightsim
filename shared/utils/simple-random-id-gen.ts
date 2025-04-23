export function simpleRandomIdGen(len: number = 8, prefix?: string) {
    const chars = '1234567890_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let result = '';
    while (result.length < len) {
        result += chars[Math.floor(Math.random() * chars.length)] ?? '_';
    }

    if (prefix) {
        return `${prefix}${result}`;
    }
    return `${result}`;
}
