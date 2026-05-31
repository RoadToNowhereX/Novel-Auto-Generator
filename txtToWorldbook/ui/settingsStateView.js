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

        const chapterMinCharsEl = document.getElementById('ttw-chapter-min-chars');
        if (chapterMinCharsEl) {
            chapterMinCharsEl.value = AppState.settings.chapterMinChars ?? 0;
        }
        const chapterMergeRatioEl = document.getElementById('ttw-chapter-merge-ratio');
        if (chapterMergeRatioEl) {
            chapterMergeRatioEl.value = Math.round((AppState.settings.chapterMergeRatio ?? 1.2) * 100);
        }
    }

    return {
        updateSettingsUI,
        updateChapterRegexUI,
    };
}
