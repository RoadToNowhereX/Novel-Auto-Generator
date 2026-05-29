/**
 * 中文（简体）语言包 - 默认语言
 */
export default {
    // ========== 通用 ==========
    common: {
        confirm: '确认',
        cancel: '取消',
        ok: '确定',
        save: '保存',
        close: '关闭',
        reset: '重置',
        edit: '编辑',
        delete: '删除',
        copy: '复制',
        refresh: '刷新',
        preview: '预览',
        export: '导出',
        import: '导入',
        start: '开始',
        stop: '停止',
        pause: '暂停',
        resume: '恢复',
        retry: '重试',
        apply: '应用',
        clear: '清除',
        search: '查找',
        replace: '替换',
        yes: '是',
        no: '否',
        unknown: '未知',
        all: '全部',
        none: '无',
        loading: '加载中...',
        processing: '处理中...',
        success: '成功',
        failed: '失败',
        enabled: '已启用',
        disabled: '已禁用',
    },

    // ========== 错误 ==========
    errors: {
        userAborted: '用户中止操作',
        unknown: '未知错误',
        operationCancelled: '操作已取消',
        network: '网络连接失败，请检查网络设置',
        networkError: '网络错误',
        requestTimeout: '请求超时',
        tokenLimit: 'AI 响应超过 Token 限制',

        // HTTP 状态码
        http: {
            400: '请求格式错误',
            401: '未授权，请检查 API Key',
            403: '访问被拒绝',
            404: '请求的资源不存在',
            408: '请求超时',
            429: '请求过于频繁，请降低速度',
            500: '服务器内部错误',
            502: '网关错误',
            503: '服务不可用，请稍后重试',
            504: '网关超时',
            529: '服务过载，请稍后重试',
        },

        apiError: 'API 错误 ({status})',
    },

    // ========== 模态框 ==========
    modal: {
        error: '❌ 错误',
        confirmTitle: '确认',
        promptTitle: '输入',
        close: '关闭',
    },

    // ========== 状态 ==========
    status: {
        idle: '空闲',
        running: '运行中',
        paused: '已暂停',
        stopped: '已停止',
        repairing: '修复中',
        rerolling: '重Roll中',
    },

    // ========== 帮助文档 ==========
    help: {
        title: '❓ TXT 转世界书帮助',
        sections: {
            basic: {
                title: '📌 基本功能',
                items: [
                    '将 TXT 小说转换为 SillyTavern 世界书格式',
                    '自动检测文件编码（UTF-8 / GBK / GB2312 / GB18030 / Big5）',
                    '基于正则的<strong>章回自动检测</strong>和智能分块（支持自定义正则、快速预设、重新分块）',
                    '支持<strong>并行/串行</strong>处理，并行支持独立模式和分批模式，可配置并发数',
                    '分批并行模式下<strong>批次间自动同步世界书摘要</strong>，减少跨批次重复条目',
                    '<strong>增量输出</strong>：只输出变更条目，减少重复',
                    '<strong>分卷模式</strong>：上下文超限时自动分卷',
                    '<strong>自动断点续传</strong>：处理期间每 60 秒自动保存，浏览器崩溃/刷新后可恢复',
                    '<strong>ETA 预估</strong>：根据最近章节处理速度实时预估剩余时间',
                ],
            },
        },
        gotIt: '我知道了',
    },

    // ========== 渲染器标签 ==========
    renderer: {
        // 世界书条目
        entry: {
            keywords: '🔑 关键词',
            content: '📝 内容',
            configTitle: '配置位置/深度/顺序',
            rerollTitle: '单独重 Roll 此条目',
            newMergedBadge: '✨ 新合并',
            builtinTag: '(内置)',
            depthPrefix: 'D',
            orderPrefix: 'O',
        },
        // 分类
        category: {
            entriesLabel: '条目',
        },
        // 汇总
        summary: {
            total: '共 {categoryCount} 个分类, {totalEntries} 个条目 | 总计 ~{totalTokens} tk',
            belowThreshold: ' | ⚠️ {count} 个条目低于 {threshold} tk',
        },
        // 处理状态图标
        status: {
            processing: '⏳',
            failed: '❌',
            processed: '✅',
            waiting: '⏳',
        },
    },

    // ========== 设置面板 ==========
    settings: {
        title: '📚 TXT 转世界书',
        sections: {
            api: '🔌 API 配置',
            prompt: '📝 提示词配置',
            categories: '🏷️ 提取分类',
            defaultEntries: '📚 默认世界书条目',
            upload: '📤 文件上传',
            queue: '📋 章节队列',
            progress: '⏳ 处理进度',
            result: '✨ 生成结果',
        },
    },

    // ========== 进度 ==========
    progress: {
        eta: '约 {min} 分 {sec} 秒',
        etaMinutes: '约 {min} 分钟',
        etaSeconds: '约 {sec} 秒',
        parallel: '🚀 并行处理中 ({done}/{total})',
        parallelCompleted: '📦 并行处理完成，成功: {success}/{total}',
        parallelStart: '🚀 并行处理 {count} 个记忆块 (并发: {concurrency})',
    },

    // ========== 处理日志 ==========
    processing: {
        chapterStart: '🔄 [第 {chapter} 章] 开始处理: {title}',
        chapterCompleted: '✅ [第 {chapter} 章] 处理完成',
        chapterError: '❌ [第 {chapter} 章] 错误: {message}',
        chapterRetry: '🔄 [第 {chapter} 章] {delay} 秒后重试...',
        debugApiCall: '[第 {chapter} 章] 调用 API...',
        debugParsing: '[第 {chapter} 章] 解析 AI 响应...',
        debugTokenLimit: '[第 {chapter} 章] 检查 Token 限制...',
        debugPostProcess: '[第 {chapter} 章] 后处理章节索引...',
    },
};
