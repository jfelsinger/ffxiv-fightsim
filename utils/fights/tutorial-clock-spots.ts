import * as Bab from '@babylonjs/core';

import {
    Fight,
    type FightOptions,
} from './';

export type ClockSpotsTutorialOptions = FightOptions & {
};

export class ClockSpotsTutorial extends Fight {
    options: ClockSpotsTutorialOptions;

    constructor(options: ClockSpotsTutorialOptions) {
        super(options);
        this.options = options;
    }

    async dispose() {
        await super.dispose();
    }
}
