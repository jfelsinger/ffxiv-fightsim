export function rotateArray<T>(array: T[], n: number): T[] {
    n = n % array.length;
    return array.slice(n, array.length).concat(array.slice(0, n));
}

