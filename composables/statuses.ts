type Status = {
    id?: string
    name: string
    src?: string
    seconds?: string | number
}

type StatusDictionary = Record<string, Status[]>;
export function useStatuses(name = 'player') {
    const statuses = useState<Status[] | undefined>(`status-dictionary-${name}`, () => []);
    // const statusesLists = computed(() => Object.keys(statusDictionary.value));

    // TODO: Remove this to somewhere else.
    if (!statuses.value?.length) {
        statuses.value = [{
            name: 'm2s/beat-3-1',
            seconds: 23,
        }];
    }

    return {
        statuses,
        // statusDictionary,
        // statusesLists,
    };
}
