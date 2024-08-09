export type SideSection =
    | ''
    | 'ui'
    | 'code'
    | 'info'

export function useSidebar() {
    const { isEditing } = useEditMode();

    const currentSideSection = useState<SideSection>('open-sidebar-section', () => '');

    function openSection(side: SideSection) {
        if (currentSideSection.value === side) {
            currentSideSection.value = '';
            isEditing.value = false;
        } else {
            if (side === 'ui') {
                isEditing.value = true;
            }

            currentSideSection.value = side;
        }

        return currentSideSection.value;
    }

    return {
        currentSideSection,
        openSection,
    }
}
