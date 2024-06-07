import Mexp from 'math-expression-evaluator';
const mexp = new Mexp();

export function parseNumber(val: string | number) {
    if (typeof val === 'number') {
        return val;
    } else if (!isNaN(+val)) {
        return +val;
    } else {
        try {
            return mexp.eval(val);
        } catch (err) {
            console.error('mexp error: ', err);
        }
    }

    return +val;
}
