// 文件和网页导入工具模块
import { showToast, showLoading } from './ui-utils.js';

export class ImportTools {
    constructor() {
        this.supportedFileTypes = ['.txt', '.md', '.text'];
    }

    /**
     * 读取本地文件
     * @param {File} file - 文件对象
     * @returns {Promise<string>} 文件内容
     */
    async readTextFile(file) {
        return new Promise((resolve, reject) => {
            // 检查文件类型
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            if (!this.supportedFileTypes.includes(fileExtension)) {
                reject(new Error(`不支持的文件类型。支持: ${this.supportedFileTypes.join(', ')}`));
                return;
            }

            // 检查文件大小 (限制 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                reject(new Error('文件太大，最大支持 10MB'));
                return;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    resolve(content);
                } catch (error) {
                    reject(new Error('文件读取失败：' + error.message));
                }
            };

            reader.onerror = () => {
                reject(new Error('文件读取失败'));
            };

            // 尝试以 UTF-8 读取
            reader.readAsText(file, 'UTF-8');
        });
    }

    /**
     * 批量读取多个文件
     * @param {FileList} files - 文件列表
     * @returns {Promise<Array>} 文件内容数组
     */
    async readMultipleFiles(files) {
        const results = [];
        for (let i = 0; i < files.length; i++) {
            try {
                const content = await this.readTextFile(files[i]);
                results.push({
                    name: files[i].name,
                    content: content,
                    size: files[i].size,
                    success: true
                });
            } catch (error) {
                results.push({
                    name: files[i].name,
                    error: error.message,
                    success: false
                });
            }
        }
        return results;
    }

    /**
     * 显示文件选择对话框
     * @param {boolean} multiple - 是否允许多选
     * @returns {Promise<FileList>} 选中的文件
     */
    async selectFiles(multiple = false) {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = this.supportedFileTypes.join(',');
            input.multiple = multiple;

            input.onchange = (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    resolve(e.target.files);
                } else {
                    reject(new Error('未选择文件'));
                }
            };

            input.click();
        });
    }

    /**
     * 抓取网页内容
     * @param {string} url - 网页 URL
     * @returns {Promise<Object>} 网页内容
     */
    async fetchWebPage(url) {
        // 验证 URL
        if (!this.isValidUrl(url)) {
            throw new Error('无效的 URL 格式');
        }

        try {
            // 使用 CORS 代理（如果需要）
            // 注意：直接抓取可能因为 CORS 限制失败
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'text/html,application/xhtml+xml',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();

            // 提取文本内容
            const extracted = this.extractTextFromHTML(html);

            return {
                url: url,
                title: extracted.title,
                content: extracted.content,
                summary: extracted.summary,
                wordCount: extracted.content.length
            };
        } catch (error) {
            // 如果直接抓取失败，提供替代方案
            if (error.name === 'TypeError' || error.message.includes('CORS')) {
                throw new Error('无法直接访问该网页（CORS限制）。\n\n替代方案：\n1. 手动复制网页内容粘贴\n2. 使用浏览器扩展抓取\n3. 下载为文本文件后导入');
            }
            throw error;
        }
    }

    /**
     * 从 HTML 提取文本内容
     * @param {string} html - HTML 内容
     * @returns {Object} 提取的内容
     */
    extractTextFromHTML(html) {
        // 创建临时 DOM 元素
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // 移除脚本和样式
        const scripts = doc.querySelectorAll('script, style, nav, footer, header');
        scripts.forEach(el => el.remove());

        // 提取标题
        const title = doc.querySelector('title')?.textContent ||
                     doc.querySelector('h1')?.textContent ||
                     '无标题';

        // 提取正文
        const body = doc.body;
        let content = '';

        // 优先查找文章容器
        const articleSelectors = [
            'article',
            '.article-content',
            '.post-content',
            '.entry-content',
            'main',
            '#content',
            '.content'
        ];

        let mainContent = null;
        for (const selector of articleSelectors) {
            mainContent = doc.querySelector(selector);
            if (mainContent) break;
        }

        // 提取文本
        const textElement = mainContent || body;
        content = textElement.textContent
            .replace(/\s+/g, ' ')  // 合并空白
            .replace(/\n\s*\n/g, '\n')  // 移除多余换行
            .trim();

        // 生成摘要（前200字）
        const summary = content.substring(0, 200) + (content.length > 200 ? '...' : '');

        return {
            title: title.trim(),
            content: content,
            summary: summary
        };
    }

    /**
     * 验证 URL 格式
     * @param {string} url - URL 字符串
     * @returns {boolean} 是否有效
     */
    isValidUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    }

    /**
     * 分析文本内容（智能分段）
     * @param {string} text - 文本内容
     * @returns {Object} 分析结果
     */
    analyzeText(text) {
        const lines = text.split('\n').filter(line => line.trim());

        // 检测章节标记
        const chapterPatterns = [
            /^第[一二三四五六七八九十百千万\d]+[章节回]/,
            /^Chapter\s+\d+/i,
            /^\d+[\.\s]/
        ];

        const chapters = [];
        let currentChapter = null;

        lines.forEach(line => {
            const isChapter = chapterPatterns.some(pattern => pattern.test(line));

            if (isChapter) {
                if (currentChapter) {
                    chapters.push(currentChapter);
                }
                currentChapter = {
                    title: line.trim(),
                    content: []
                };
            } else if (currentChapter) {
                currentChapter.content.push(line);
            } else {
                // 如果还没有章节，创建一个默认章节
                if (!currentChapter) {
                    currentChapter = {
                        title: '正文',
                        content: [line]
                    };
                }
            }
        });

        // 添加最后一个章节
        if (currentChapter) {
            chapters.push(currentChapter);
        }

        // 统计信息
        const totalChars = text.length;
        const totalWords = text.replace(/\s/g, '').length;

        return {
            totalChars,
            totalWords,
            chapterCount: chapters.length,
            chapters: chapters.map(ch => ({
                title: ch.title,
                content: ch.content.join('\n'),
                wordCount: ch.content.join('').length
            }))
        };
    }

    /**
     * 显示导入对话框（文件或 URL）
     * @param {string} type - 'file' 或 'url'
     * @returns {Promise<Object>} 导入结果
     */
    async showImportDialog(type = 'file') {
        return new Promise((resolve, reject) => {
            const modalHtml = `
                <div class="import-dialog">
                    <div class="tabs">
                        <button class="tab ${type === 'file' ? 'active' : ''}" data-tab="file">
                            <span class="material-symbols-outlined">upload_file</span>
                            导入文件
                        </button>
                        <button class="tab ${type === 'url' ? 'active' : ''}" data-tab="url">
                            <span class="material-symbols-outlined">link</span>
                            网页抓取
                        </button>
                    </div>

                    <div class="tab-content file-tab ${type === 'file' ? 'active' : ''}">
                        <div class="drop-zone" id="drop-zone">
                            <span class="material-symbols-outlined" style="font-size: 48px; color: var(--primary-color);">upload</span>
                            <p>拖拽文件到这里，或点击选择文件</p>
                            <p style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">
                                支持：TXT, MD 文件（最大 10MB）
                            </p>
                        </div>
                        <input type="file" id="file-input" accept=".txt,.md,.text" multiple style="display: none;">
                    </div>

                    <div class="tab-content url-tab ${type === 'url' ? 'active' : ''}">
                        <div class="form-group">
                            <label>网页地址 (URL)</label>
                            <input type="url" id="url-input" placeholder="https://example.com/article" class="input-field">
                        </div>
                        <div class="form-group">
                            <button id="fetch-url" class="primary-button">
                                <span class="material-symbols-outlined">download</span>
                                抓取内容
                            </button>
                        </div>
                        <div id="url-preview" style="margin-top: 16px;"></div>
                    </div>
                </div>
            `;

            // 这里需要集成到实际的模态框系统中
            // 暂时返回接口供外部调用
            resolve({ type, modalHtml });
        });
    }
}

// 创建单例
export const importTools = new ImportTools();
