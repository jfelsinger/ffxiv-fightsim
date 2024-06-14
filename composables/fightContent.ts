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
        'startPosition',
        'startPositionType',
    ];


    const raid = `${route.params.raid}`;
    let path = `/raids/${raid}`;

    const section = `${route.params.section}`;
    if (section) { path += `/sections/${section}`; }

    return useAsyncData(path, async () => {
        const fightPromise = queryContent(path).only(fightParams).findOne();
        const infoPromise = queryContent(path + '.info').findOne().catch((err) => {
            console.error('info error: ', err);
        });

        const result = {
            fight: await fightPromise,
            info: await infoPromise,
        };

        console.log('result: ', result);
        return result;
    });
}
