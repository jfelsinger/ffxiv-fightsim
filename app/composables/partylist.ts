export type PartyMember = {
    name: string,

    class?: string, // probably a class abbreviaation

    hpPercent?: number,
    mpPercent?: number,
    shieldPercent?: number,
    castPercent?: number,

    enmityPercent?: number,
    hasEnmity?: boolean,
}

export type PartyList = {
    title?: string,
    members: PartyMember[],
}

export function usePartyList() {

    const partyList = useState<PartyList | undefined>('party-list', () => ({
        members: [],
    }));

    function reset() {
        // TODO: implement
    }

    return {
        reset,
    };
}
