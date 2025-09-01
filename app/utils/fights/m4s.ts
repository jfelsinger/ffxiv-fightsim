import {
    Fight,
    type FightOptions,
} from './';

export type M4SFightOptions = FightOptions & {
};

export class M4SFight extends Fight {
    override options: M4SFightOptions;
    boss!: Boss;

    constructor(options: M4SFightOptions) {
        super(options);
        this.options = options;

        this.on('start-execute', () => {
            (window as any).__m4s = this;
            const bossSize = yalmsToM(5.5);
            const height = bossSize * 2.525;
            const width = height * 0.879433;

            const boss = new Boss('Wicked Thunder', {
                size: 6.6725,
                width,
                height,
                image: '/images/fights/m4s/boss.png',
            }, this.collection);
            boss.marker.rotation.y += 180 * (Math.PI / 180);
            boss.body.position.y = bossSize * 1.0;
            this.boss = boss;
            const characters = this.collection.getPartyCharacters();


            function updateNearFarTags() {
                const characterDistances = characters.map((character) => ({
                    character,
                    distance: Bab.Vector3.Distance(character.position, boss.position),
                }));

                const nearest = characterDistances.sort((a, b) => a.distance - b.distance);
                const len = nearest.length;
                for (let i = 0; i < len; i++) {
                    addTag(nearest[i].character, `near-${i + 1}`);
                    addTag(nearest[i].character, `far-${len - (i)}`);
                }

            }
            this.collection.worldClock.on('tick', updateNearFarTags);
            this.on('dispose', () => {
                this.collection.worldClock.off('tick', updateNearFarTags);
            });
        });
    }

    override async dispose() {
        this.boss?.dispose();
        await super.dispose();
    }
}
