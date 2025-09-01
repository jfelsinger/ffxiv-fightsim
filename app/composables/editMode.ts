export function useEditMode() {
    const isEditing = useState('ui-edit-mode', () => false);
    function toggleEditMode() {
        isEditing.value = !isEditing.value;
    }

    return {
        isEditing,
        toggleEditMode,
    };
}
