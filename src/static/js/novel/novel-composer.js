// 小说创作模块
import { storage } from './storage.js';
import { showModal, showToast } from './ui-utils.js';

export class NovelComposer {
    constructor() {
        this.currentNovel = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        document.getElementById('add-novel')?.addEventListener('click', () => {
            this.showNovelModal();
        });
    }

    async render() {
        const novels = await storage.getAll('novels');
        const container = document.getElementById('novel-list');

        if (!container) return;

        novels.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        if (novels.length === 0) {
            container.innerHTML = '<p class="empty-message">暂无小说项目，点击"新建小说"开始创作</p>';
            return;
        }

        container.innerHTML = novels.map(novel => this.renderNovelCard(novel)).join('');

        novels.forEach(novel => {
            const card = container.querySelector(`[data-id="${novel.id}"]`);
            if (card) {
                card.addEventListener('click', () => this.openNovelEditor(novel));
            }
        });
    }

    renderNovelCard(novel) {
        const date = new Date(novel.updatedAt).toLocaleDateString('zh-CN');
        const wordCount = novel.wordCount || 0;

        return `
            <div class="novel-card" data-id="${novel.id}">
                <div class="card-header">
                    <div>
                        <h3 class="card-title">${this.escapeHtml(novel.title)}</h3>
                        ${novel.genre ? `<span class="card-category">${this.escapeHtml(novel.genre)}</span>` : ''}
                    </div>
                </div>
                <div class="card-content">
                    ${this.escapeHtml(novel.synopsis || '暂无简介')}
                </div>
                <div class="card-footer">
                    <div>
                        <span>${wordCount} 字</span>
                        <span style="margin-left: 12px;">${date}</span>
                    </div>
                    <div class="card-actions">
                        <button class="card-action edit-btn" onclick="event.stopPropagation()">
                            <span class="material-symbols-outlined">edit</span>
                        </button>
                        <button class="card-action delete-btn" onclick="event.stopPropagation()">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showNovelModal(novel = null) {
        const isEdit = !!novel;
        showModal({
            title: isEdit ? '编辑小说信息' : '新建小说',
            content: `
                <div class="form-group">
                    <label>小说标题</label>
                    <input type="text" id="novel-title" value="${novel?.title || ''}" placeholder="输入小说标题" required>
                </div>
                <div class="form-group">
                    <label>类型</label>
                    <select id="novel-genre">
                        <option value="">选择类型</option>
                        <option value="玄幻" ${novel?.genre === '玄幻' ? 'selected' : ''}>玄幻</option>
                        <option value="武侠" ${novel?.genre === '武侠' ? 'selected' : ''}>武侠</option>
                        <option value="都市" ${novel?.genre === '都市' ? 'selected' : ''}>都市</option>
                        <option value="科幻" ${novel?.genre === '科幻' ? 'selected' : ''}>科幻</option>
                        <option value="历史" ${novel?.genre === '历史' ? 'selected' : ''}>历史</option>
                        <option value="悬疑" ${novel?.genre === '悬疑' ? 'selected' : ''}>悬疑</option>
                        <option value="言情" ${novel?.genre === '言情' ? 'selected' : ''}>言情</option>
                        <option value="其他" ${novel?.genre === '其他' ? 'selected' : ''}>其他</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>简介</label>
                    <textarea id="novel-synopsis" rows="5" placeholder="写一段引人入胜的简介...">${novel?.synopsis || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>大纲</label>
                    <textarea id="novel-outline" rows="8" placeholder="规划你的故事大纲...">${novel?.outline || ''}</textarea>
                </div>
            `,
            onConfirm: async () => {
                const title = document.getElementById('novel-title').value.trim();
                const genre = document.getElementById('novel-genre').value;
                const synopsis = document.getElementById('novel-synopsis').value.trim();
                const outline = document.getElementById('novel-outline').value.trim();

                if (!title) {
                    showToast('请输入小说标题', 'error');
                    return false;
                }

                try {
                    const data = {
                        title,
                        genre,
                        synopsis,
                        outline,
                        wordCount: novel?.wordCount || 0
                    };

                    if (isEdit) {
                        await storage.update('novels', { ...novel, ...data });
                        showToast('小说信息已更新', 'success');
                    } else {
                        const id = await storage.add('novels', data);
                        showToast('小说创建成功', 'success');
                    }
                    this.render();
                    return true;
                } catch (error) {
                    console.error('Save novel error:', error);
                    showToast('保存失败', 'error');
                    return false;
                }
            }
        });

        // 绑定编辑和删除按钮事件
        setTimeout(() => {
            document.querySelector('.edit-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editNovel(novel);
            });

            document.querySelector('.delete-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteNovel(novel.id);
            });
        }, 100);
    }

    async openNovelEditor(novel) {
        this.currentNovel = novel;
        const chapters = await storage.getByIndex('chapters', 'novelId', novel.id);
        chapters.sort((a, b) => a.order - b.order);

        const modal = showModal({
            title: novel.title,
            content: `
                <div style="margin-bottom: 20px;">
                    <button id="add-chapter-btn" class="primary-button">
                        <span class="material-symbols-outlined">add</span>
                        新增章节
                    </button>
                    <button id="edit-novel-info-btn" class="secondary-button" style="margin-left: 8px;">
                        编辑小说信息
                    </button>
                </div>
                <div id="chapters-list" style="max-height: 400px; overflow-y: auto;">
                    ${chapters.length === 0 ? '<p class="empty-message">暂无章节，点击"新增章节"开始写作</p>' :
                        chapters.map((chapter, index) => `
                            <div class="chapter-item" data-chapter-id="${chapter.id}" style="padding: 12px; background: var(--bg-tertiary); border-radius: 8px; margin-bottom: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-weight: 500;">第${index + 1}章：${this.escapeHtml(chapter.title)}</div>
                                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                                        ${chapter.content?.length || 0} 字
                                    </div>
                                </div>
                                <div>
                                    <button class="card-action edit-chapter-btn" data-chapter-id="${chapter.id}">
                                        <span class="material-symbols-outlined">edit</span>
                                    </button>
                                    <button class="card-action delete-chapter-btn" data-chapter-id="${chapter.id}">
                                        <span class="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
            `,
            confirmText: '关闭',
            showCancel: false
        });

        // 绑定事件
        setTimeout(() => {
            document.getElementById('add-chapter-btn')?.addEventListener('click', () => {
                this.showChapterEditor(novel, null, chapters.length);
            });

            document.getElementById('edit-novel-info-btn')?.addEventListener('click', () => {
                this.showNovelModal(novel);
                modal.remove();
            });

            chapters.forEach(chapter => {
                const item = document.querySelector(`.chapter-item[data-chapter-id="${chapter.id}"]`);
                item?.addEventListener('click', (e) => {
                    if (!e.target.closest('.edit-chapter-btn') && !e.target.closest('.delete-chapter-btn')) {
                        this.showChapterEditor(novel, chapter, chapters.indexOf(chapter));
                    }
                });

                document.querySelector(`.edit-chapter-btn[data-chapter-id="${chapter.id}"]`)?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showChapterEditor(novel, chapter, chapters.indexOf(chapter));
                });

                document.querySelector(`.delete-chapter-btn[data-chapter-id="${chapter.id}"]`)?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteChapter(chapter.id);
                });
            });
        }, 100);
    }

    showChapterEditor(novel, chapter = null, order = 0) {
        const isEdit = !!chapter;
        showModal({
            title: isEdit ? '编辑章节' : '新增章节',
            content: `
                <div class="form-group">
                    <label>章节标题</label>
                    <input type="text" id="chapter-title" value="${chapter?.title || ''}" placeholder="输入章节标题" required>
                </div>
                <div class="form-group">
                    <label>章节内容</label>
                    <textarea id="chapter-content" rows="20" placeholder="开始写作..." style="font-family: 'Songti SC', 'SimSun', serif; font-size: 16px; line-height: 1.8;">${chapter?.content || ''}</textarea>
                </div>
                <div style="font-size: 14px; color: var(--text-muted);">
                    字数：<span id="word-count">0</span>
                </div>
            `,
            onConfirm: async () => {
                const title = document.getElementById('chapter-title').value.trim();
                const content = document.getElementById('chapter-content').value.trim();

                if (!title) {
                    showToast('请输入章节标题', 'error');
                    return false;
                }

                try {
                    const data = {
                        novelId: novel.id,
                        title,
                        content,
                        order: chapter?.order ?? order
                    };

                    if (isEdit) {
                        await storage.update('chapters', { ...chapter, ...data });
                        showToast('章节已更新', 'success');
                    } else {
                        await storage.add('chapters', data);
                        showToast('章节已保存', 'success');
                    }

                    // 更新小说总字数
                    await this.updateNovelWordCount(novel.id);

                    this.openNovelEditor(novel);
                    return true;
                } catch (error) {
                    console.error('Save chapter error:', error);
                    showToast('保存失败', 'error');
                    return false;
                }
            }
        });

        // 实时字数统计
        setTimeout(() => {
            const textarea = document.getElementById('chapter-content');
            const wordCountSpan = document.getElementById('word-count');

            const updateWordCount = () => {
                const text = textarea.value.trim();
                wordCountSpan.textContent = text.length;
            };

            updateWordCount();
            textarea.addEventListener('input', updateWordCount);
        }, 100);
    }

    async updateNovelWordCount(novelId) {
        const chapters = await storage.getByIndex('chapters', 'novelId', novelId);
        const totalWords = chapters.reduce((sum, chapter) => sum + (chapter.content?.length || 0), 0);

        const novel = await storage.get('novels', novelId);
        if (novel) {
            await storage.update('novels', { ...novel, wordCount: totalWords });
        }
    }

    async editNovel(novel) {
        this.showNovelModal(novel);
    }

    async deleteNovel(id) {
        if (!confirm('确定要删除这部小说吗？相关的所有章节也将被删除。')) {
            return;
        }

        try {
            // 删除所有相关章节
            const chapters = await storage.getByIndex('chapters', 'novelId', id);
            for (const chapter of chapters) {
                await storage.delete('chapters', chapter.id);
            }

            // 删除小说
            await storage.delete('novels', id);
            showToast('小说已删除', 'success');
            this.render();
        } catch (error) {
            console.error('Delete novel error:', error);
            showToast('删除失败', 'error');
        }
    }

    async deleteChapter(id) {
        if (!confirm('确定要删除这个章节吗？')) {
            return;
        }

        try {
            const chapter = await storage.get('chapters', id);
            await storage.delete('chapters', id);

            // 更新小说字数
            if (chapter) {
                await this.updateNovelWordCount(chapter.novelId);
            }

            showToast('章节已删除', 'success');

            if (this.currentNovel) {
                this.openNovelEditor(this.currentNovel);
            }
        } catch (error) {
            console.error('Delete chapter error:', error);
            showToast('删除失败', 'error');
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
