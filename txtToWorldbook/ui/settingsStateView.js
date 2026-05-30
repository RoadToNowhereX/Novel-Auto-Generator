import { hydrateSettingsFromState } from './settingsPanel.js';

export function createSettingsStateView(deps = {}) {
    const {
        AppState,
        handleUseTavernApiChange,
        handleProviderChange,
        renderMessageChainUI,
    } = deps;

    function updateSettingsUI() {
        hydrateSettingsFromState({
            AppState,
            handleUseTavernApiChange,
            handleProviderChange,
            renderMessageChainUI,
        });
    }

    function updateChapterRegexUI() {
        const regexInput = document.getElementById('ttw-chapter-regex');
        if (regexInput) {
            regexInput.value = AppState.config.chapterRegex.pattern;
        }

        const useRegexInput = document.getElementById('ttw-use-chapter-regex');
        if (useRegexInput) {
            useRegexInput.checked = AppState.config.chapterRegex.useCustomRegex !== false;
        }
    }

    return {
        updateSettingsUI,
        updateChapterRegexUI,
    };
}
