import {
    Mechanic,
    type MechanicOptions,
} from './';

export const DefaultMechanicSchedulingMode = 'parallel';
export type M2SBeeStingOptions = MechanicOptions & {
};


export class M2SBeeSting extends Mechanic {
    override name = 'm2s-bee-sting';
    override options: M2SBeeStingOptions;

    constructor(options: M2SBeeStingOptions) {
        console.log('BEE STING: ', options);

        super(options);
        this.options = options;
        this.scheduling = options.scheduling || 'parallel';
    }

    // override getEffects(): Scheduled<Effect>[] {
    // }
}
