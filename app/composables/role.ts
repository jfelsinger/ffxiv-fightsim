import { useStorage } from '@vueuse/core';

export function useRole() {
    const playerRole = useStorage<Role>('player-role', 'mt');
    const roleType = computed(() => (getRoleType(playerRole.value as any) || 'tank') as RoleType);
    return {
        role: playerRole,
        roleType,
    }
}
