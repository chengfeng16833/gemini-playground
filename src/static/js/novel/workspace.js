// 工作区模块
import { storage } from './storage.js';

export class Workspace {
    constructor() {
        this.init();
    }

    async init() {
        await this.render();
        // 每5秒更新一次统计数据
        setInterval(() => this.updateStats(), 5000);
    }

    async render() {
        await this.updateStats();
        await this.updateRecentItems();
    }

    async updateStats() {
        const stats = await storage.getStats();

        // 更新统计卡片
        const ideaCount = document.getElementById('idea-count');
        const analysisCount = document.getElementById('analysis-count');
        const novelCount = document.getElementById('novel-count');
        const todayWords = document.getElementById('today-words');

        if (ideaCount) ideaCount.textContent = stats.ideaCount;
        if (analysisCount) analysisCount.textContent = stats.analysisCount;
        if (novelCount) novelCount.textContent = stats.novelCount;
        if (todayWords) todayWords.textContent = stats.todayWords;
    }

    async updateRecentItems() {
        const recentItems = await storage.getRecentItems(10);
        const container = document.getElementById('recent-items');

        if (!container) return;

        if (recentItems.length === 0) {
            container.innerHTML = '<p class="empty-message">暂无最近编辑的内容</p>';
            return;
        }

        const typeNames = {
            'idea': '创意',
            'analysis': '分析',
            'novel': '小说'
        };

        const typeIcons = {
            'idea': 'lightbulb',
            'analysis': 'auto_stories',
            'novel': 'edit_note'
        };

        container.innerHTML = recentItems.map(item => {
            const date = new Date(item.updatedAt);
            const timeAgo = this.getTimeAgo(date);

            return `
                <div class="recent-item" data-type="${item.type}" data-id="${item.id}">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span class="material-symbols-outlined" style="color: var(--primary-color);">
                            ${typeIcons[item.type]}
                        </span>
                        <div style="flex: 1;">
                            <div class="recent-item-title">
                                ${this.escapeHtml(item.title || item.bookTitle)}
                            </div>
                            <div class="recent-item-meta">
                                ${typeNames[item.type]} · ${timeAgo}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // 绑定点击事件
        recentItems.forEach(item => {
            const element = container.querySelector(`[data-type="${item.type}"][data-id="${item.id}"]`);
            element?.addEventListener('click', () => {
                this.openItem(item);
            });
        });
    }

    openItem(item) {
        // 根据类型切换到相应模块
        const moduleMap = {
            'idea': 'idea-manager',
            'analysis': 'book-analyzer',
            'novel': 'novel-composer'
        };

        const moduleName = moduleMap[item.type];
        if (moduleName) {
            // 触发导航切换
            const navItem = document.querySelector(`[data-module="${moduleName}"]`);
            if (navItem) {
                navItem.click();
            }
        }
    }

    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 7) return `${days}天前`;

        return date.toLocaleDateString('zh-CN');
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
