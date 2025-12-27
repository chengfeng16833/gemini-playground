// 创意管理模块
import { storage } from './storage.js';
import { showModal, showToast } from './ui-utils.js';

export class IdeaManager {
    constructor() {
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        // 新增创意按钮
        document.getElementById('add-idea')?.addEventListener('click', () => {
            this.showIdeaModal();
        });

        // 搜索
        document.getElementById('idea-search')?.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.render();
        });

        // 分类筛选
        document.getElementById('idea-category-filter')?.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.render();
        });
    }

    async render() {
        const ideas = await storage.getAll('ideas');
        const container = document.getElementById('idea-list');

        if (!container) return;

        // 筛选和搜索
        let filteredIdeas = ideas;

        if (this.currentFilter !== 'all') {
            filteredIdeas = filteredIdeas.filter(idea => idea.category === this.currentFilter);
        }

        if (this.searchTerm) {
            filteredIdeas = filteredIdeas.filter(idea =>
                idea.title.toLowerCase().includes(this.searchTerm) ||
                idea.content.toLowerCase().includes(this.searchTerm)
            );
        }

        // 按创建时间排序
        filteredIdeas.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (filteredIdeas.length === 0) {
            container.innerHTML = '<p class="empty-message">暂无创意，点击"新增创意"开始记录灵感</p>';
            return;
        }

        container.innerHTML = filteredIdeas.map(idea => this.renderIdeaCard(idea)).join('');

        // 绑定卡片事件
        filteredIdeas.forEach(idea => {
            const card = container.querySelector(`[data-id="${idea.id}"]`);
            if (card) {
                card.querySelector('.card-content')?.addEventListener('click', () => {
                    this.showIdeaDetail(idea);
                });
                card.querySelector('.edit-btn')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.editIdea(idea);
                });
                card.querySelector('.delete-btn')?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteIdea(idea.id);
                });
            }
        });
    }

    renderIdeaCard(idea) {
        const categoryNames = {
            'character': '角色设定',
            'plot': '情节构思',
            'worldview': '世界观',
            'dialogue': '对话灵感',
            'other': '其他'
        };

        const date = new Date(idea.createdAt).toLocaleDateString('zh-CN');

        return `
            <div class="idea-card" data-id="${idea.id}">
                <div class="card-header">
                    <div>
                        <h3 class="card-title">${this.escapeHtml(idea.title)}</h3>
                        <span class="card-category">${categoryNames[idea.category] || '其他'}</span>
                    </div>
                </div>
                <div class="card-content">${this.escapeHtml(idea.content)}</div>
                <div class="card-footer">
                    <span>${date}</span>
                    <div class="card-actions">
                        <button class="card-action edit-btn">
                            <span class="material-symbols-outlined">edit</span>
                        </button>
                        <button class="card-action delete-btn">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showIdeaModal(idea = null) {
        const isEdit = !!idea;
        const modal = showModal({
            title: isEdit ? '编辑创意' : '新增创意',
            content: `
                <div class="form-group">
                    <label>标题</label>
                    <input type="text" id="idea-title" value="${idea?.title || ''}" placeholder="输入创意标题" required>
                </div>
                <div class="form-group">
                    <label>分类</label>
                    <select id="idea-category">
                        <option value="character" ${idea?.category === 'character' ? 'selected' : ''}>角色设定</option>
                        <option value="plot" ${idea?.category === 'plot' ? 'selected' : ''}>情节构思</option>
                        <option value="worldview" ${idea?.category === 'worldview' ? 'selected' : ''}>世界观</option>
                        <option value="dialogue" ${idea?.category === 'dialogue' ? 'selected' : ''}>对话灵感</option>
                        <option value="other" ${idea?.category === 'other' ? 'selected' : ''}>其他</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>内容</label>
                    <textarea id="idea-content" rows="8" placeholder="详细描述你的创意..." required>${idea?.content || ''}</textarea>
                </div>
            `,
            onConfirm: async () => {
                const title = document.getElementById('idea-title').value.trim();
                const category = document.getElementById('idea-category').value;
                const content = document.getElementById('idea-content').value.trim();

                if (!title || !content) {
                    showToast('请填写完整信息', 'error');
                    return false;
                }

                try {
                    if (isEdit) {
                        await storage.update('ideas', {
                            ...idea,
                            title,
                            category,
                            content
                        });
                        showToast('创意已更新', 'success');
                    } else {
                        await storage.add('ideas', { title, category, content });
                        showToast('创意已保存', 'success');
                    }
                    this.render();
                    return true;
                } catch (error) {
                    console.error('Save idea error:', error);
                    showToast('保存失败', 'error');
                    return false;
                }
            }
        });
    }

    showIdeaDetail(idea) {
        const categoryNames = {
            'character': '角色设定',
            'plot': '情节构思',
            'worldview': '世界观',
            'dialogue': '对话灵感',
            'other': '其他'
        };

        showModal({
            title: idea.title,
            content: `
                <div style="margin-bottom: 16px;">
                    <span class="card-category">${categoryNames[idea.category]}</span>
                </div>
                <div style="white-space: pre-wrap; line-height: 1.6; color: var(--text-secondary);">
                    ${this.escapeHtml(idea.content)}
                </div>
                <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-color); font-size: 12px; color: var(--text-muted);">
                    <div>创建时间：${new Date(idea.createdAt).toLocaleString('zh-CN')}</div>
                    <div>更新时间：${new Date(idea.updatedAt).toLocaleString('zh-CN')}</div>
                </div>
            `,
            confirmText: '编辑',
            onConfirm: () => {
                this.editIdea(idea);
                return true;
            }
        });
    }

    async editIdea(idea) {
        this.showIdeaModal(idea);
    }

    async deleteIdea(id) {
        if (!confirm('确定要删除这个创意吗？')) {
            return;
        }

        try {
            await storage.delete('ideas', id);
            showToast('创意已删除', 'success');
            this.render();
        } catch (error) {
            console.error('Delete idea error:', error);
            showToast('删除失败', 'error');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
