// 小说创作工作室 - 主入口文件
import { storage } from './storage.js';
import { IdeaManager } from './idea-manager.js';
import { BookAnalyzer } from './book-analyzer.js';
import { NovelComposer } from './novel-composer.js';
import { Workspace } from './workspace.js';
import { AIAssistant } from './ai-assistant.js';
import { showToast, showConfirm } from './ui-utils.js';

class NovelWriterApp {
    constructor() {
        this.currentModule = 'workspace';
        this.modules = {};
        this.aiAssistant = null;
        this.init();
    }

    async init() {
        console.log('小说创作工作室启动中...');

        // 等待数据库初始化
        await storage.initDB();

        // 初始化各个模块
        this.modules.workspace = new Workspace();
        this.modules.ideaManager = new IdeaManager();
        this.modules.bookAnalyzer = new BookAnalyzer();
        this.modules.novelComposer = new NovelComposer();
        this.aiAssistant = new AIAssistant();

        // 绑定事件
        this.bindNavigationEvents();
        this.bindPanelEvents();
        this.bindSettingsEvents();

        // 加载设置
        this.loadSettings();

        console.log('小说创作工作室已就绪！');
    }

    bindNavigationEvents() {
        // 导航切换
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const module = item.dataset.module;
                this.switchModule(module);

                // 更新激活状态
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    switchModule(moduleName) {
        // 隐藏所有模块
        const modules = document.querySelectorAll('.module');
        modules.forEach(module => module.classList.remove('active'));

        // 显示目标模块
        const targetModule = document.getElementById(`${moduleName}-module`);
        if (targetModule) {
            targetModule.classList.add('active');
            this.currentModule = moduleName;

            // 刷新模块数据
            if (this.modules[moduleName]?.render) {
                this.modules[moduleName].render();
            }
        }
    }

    bindPanelEvents() {
        // AI 助手面板
        const aiToggle = document.getElementById('ai-toggle');
        const aiPanel = document.getElementById('ai-panel');
        const closeAi = document.getElementById('close-ai');
        const app = document.getElementById('app');

        aiToggle?.addEventListener('click', () => {
            this.togglePanel(aiPanel, 'ai');
        });

        closeAi?.addEventListener('click', () => {
            this.closePanel(aiPanel);
        });

        // 设置面板
        const settingsToggle = document.getElementById('settings-toggle');
        const settingsPanel = document.getElementById('settings-panel');
        const closeSettings = document.getElementById('close-settings');

        settingsToggle?.addEventListener('click', () => {
            this.togglePanel(settingsPanel, 'settings');
        });

        closeSettings?.addEventListener('click', () => {
            this.closePanel(settingsPanel);
        });
    }

    togglePanel(panel, type) {
        const app = document.getElementById('app');
        const aiPanel = document.getElementById('ai-panel');
        const settingsPanel = document.getElementById('settings-panel');

        if (panel.classList.contains('hidden')) {
            // 关闭其他面板
            aiPanel?.classList.add('hidden');
            settingsPanel?.classList.add('hidden');

            // 打开目标面板
            panel.classList.remove('hidden');
            app.classList.add('panel-open');
        } else {
            this.closePanel(panel);
        }
    }

    closePanel(panel) {
        const app = document.getElementById('app');
        panel.classList.add('hidden');
        app.classList.remove('panel-open');
    }

    bindSettingsEvents() {
        // 导出数据
        document.getElementById('export-data')?.addEventListener('click', async () => {
            try {
                const data = await storage.exportData();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = `novel-writer-backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click();

                URL.revokeObjectURL(url);
                showToast('数据导出成功', 'success');
            } catch (error) {
                console.error('Export error:', error);
                showToast('导出失败', 'error');
            }
        });

        // 导入数据
        document.getElementById('import-data')?.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json';

            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                try {
                    const text = await file.text();
                    const data = JSON.parse(text);

                    showConfirm('导入数据将覆盖现有所有数据，确定继续吗？', async () => {
                        try {
                            await storage.importData(data);
                            showToast('数据导入成功', 'success');

                            // 刷新当前模块
                            if (this.modules[this.currentModule]?.render) {
                                this.modules[this.currentModule].render();
                            }
                            if (this.modules.workspace?.render) {
                                this.modules.workspace.render();
                            }
                        } catch (error) {
                            console.error('Import error:', error);
                            showToast('导入失败：' + error.message, 'error');
                        }
                    });
                } catch (error) {
                    console.error('Parse error:', error);
                    showToast('文件格式错误', 'error');
                }
            };

            input.click();
        });

        // 清空数据
        document.getElementById('clear-data')?.addEventListener('click', () => {
            showConfirm('确定要清空所有数据吗？此操作不可恢复！', async () => {
                try {
                    await storage.clearAll();
                    localStorage.clear();
                    showToast('数据已清空', 'success');

                    // 刷新页面
                    setTimeout(() => location.reload(), 1000);
                } catch (error) {
                    console.error('Clear error:', error);
                    showToast('清空失败', 'error');
                }
            });
        });

        // 自动保存设置
        document.getElementById('auto-save')?.addEventListener('change', (e) => {
            const settings = storage.getSettings();
            settings.autoSave = e.target.checked;
            storage.saveSettings(settings);
            showToast(e.target.checked ? '已启用自动保存' : '已关闭自动保存', 'info');
        });

        // 字体大小设置
        const fontSizeInput = document.getElementById('font-size');
        const fontSizeValue = document.getElementById('font-size-value');

        fontSizeInput?.addEventListener('input', (e) => {
            const size = e.target.value;
            fontSizeValue.textContent = size + 'px';

            const settings = storage.getSettings();
            settings.fontSize = parseInt(size);
            storage.saveSettings(settings);

            // 应用字体大小
            document.documentElement.style.setProperty('--editor-font-size', size + 'px');
        });
    }

    loadSettings() {
        const settings = storage.getSettings();

        // 应用设置
        const autoSaveCheckbox = document.getElementById('auto-save');
        if (autoSaveCheckbox) {
            autoSaveCheckbox.checked = settings.autoSave;
        }

        const fontSizeInput = document.getElementById('font-size');
        const fontSizeValue = document.getElementById('font-size-value');
        if (fontSizeInput && fontSizeValue) {
            fontSizeInput.value = settings.fontSize;
            fontSizeValue.textContent = settings.fontSize + 'px';
            document.documentElement.style.setProperty('--editor-font-size', settings.fontSize + 'px');
        }
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    window.novelWriterApp = new NovelWriterApp();
});

// 防止意外关闭
window.addEventListener('beforeunload', (e) => {
    const hasUnsavedChanges = false; // 可以根据实际情况判断
    if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
    }
});
