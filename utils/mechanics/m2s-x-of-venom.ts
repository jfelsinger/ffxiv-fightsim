import {
    Mechanic,
    type MechanicOptions,
} from './';

export const DefaultMechanicSchedulingMode = 'parallel';
export type M2SXOfVenomOptions = MechanicOptions & {
};


export class M2SXOfVenom extends Mechanic {
    override name = 'm2s-poison-sting';
    override options: M2SXOfVenomOptions;

    constructor(options: M2SXOfVenomOptions) {
        const cast = Math.floor(Math.random()) ? 'Drop' : 'Splash';
        const venomCast = useState<string | undefined>('venom-cast');
        venomCast.value = `${cast} of Venom`;
        options.castName = venomCast.value;

        super(options);
        this.options = options;
        this.scheduling = options.scheduling || 'parallel';

        (window as any).__mechanic = this;
    }

    // override getEffects(): Scheduled<Effect>[] {
    // }
}
