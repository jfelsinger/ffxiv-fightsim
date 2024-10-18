import { useStorage } from '@vueuse/core';
export type RoleType =
    | 'mt' | 'ot'
    | 'h1' | 'h2'
    | 'm1' | 'm2'
    | 'r1' | 'r2';

export function useRole() {
    const playerRole = useStorage<RoleType>('player-role', 'mt');
    const roleType = computed(() => ({
        'mt': 'tank',
        'ot': 'tank',
        'h1': 'healer',
        'h2': 'healer',
        'm1': 'dps',
        'm2': 'dps',
        'r1': 'dps',
        'r2': 'dps',
    })[playerRole.value]);
    return {
        role: playerRole,
        roleType,
    }
}
