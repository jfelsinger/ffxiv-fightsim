import {
    Mechanic,
    type MechanicOptions,
} from './';

export const DefaultMechanicSchedulingMode = 'parallel';
export type M2SPoisonStingOptions = MechanicOptions & {
};


export class M2SPoisonSting extends Mechanic {
    override name = 'm2s-poison-sting';
    override options: M2SPoisonStingOptions;

    constructor(options: M2SPoisonStingOptions) {
        super(options);
        this.options = options;
        this.scheduling = options.scheduling || 'parallel';

        (window as any).__mechanic = this;

    }

    // override getEffects(): Scheduled<Effect>[] {
    // }
}
