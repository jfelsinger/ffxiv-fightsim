export type RoleType =
    | 'tank'
    | 'healer'
    | 'dps';

export type Role =
    | 'mt' | 'ot'
    | 'h1' | 'h2'
    | 'm1' | 'm2'
    | 'r1' | 'r2';

export const standardPartyRoles = [
    'mt',
    'ot',
    'h1',
    'h2',
    'm1',
    'm2',
    'r1',
    'r2',
] as const;

export function getRoleType(role: Role) {
    return {
        'mt': 'tank',
        'ot': 'tank',
        'h1': 'healer',
        'h2': 'healer',
        'm1': 'dps',
        'm2': 'dps',
        'r1': 'dps',
        'r2': 'dps',
    }[role];
}

export function getOtherRoles(role: Role, party?: Role[]) {
    party = (party || standardPartyRoles.slice());
    const pos = party.indexOf(role);
    if (pos !== -1) {
        party.splice(pos, 1);
    }

    return party;
}

export function isSupportRole(role: Role | RoleType) {
    return ({
        'mt': true,
        'ot': true,
        'h1': true,
        'h2': true,
        'tank': true,
        'healer': true,
    } as Partial<Record<RoleType | Role, boolean>>)[role] || false;
}
