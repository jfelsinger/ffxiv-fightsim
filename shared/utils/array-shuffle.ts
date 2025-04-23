export function shuffleArray<T>(array: T[]): T[] {
    if (!Array.isArray(array) || array.length < 2) { return array; }
    array = array.slice();
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
