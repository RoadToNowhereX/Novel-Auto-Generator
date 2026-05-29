/**
 * English (US) locale
 */
export default {
    // ========== Common ==========
    common: {
        confirm: 'Confirm',
        cancel: 'Cancel',
        ok: 'OK',
        save: 'Save',
        close: 'Close',
        reset: 'Reset',
        edit: 'Edit',
        delete: 'Delete',
        copy: 'Copy',
        refresh: 'Refresh',
        preview: 'Preview',
        export: 'Export',
        import: 'Import',
        start: 'Start',
        stop: 'Stop',
        pause: 'Pause',
        resume: 'Resume',
        retry: 'Retry',
        apply: 'Apply',
        clear: 'Clear',
        search: 'Search',
        replace: 'Replace',
        yes: 'Yes',
        no: 'No',
        unknown: 'Unknown',
        all: 'All',
        none: 'None',
        loading: 'Loading...',
        processing: 'Processing...',
        success: 'Success',
        failed: 'Failed',
        enabled: 'Enabled',
        disabled: 'Disabled',
    },

    // ========== Errors ==========
    errors: {
        userAborted: 'Operation aborted by user',
        unknown: 'Unknown error',
        operationCancelled: 'Operation cancelled',
        network: 'Network connection failed. Please check your network settings.',
        networkError: 'Network error',
        requestTimeout: 'Request timed out',
        tokenLimit: 'AI response exceeded token limit',

        http: {
            400: 'Bad request',
            401: 'Unauthorized. Please check API key.',
            403: 'Access denied',
            404: 'Resource not found',
            408: 'Request timeout',
            429: 'Rate limited. Please slow down.',
            500: 'Server internal error',
            502: 'Gateway error',
            503: 'Service unavailable. Please try again later.',
            504: 'Gateway timeout',
            529: 'Service overloaded. Please try again later.',
        },

        apiError: 'API error ({status})',
    },

    // ========== Modal ==========
    modal: {
        error: '❌ Error',
        confirmTitle: 'Confirm',
        promptTitle: 'Input',
        close: 'Close',
    },

    // ========== Status ==========
    status: {
        idle: 'Idle',
        running: 'Running',
        paused: 'Paused',
        stopped: 'Stopped',
        repairing: 'Repairing',
        rerolling: 'Rerolling',
    },

    // ========== Help Documentation ==========
    help: {
        title: '❓ TXT to Worldbook Help',
        sections: {
            basic: {
                title: '📌 Basic Features',
                items: [
                    'Convert TXT novels into SillyTavern Worldbook format',
                    'Auto-detect file encoding (UTF-8 / GBK / GB2312 / GB18030 / Big5)',
                    'Regex-based <strong>auto chapter detection</strong> and smart chunking (custom regex, presets, re-chunking)',
                    'Supports <strong>parallel/serial</strong> processing, parallel supports independent and batched modes with configurable concurrency',
                    'In batched parallel mode, <strong>syncs Worldbook summary between batches</strong> to reduce cross-batch duplicates',
                    '<strong>Incremental output</strong>: Only outputs changed entries, reducing redundancy',
                    '<strong>Volume mode</strong>: Auto-splits when context exceeds limits',
                    '<strong>Auto checkpoint resume</strong>: Saves every 60s, recovers after browser crash/refresh',
                    '<strong>ETA estimate</strong>: Real-time remaining time estimate based on recent chapter speed',
                ],
            },
        },
        gotIt: 'Got it',
    },

    // ========== Renderer Labels ==========
    renderer: {
        entry: {
            keywords: '🔑 Keywords',
            content: '📝 Content',
            configTitle: 'Configure Position/Depth/Order',
            rerollTitle: 'Individually Reroll this entry',
            newMergedBadge: '✨ Newly Merged',
            builtinTag: '(built-in)',
            depthPrefix: 'D',
            orderPrefix: 'O',
        },
        category: {
            entriesLabel: 'entries',
        },
        summary: {
            total: '{categoryCount} categories, {totalEntries} entries | Total ~{totalTokens} tk',
            belowThreshold: ' | ⚠️ {count} entries below {threshold} tk',
        },
        status: {
            processing: '⏳',
            failed: '❌',
            processed: '✅',
            waiting: '⏳',
        },
    },

    // ========== Settings Panel ==========
    settings: {
        title: '📚 TXT to Worldbook',
        sections: {
            api: '🔌 API Configuration',
            prompt: '📝 Prompt Configuration',
            categories: '🏷️ Extraction Categories',
            defaultEntries: '📚 Default Worldbook Entries',
            upload: '📤 File Upload',
            queue: '📋 Chapter Queue',
            progress: '⏳ Processing Progress',
            result: '✨ Generated Result',
        },
    },

    // ========== Progress ==========
    progress: {
        eta: '~{min}m {sec}s',
        etaMinutes: '~{min} min',
        etaSeconds: '~{sec}s',
        parallel: '🚀 Parallel processing ({done}/{total})',
        parallelCompleted: '📦 Parallel processing complete, success: {success}/{total}',
        parallelStart: '🚀 Parallel processing {count} memory chunks (concurrency: {concurrency})',
    },

    // ========== Processing Log ==========
    processing: {
        chapterStart: '🔄 [Ch. {chapter}] Starting: {title}',
        chapterCompleted: '✅ [Ch. {chapter}] Completed',
        chapterError: '❌ [Ch. {chapter}] Error: {message}',
        chapterRetry: '🔄 [Ch. {chapter}] Retrying in {delay}s...',
        debugApiCall: '[Ch. {chapter}] Calling API...',
        debugParsing: '[Ch. {chapter}] Parsing AI response...',
        debugTokenLimit: '[Ch. {chapter}] Checking token limit...',
        debugPostProcess: '[Ch. {chapter}] Post-processing chapter index...',
    },
};
