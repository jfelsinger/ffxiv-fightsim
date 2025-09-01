export function useFightContent(fightParams?: Array<string>) {
    const route = useRoute();

    fightParams = fightParams || [
        'title',
        'description',

        'name',
        'arena',
        'arenaType',
        'scheduling',
        'sections',
        'waymarks',
        'waymarksPositionType',
        'waymarkPositionType',
        'startPosition',
        'startPositionType',
    ];


    const tutorial = route.params.tutorial;
    const raid = route.params.raid;
    let path = raid ? `/raids/${raid}` : `/tutorials/${tutorial}`;

    const section = route.params.section;
    if (section) { path += `/sections/${section}`; }

    return useAsyncData(path, async () => {
        const fightPromise = queryCollection('data').path(path).select(...fightParams as any).first();
        const infoPromise = queryCollection('content').path(path + '.info').first().catch((err) => {
            console.error('info error: ', err);
        });

        const result = {
            fight: await fightPromise,
            info: await infoPromise,
        };

        if (JSON.stringify(result.fight).includes('bject Object')) {
            console.warn('useFightContent() - result.fight improperly queried', result.fight);
        }
        if (JSON.stringify(result.info).includes('bject Object')) {
            console.warn('useFightContent() - result.info improperly queried', result.info);
        }

        return result;
    });
}
