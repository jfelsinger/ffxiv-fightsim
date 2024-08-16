import { type Status } from '../utils/status';

type StatusDictionary = Record<string, Status[]>;
export function useStatuses(name = 'player') {
    const statuses = useState<Status[] | undefined>(`statuses-${name}`, () => []);
    // const statusesLists = computed(() => Object.keys(statusDictionary.value));

    // TODO: Remove this to somewhere else.
    if (!statuses.value?.length) {
        statuses.value = [{
            id: 'hearts-1',
            name: 'hearts-1',
        }];
    }

    return {
        statuses,
        // statusDictionary,
        // statusesLists,
    };
}
