export function useTutorialMode() {
    const isTutorial = useState('tutorial-mode', () => false);
    function toggleTutorialMode() {
        isTutorial.value = !isTutorial.value;
    }

    return {
        isTutorial,
        toggleTutorialMode,
    };
}
