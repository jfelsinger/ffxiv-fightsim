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

    return useAsyncData(path, () => queryContent(path).only(fightParams).findOne());
}
