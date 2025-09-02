export function useTutorialMode() {
    const isTutorial = useState<boolean>('tutorial-mode', () => false);
    function toggleTutorialMode() {
        isTutorial.value = !isTutorial.value;
    }

    const tutorialStep = useState<number>('tutorial-step', () => 0);
    const isTutorialVisible = useState<boolean>('is-tutorial-visible', () => false);
    const canContinueTutorial = useState<boolean>('can-continue-tutorial', () => true);

    function showTutorialStep(step: number, force = false) {
        console.log('showTutorialStep', { step, force, isTutorial: isTutorial.value, isVisible: isTutorialVisible.value });
        if (isTutorial || force) {
            if (!isTutorial?.value && force) {
                isTutorial.value = true;
            }

            if ((window as any).__worldClock) {
                (window as any).__worldClock?.pause();
            }
            tutorialStep.value = step;
            isTutorialVisible.value = true;
        }
    }

    return {
        isTutorial,
        isTutorialVisible,
        canContinueTutorial,
        toggleTutorialMode,
        tutorialStep,
        showTutorialStep,
    };
}
