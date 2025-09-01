export default wait;
export async function wait(ms: number, cb?: () => void) {
    await new Promise<void>(res => {
        setTimeout(() => res(), ms)
    });

    if (typeof (cb) === 'function') {
        cb();
    }
}
