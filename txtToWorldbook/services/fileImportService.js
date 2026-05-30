export function createFileImportService(deps = {}) {
    const {
        AppState,
        MemoryHistoryDB,
        Logger,
        ErrorHandler,
        confirmAction,
        fileUtils,
        updateMemoryQueueUI,
        updateStartButtonState,
        showQueueSection,
        showProgressSection,
        showResultSection,
        updateWorldbookPreview,
        applyDefaultWorldbookEntries,
        saveCurrentSettings,
    } = deps;

    async function handleFileSelect(file) {
        if (!file.name.endsWith('.txt')) {
            ErrorHandler.showUserError('请选择TXT文件');
            return;
        }

        const maxFileSize = 100 * 1024 * 1024;
        if (file.size > maxFileSize) {
            ErrorHandler.showUserError(`文件过大（${(file.size / 1024 / 1024).toFixed(1)} MB），最大支持 100 MB`);
            return;
        }

        try {
            const { encoding, content } = await fileUtils.detectBestEncoding(file);
            AppState.file.current = file;

            const newHash = await fileUtils.calculateFileHash(content);
            const savedHash = await MemoryHistoryDB.getSavedFileHash();
            if (savedHash && savedHash !== newHash) {
                const historyList = await MemoryHistoryDB.getAllHistory();
                if (
                    historyList.length > 0
                    && await confirmAction(`检测到新文件，是否清空旧历史？\n当前有 ${historyList.length} 条记录。`, {
                        title: '清空旧历史',
                        danger: true,
                    })
                ) {
                    await MemoryHistoryDB.clearAllHistory();
                    await MemoryHistoryDB.clearAllRolls();
                    await MemoryHistoryDB.clearState();
                }
            }

            AppState.file.hash = newHash;
            await MemoryHistoryDB.saveFileHash(newHash);

            document.getElementById('ttw-upload-area').style.display = 'none';
            document.getElementById('ttw-file-info').style.display = 'flex';
            document.getElementById('ttw-file-name').textContent = file.name;
            document.getElementById('ttw-file-size').textContent = `(${(content.length / 1024).toFixed(1)} KB, ${encoding})`;

            AppState.file.novelName = file.name.replace(/\.[^/.]+$/, '');

            const novelNameInput = document.getElementById('ttw-novel-name-input');
            if (novelNameInput) novelNameInput.value = AppState.file.novelName;
            const novelNameRow = document.getElementById('ttw-novel-name-row');
            if (novelNameRow) novelNameRow.style.display = 'flex';

            splitContentIntoMemory(content);
            showQueueSection(true);
            updateMemoryQueueUI();

            document.getElementById('ttw-start-btn').disabled = false;
            AppState.memory.startIndex = 0;
            AppState.memory.userSelectedIndex = null;

            AppState.worldbook.generated = { 地图环境: {}, 剧情节点: {}, 角色: {}, 知识书: {} };
            applyDefaultWorldbookEntries();
            if (Object.keys(AppState.worldbook.generated).length > 0) {
                showResultSection(true);
                updateWorldbookPreview();
            }

            updateStartButtonState(false);
        } catch (error) {
            ErrorHandler.showUserError('文件处理失败: ' + error.message);
        }
    }

    function isChapterRegexEnabled() {
        return AppState.config.chapterRegex?.useCustomRegex !== false;
    }

    function collectChapterMatches(content) {
        if (!isChapterRegexEnabled()) return [];

        const pattern = AppState.config.chapterRegex?.pattern;
        if (!pattern) return [];

        try {
            const chapterRegex = new RegExp(pattern, 'g');
            const matches = [];
            const maxTime = 5000;
            const startTime = Date.now();
            let match;
            while ((match = chapterRegex.exec(content)) !== null) {
                matches.push({ title: match[0], index: match.index });
                if (Date.now() - startTime > maxTime) {
                    Logger.warn('FileImport', '章节正则匹配超时(5秒)，已中断');
                    break;
                }
                if (match[0].length === 0) chapterRegex.lastIndex++;
            }
            return matches;
        } catch (error) {
            Logger.error('FileImport', '章节正则表达式错误:', error);
            return [];
        }
    }

    function findNaturalSplitPoint(text, maxLength) {
        let endPos = Math.min(maxLength, text.length);
        if (endPos < text.length) {
            const paragraphBreak = text.lastIndexOf('\n\n', endPos);
            if (paragraphBreak > endPos * 0.5) {
                endPos = paragraphBreak + 2;
            } else {
                const sentenceBreak = text.lastIndexOf('\u3002', endPos);
                if (sentenceBreak > endPos * 0.5) {
                    endPos = sentenceBreak + 1;
                }
            }
        }
        return endPos;
    }

    function pushContentAsChunks(content, baseTitle, chunkIndex, chunkSize) {
        if (content.length <= chunkSize) {
            AppState.memory.queue.push(createMemoryChunk(content, chunkIndex, baseTitle));
            return chunkIndex + 1;
        }

        let remaining = content;
        let partIndex = 1;
        while (remaining.length > 0) {
            const endPos = findNaturalSplitPoint(remaining, chunkSize);
            const title = baseTitle ? `${baseTitle}-${partIndex}` : undefined;
            AppState.memory.queue.push(createMemoryChunk(remaining.slice(0, endPos), chunkIndex, title));
            remaining = remaining.slice(endPos);
            chunkIndex++;
            partIndex++;
        }

        return chunkIndex;
    }

    function splitPlainContentIntoMemory(content, chunkSize, minChunkSize) {
        let offset = 0;
        let chunkIndex = 1;

        while (offset < content.length) {
            const endOffset = offset + findNaturalSplitPoint(content.slice(offset), chunkSize);
            AppState.memory.queue.push(createMemoryChunk(content.slice(offset, endOffset), chunkIndex));
            offset = endOffset;
            chunkIndex++;
        }

        for (let i = AppState.memory.queue.length - 1; i > 0; i--) {
            if (AppState.memory.queue[i].content.length < minChunkSize) {
                const prevMemory = AppState.memory.queue[i - 1];
                if (prevMemory.content.length + AppState.memory.queue[i].content.length <= chunkSize * 1.2) {
                    prevMemory.content += AppState.memory.queue[i].content;
                    AppState.memory.queue.splice(i, 1);
                }
            }
        }

        AppState.memory.queue.forEach((memory, index) => {
            memory.title = `记忆${index + 1}`;
        });
    }

    function splitContentIntoMemory(content) {
        const chunkSize = AppState.settings.chunkSize;
        const minChunkSize = Math.max(chunkSize * 0.3, 5000);
        AppState.memory.queue = [];

        const matches = collectChapterMatches(content);
        if (matches.length > 0) {
            let chunkIndex = 1;

            for (let i = 0; i < matches.length; i++) {
                const startIndex = matches[i].index;
                const endIndex = i < matches.length - 1 ? matches[i + 1].index : content.length;
                const preContent = i === 0 && startIndex > 0 ? content.slice(0, startIndex) : '';
                const chapterContent = preContent + content.slice(startIndex, endIndex);
                chunkIndex = pushContentAsChunks(chapterContent, matches[i].title, chunkIndex, chunkSize);
            }

            return;
        }

        splitPlainContentIntoMemory(content, chunkSize, minChunkSize);
    }

    async function handleClearFile() {
        AppState.file.current = null;
        AppState.file.novelName = '';
        AppState.memory.queue = [];
        AppState.worldbook.generated = {};
        AppState.worldbook.volumes = [];
        AppState.worldbook.currentVolumeIndex = 0;
        AppState.memory.startIndex = 0;
        AppState.memory.userSelectedIndex = null;
        AppState.file.hash = null;
        AppState.ui.isMultiSelectMode = false;
        AppState.ui.selectedIndices.clear();

        try {
            await MemoryHistoryDB.clearAllHistory();
            await MemoryHistoryDB.clearAllRolls();
            await MemoryHistoryDB.clearState();
            await MemoryHistoryDB.clearFileHash();
            Logger.info('History', '已清空所有历史记录');
        } catch (error) {
            Logger.error('History', '清空历史失败:', error);
        }

        document.getElementById('ttw-upload-area').style.display = 'block';
        document.getElementById('ttw-file-info').style.display = 'none';
        document.getElementById('ttw-file-input').value = '';

        const novelNameRow = document.getElementById('ttw-novel-name-row');
        if (novelNameRow) novelNameRow.style.display = 'none';
        const novelNameInput = document.getElementById('ttw-novel-name-input');
        if (novelNameInput) novelNameInput.value = '';

        document.getElementById('ttw-start-btn').disabled = true;
        document.getElementById('ttw-start-btn').textContent = '🚀 开始转换';

        showQueueSection(false);
        showProgressSection(false);
        showResultSection(false);
    }

    async function rechunkMemories() {
        if (AppState.memory.queue.length === 0) {
            ErrorHandler.showUserError('没有可重新分块的内容');
            return;
        }

        const processedCount = AppState.memory.queue.filter((m) => m.processed && !m.failed).length;
        if (processedCount > 0) {
            const confirmMsg = `⚠️ 警告：当前有 ${processedCount} 个已处理的章节。\n\n重新分块将会：\n1. 清除所有已处理状态\n2. 需要重新从头开始转换\n3. 但不会清除已生成的世界书数据\n\n确定要重新分块吗？`;
            if (!await confirmAction(confirmMsg, { title: '重新分块', danger: true })) {
                return;
            }
        }

        if (typeof saveCurrentSettings === 'function') {
            saveCurrentSettings();
        }

        const allContent = AppState.memory.queue.map((m) => m.content).join('');
        splitContentIntoMemory(allContent);

        AppState.memory.startIndex = 0;
        AppState.memory.userSelectedIndex = null;

        updateMemoryQueueUI();
        updateStartButtonState(false);

        ErrorHandler.showUserSuccess(`重新分块完成！\n当前共 ${AppState.memory.queue.length} 个章节`);
    }

    function createMemoryChunk(content, chunkIndex, title) {
        return {
            title: title || `记忆${chunkIndex}`,
            content,
            processed: false,
            failed: false,
            processing: false,
        };
    }

    return {
        handleFileSelect,
        splitContentIntoMemory,
        handleClearFile,
        rechunkMemories,
    };
}
