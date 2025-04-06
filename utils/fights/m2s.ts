import {
    Fight,
    type FightOptions,
} from './';

export type M2SFightOptions = FightOptions & {
};

export class M2SFight extends Fight {
    override options: M2SFightOptions;
    boss!: Boss;

    constructor(options: M2SFightOptions) {
        super(options);
        this.options = options;

        const bossSize = yalmsToM(5.5);
        const height = bossSize * 1.333;
        const width = height * 1.508;

        const boss = new Boss('Honey B Lovely', {
            size: 5.5,
            width,
            height,
        }, this.collection);
        boss.body.position.y = bossSize / 1.25;
    }

    override async dispose() {
        this.boss?.dispose();
        await super.dispose();
    }
}
