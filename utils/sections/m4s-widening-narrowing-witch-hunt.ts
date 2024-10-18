import * as Bab from '@babylonjs/core';
import { rotateArray } from '../array-rotate';

import {
    FightSection,
    type SectionOptions,
} from './';

export type WideningNarrowingWitchHuntSectionOptions = SectionOptions & {
}

export class WideningNarrowingWitchHuntSection extends FightSection {
    override options: WideningNarrowingWitchHuntSectionOptions;


    constructor(options: WideningNarrowingWitchHuntSectionOptions) {
        super(options);
        this.options = options;

        this.on('start-execute', () => {
        });
    }

}

