import {
    FightSection,
    type SectionOptions,
} from './';

export type FuseOrFoeSectionOptions = SectionOptions & {
}

export class FuseOrFoeSection extends FightSection {
    override options: FuseOrFoeSectionOptions;


    constructor(options: FuseOrFoeSectionOptions) {
        super(options);
        this.options = options;

        // Randomize starting on 1-3 or 2-4
        const fuseOrFoe1 = this.mechanics.find((m) => m.label === 'm3s-fuse-or-foe-1-3');
        const fuseOrFoe2 = this.mechanics.find((m) => m.label === 'm3s-fuse-or-foe-2-4');
        if (Math.round(Math.random())) {
            if (fuseOrFoe1) {
                fuseOrFoe1.startDelay = 7350;
            }
            if (fuseOrFoe2) {
                fuseOrFoe2.startDelay = 0;
            }
        } else {
            if (fuseOrFoe1) {
                fuseOrFoe1.startDelay = 0;
            }
            if (fuseOrFoe2) {
                fuseOrFoe2.startDelay = 7350;
            }
        }
    }

}
