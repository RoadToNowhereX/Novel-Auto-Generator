export function createMemoryQueueActionsService(deps = {}) {
    const {
        AppState,
        MemoryHistoryDB,
        ErrorHandler,
        confirmAction,
        updateMemoryQueueUI,
        updateStartButtonState,
        showQueueSection,
    } = deps;

    function normalizeUntitledMemories() {
        AppState.memory.queue.forEach((memory, index) => {
            if (!memory.title.includes('-')) {
                memory.title = `记忆${index + 1}`;
            }
        });
    }

    function syncQueueSelectionAfterDelete(index) {
        if (AppState.memory.startIndex > index) {
            AppState.memory.startIndex = Math.max(0, AppState.memory.startIndex - 1);
        } else if (AppState.memory.startIndex >= AppState.memory.queue.length) {
            AppState.memory.startIndex = Math.max(0, AppState.memory.queue.length - 1);
        }

        if (AppState.memory.userSelectedIndex !== null) {
            if (AppState.memory.userSelectedIndex > index) {
                AppState.memory.userSelectedIndex = Math.max(0, AppState.memory.userSelectedIndex - 1);
            } else if (AppState.memory.userSelectedIndex >= AppState.memory.queue.length) {
                AppState.memory.userSelectedIndex = null;
            }
        }
    }

    function syncSelectedIndicesAfterInsert(insertIndex) {
        if (!AppState.ui.selectedIndices || AppState.ui.selectedIndices.size === 0) return;

        AppState.ui.selectedIndices = new Set(
            [...AppState.ui.selectedIndices].map((index) => index >= insertIndex ? index + 1 : index)
        );
    }

    function ensureManualQueueFileInfo() {
        if (AppState.file.current) return;

        if (!AppState.file.novelName) {
            AppState.file.novelName = '手动世界书';
        }

        const uploadArea = document.getElementById('ttw-upload-area');
        if (uploadArea) uploadArea.style.display = 'none';

        const fileInfo = document.getElementById('ttw-file-info');
        if (fileInfo) fileInfo.style.display = 'flex';

        const fileNameEl = document.getElementById('ttw-file-name');
        if (fileNameEl) fileNameEl.textContent = '手动添加的章节/记忆';

        const totalChars = AppState.memory.queue.reduce((sum, memory) => sum + (memory.content || '').length, 0);
        const fileSizeEl = document.getElementById('ttw-file-size');
        if (fileSizeEl) fileSizeEl.textContent = `(${(totalChars / 1024).toFixed(1)} KB, ${AppState.memory.queue.length}章)`;

        const novelNameRow = document.getElementById('ttw-novel-name-row');
        if (novelNameRow) novelNameRow.style.display = 'flex';

        const novelNameInput = document.getElementById('ttw-novel-name-input');
        if (novelNameInput) novelNameInput.value = AppState.file.novelName;
    }

    function normalizeInsertIndex(insertIndex) {
        const parsed = parseInt(insertIndex, 10);
        if (Number.isNaN(parsed)) return AppState.memory.queue.length;
        return Math.max(0, Math.min(parsed, AppState.memory.queue.length));
    }

    async function addManualMemory(options = {}) {
        if (AppState.processing.isRunning) {
            ErrorHandler.showUserError('处理中不能添加章节/记忆，请暂停或等待完成后再操作');
            return false;
        }

        const content = String(options.content || '');
        if (!content.trim()) {
            ErrorHandler.showUserError('请输入章节/记忆内容');
            return false;
        }

        const insertIndex = normalizeInsertIndex(options.insertIndex);
        const manualCount = AppState.memory.queue.filter((memory) => memory.manual).length + 1;
        const title = String(options.title || '').trim() || `手动记忆${manualCount}`;
        const memory = {
            title,
            content,
            processed: false,
            failed: false,
            processing: false,
            result: null,
            failedError: null,
            manual: true,
        };

        try {
            if (insertIndex < AppState.memory.queue.length && typeof MemoryHistoryDB?.shiftMemoryIndexesForInsert === 'function') {
                await MemoryHistoryDB.shiftMemoryIndexesForInsert(insertIndex);
            }

            AppState.memory.queue.splice(insertIndex, 0, memory);
            syncSelectedIndicesAfterInsert(insertIndex);
            AppState.memory.userSelectedIndex = null;
            const firstUnprocessed = AppState.memory.queue.findIndex((item) => !item.processed || item.failed);
            AppState.memory.startIndex = firstUnprocessed !== -1 ? firstUnprocessed : 0;

            if (typeof showQueueSection === 'function') {
                showQueueSection(true);
            }

            ensureManualQueueFileInfo();
            updateMemoryQueueUI();
            updateStartButtonState(false);
            ErrorHandler.showUserSuccess(`已添加 "${title}"`);
            return true;
        } catch (error) {
            ErrorHandler.showUserError('添加章节/记忆失败: ' + error.message);
            return false;
        }
    }

    function splitMemoryIntoTwo(memoryIndex) {
        const memory = AppState.memory.queue[memoryIndex];
        if (!memory) return null;

        const content = memory.content;
        const halfLength = Math.floor(content.length / 2);
        let splitPoint = halfLength;

        const paragraphBreak = content.indexOf('\n\n', halfLength);
        if (paragraphBreak !== -1 && paragraphBreak < halfLength + 5000) {
            splitPoint = paragraphBreak + 2;
        } else {
            const sentenceBreak = content.indexOf('。', halfLength);
            if (sentenceBreak !== -1 && sentenceBreak < halfLength + 1000) {
                splitPoint = sentenceBreak + 1;
            }
        }

        const content1 = content.substring(0, splitPoint);
        const content2 = content.substring(splitPoint);
        const originalTitle = memory.title;
        let baseName = originalTitle;
        let suffix1;
        let suffix2;

        const splitMatch = originalTitle.match(/^(.+)-(\d+)$/);
        if (splitMatch) {
            baseName = splitMatch[1];
            const currentNum = parseInt(splitMatch[2], 10);
            suffix1 = `-${currentNum}-1`;
            suffix2 = `-${currentNum}-2`;
        } else {
            suffix1 = '-1';
            suffix2 = '-2';
        }

        const memory1 = { title: baseName + suffix1, content: content1, processed: false, failed: false, failedError: null };
        const memory2 = { title: baseName + suffix2, content: content2, processed: false, failed: false, failedError: null };
        AppState.memory.queue.splice(memoryIndex, 1, memory1, memory2);
        return { part1: memory1, part2: memory2 };
    }

    async function deleteMemoryAt(index) {
        if (index < 0 || index >= AppState.memory.queue.length) return;
        const memory = AppState.memory.queue[index];

        if (!await confirmAction(`确定要删除 "${memory.title}" 吗？`, { title: '删除章节', danger: true })) {
            return;
        }

        AppState.memory.queue.splice(index, 1);
        normalizeUntitledMemories();
        syncQueueSelectionAfterDelete(index);
        updateMemoryQueueUI();
        updateStartButtonState(false);
    }

    async function deleteSelectedMemories() {
        if (AppState.ui.selectedIndices.size === 0) {
            ErrorHandler.showUserError('请先选择要删除的章节');
            return;
        }

        const hasProcessed = [...AppState.ui.selectedIndices].some((index) => AppState.memory.queue[index]?.processed && !AppState.memory.queue[index]?.failed);
        let confirmMsg = `确定要删除选中的 ${AppState.ui.selectedIndices.size} 个章节吗？`;
        if (hasProcessed) {
            confirmMsg += '\n\n⚠️ 警告：选中的章节中包含已处理的章节，删除后相关的世界书数据不会自动更新！';
        }

        if (!await confirmAction(confirmMsg, { title: '批量删除章节', danger: true })) {
            return;
        }

        const sortedIndices = [...AppState.ui.selectedIndices].sort((a, b) => b - a);
        for (const index of sortedIndices) {
            AppState.memory.queue.splice(index, 1);
        }

        normalizeUntitledMemories();
        AppState.memory.startIndex = Math.min(AppState.memory.startIndex, Math.max(0, AppState.memory.queue.length - 1));
        if (AppState.memory.userSelectedIndex !== null) {
            AppState.memory.userSelectedIndex = Math.min(AppState.memory.userSelectedIndex, Math.max(0, AppState.memory.queue.length - 1));
        }

        AppState.ui.selectedIndices.clear();
        AppState.ui.isMultiSelectMode = false;

        updateMemoryQueueUI();
        updateStartButtonState(false);
    }

    return {
        addManualMemory,
        splitMemoryIntoTwo,
        deleteMemoryAt,
        deleteSelectedMemories,
    };
}
