// 拆书分析模块
import { storage } from './storage.js';
import { showModal, showToast, showLoading } from './ui-utils.js';
import { importTools } from './import-tools.js';

export class BookAnalyzer {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        document.getElementById('add-analysis')?.addEventListener('click', () => {
            this.showAnalysisModal();
        });

        // 导入文件
        document.getElementById('import-file-analysis')?.addEventListener('click', () => {
            this.importFromFile();
        });

        // 网页抓取
        document.getElementById('import-web-analysis')?.addEventListener('click', () => {
            this.importFromWeb();
        });
    }

    async importFromFile() {
        try {
            const files = await importTools.selectFiles(false);
            if (files.length === 0) return;

            const result = await importTools.readTextFile(files[0]);
            const fileName = files[0].name.replace(/\.[^/.]+$/, '');

            // 分析文本内容
            const analyzed = importTools.analyzeText(result);

            // 创建分析记录
            await storage.add('analyses', {
                bookTitle: fileName,
                author: '',
                summary: analyzed.chapters.length > 0 ? analyzed.chapters[0].content.substring(0, 200) : result.substring(0, 200),
                plotAnalysis: '',
                characterAnalysis: '',
                writingTechniques: '',
                themeAnalysis: '',
                notes: result
            });

            showToast('文件导入成功！', 'success');
            this.render();

        } catch (error) {
            console.error('Import error:', error);
            if (error.message !== '未选择文件') {
                showToast('导入失败：' + error.message, 'error');
            }
        }
    }

    async importFromWeb() {
        showModal({
            title: '从网页抓取内容',
            content: `
                <div class="form-group">
                    <label>网页地址 (URL)</label>
                    <input type="url" id="web-url-input" placeholder="https://example.com/article" class="input-field">
                    <p style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">
                        注意：部分网站可能因CORS限制无法直接抓取
                    </p>
                </div>
                <div class="form-group">
                    <label>作品标题（可选）</label>
                    <input type="text" id="web-book-title" placeholder="如果留空将使用网页标题" class="input-field">
                </div>
            `,
            confirmText: '抓取',
            onConfirm: async () => {
                const url = document.getElementById('web-url-input').value.trim();
                const customTitle = document.getElementById('web-book-title').value.trim();

                if (!url) {
                    showToast('请输入网页地址', 'error');
                    return false;
                }

                const loading = showLoading('正在抓取网页内容...');

                try {
                    const webData = await importTools.fetchWebPage(url);

                    loading.close();

                    // 创建分析记录
                    await storage.add('analyses', {
                        bookTitle: customTitle || webData.title,
                        author: '',
                        summary: webData.summary,
                        plotAnalysis: '',
                        characterAnalysis: '',
                        writingTechniques: '',
                        themeAnalysis: '',
                        notes: `来源：${url}\n\n${webData.content}`
                    });

                    showToast('网页内容抓取成功！', 'success');
                    this.render();
                    return true;

                } catch (error) {
                    loading.close();
                    console.error('Web fetch error:', error);
                    showToast(error.message, 'error');
                    return false;
                }
            }
        });
    }

    async render() {
        const analyses = await storage.getAll('analyses');
        const container = document.getElementById('analysis-list');

        if (!container) return;

        analyses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (analyses.length === 0) {
            container.innerHTML = '<p class="empty-message">暂无分析笔记，点击"新建分析"开始拆解作品</p>';
            return;
        }

        container.innerHTML = analyses.map(analysis => this.renderAnalysisCard(analysis)).join('');

        analyses.forEach(analysis => {
            const card = container.querySelector(`[data-id="${analysis.id}"]`);
            if (card) {
                card.addEventListener('click', () => this.showAnalysisDetail(analysis));
            }
        });
    }

    renderAnalysisCard(analysis) {
        const date = new Date(analysis.createdAt).toLocaleDateString('zh-CN');
        return `
            <div class="analysis-card" data-id="${analysis.id}">
                <div class="card-header">
                    <div>
                        <h3 class="card-title">${this.escapeHtml(analysis.bookTitle)}</h3>
                        ${analysis.author ? `<p style="font-size: 14px; color: var(--text-muted); margin-top: 4px;">作者：${this.escapeHtml(analysis.author)}</p>` : ''}
                    </div>
                </div>
                <div class="card-content">
                    ${this.escapeHtml(analysis.summary || analysis.notes?.substring(0, 150) || '暂无摘要')}
                </div>
                <div class="card-footer">
                    <span>${date}</span>
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

    showAnalysisModal(analysis = null) {
        const isEdit = !!analysis;
        const modal = showModal({
            title: isEdit ? '编辑分析' : '新建分析',
            content: `
                <div class="form-group">
                    <label>书名</label>
                    <input type="text" id="analysis-book-title" value="${analysis?.bookTitle || ''}" placeholder="输入书名" required>
                </div>
                <div class="form-group">
                    <label>作者</label>
                    <input type="text" id="analysis-author" value="${analysis?.author || ''}" placeholder="输入作者名">
                </div>
                <div class="form-group">
                    <label>摘要</label>
                    <textarea id="analysis-summary" rows="3" placeholder="简要概括...">${analysis?.summary || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>情节结构分析</label>
                    <textarea id="analysis-plot" rows="5" placeholder="分析作品的情节结构、起承转合...">${analysis?.plotAnalysis || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>人物塑造分析</label>
                    <textarea id="analysis-characters" rows="5" placeholder="分析主要人物的性格、动机、成长...">${analysis?.characterAnalysis || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>写作技巧分析</label>
                    <textarea id="analysis-techniques" rows="5" placeholder="分析叙事手法、语言风格、修辞技巧...">${analysis?.writingTechniques || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>主题思想分析</label>
                    <textarea id="analysis-theme" rows="5" placeholder="分析作品的主题、寓意、深层含义...">${analysis?.themeAnalysis || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>其他笔记</label>
                    <textarea id="analysis-notes" rows="5" placeholder="其他观察和思考...">${analysis?.notes || ''}</textarea>
                </div>
            `,
            onConfirm: async () => {
                const bookTitle = document.getElementById('analysis-book-title').value.trim();
                const author = document.getElementById('analysis-author').value.trim();
                const summary = document.getElementById('analysis-summary').value.trim();
                const plotAnalysis = document.getElementById('analysis-plot').value.trim();
                const characterAnalysis = document.getElementById('analysis-characters').value.trim();
                const writingTechniques = document.getElementById('analysis-techniques').value.trim();
                const themeAnalysis = document.getElementById('analysis-theme').value.trim();
                const notes = document.getElementById('analysis-notes').value.trim();

                if (!bookTitle) {
                    showToast('请输入书名', 'error');
                    return false;
                }

                try {
                    const data = {
                        bookTitle,
                        author,
                        summary,
                        plotAnalysis,
                        characterAnalysis,
                        writingTechniques,
                        themeAnalysis,
                        notes
                    };

                    if (isEdit) {
                        await storage.update('analyses', { ...analysis, ...data });
                        showToast('分析已更新', 'success');
                    } else {
                        await storage.add('analyses', data);
                        showToast('分析已保存', 'success');
                    }
                    this.render();
                    return true;
                } catch (error) {
                    console.error('Save analysis error:', error);
                    showToast('保存失败', 'error');
                    return false;
                }
            }
        });

        // 绑定编辑和删除按钮事件
        setTimeout(() => {
            const editBtn = modal.querySelector('.edit-btn');
            const deleteBtn = modal.querySelector('.delete-btn');

            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.editAnalysis(analysis);
                });
            }

            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteAnalysis(analysis.id);
                });
            }
        }, 100);
    }

    showAnalysisDetail(analysis) {
        const sections = [
            { title: '摘要', content: analysis.summary },
            { title: '情节结构分析', content: analysis.plotAnalysis },
            { title: '人物塑造分析', content: analysis.characterAnalysis },
            { title: '写作技巧分析', content: analysis.writingTechniques },
            { title: '主题思想分析', content: analysis.themeAnalysis },
            { title: '其他笔记', content: analysis.notes }
        ].filter(section => section.content);

        const content = `
            <div style="margin-bottom: 20px;">
                <h3 style="font-size: 20px; margin-bottom: 8px;">${this.escapeHtml(analysis.bookTitle)}</h3>
                ${analysis.author ? `<p style="color: var(--text-muted);">作者：${this.escapeHtml(analysis.author)}</p>` : ''}
            </div>
            ${sections.map(section => `
                <div style="margin-bottom: 24px;">
                    <h4 style="font-size: 16px; color: var(--primary-color); margin-bottom: 8px;">${section.title}</h4>
                    <div style="white-space: pre-wrap; line-height: 1.6; color: var(--text-secondary);">
                        ${this.escapeHtml(section.content)}
                    </div>
                </div>
            `).join('')}
            <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-color); font-size: 12px; color: var(--text-muted);">
                <div>创建时间：${new Date(analysis.createdAt).toLocaleString('zh-CN')}</div>
                <div>更新时间：${new Date(analysis.updatedAt).toLocaleString('zh-CN')}</div>
            </div>
        `;

        const modal = showModal({
            title: '分析详情',
            content,
            confirmText: '编辑',
            onConfirm: () => {
                this.editAnalysis(analysis);
                return true;
            }
        });

        // 添加删除按钮
        setTimeout(() => {
            const footer = modal.querySelector('.modal-footer');
            if (footer) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'danger-button';
                deleteBtn.textContent = '删除';
                deleteBtn.style.marginRight = 'auto';
                deleteBtn.addEventListener('click', () => {
                    this.deleteAnalysis(analysis.id);
                    modal.remove();
                });
                footer.insertBefore(deleteBtn, footer.firstChild);
            }
        }, 50);
    }

    async editAnalysis(analysis) {
        this.showAnalysisModal(analysis);
    }

    async deleteAnalysis(id) {
        if (!confirm('确定要删除这个分析吗？')) {
            return;
        }

        try {
            await storage.delete('analyses', id);
            showToast('分析已删除', 'success');
            this.render();
        } catch (error) {
            console.error('Delete analysis error:', error);
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
