// AI 助手模块
import { storage } from './storage.js';
import { showToast } from './ui-utils.js';

export class AIAssistant {
    constructor() {
        this.apiKey = '';
        this.model = 'gemini-2.0-flash-exp';
        this.messages = [];
        this.init();
    }

    init() {
        this.loadApiKey();
        this.bindEvents();
    }

    loadApiKey() {
        this.apiKey = storage.getApiKey();
        const input = document.getElementById('ai-api-key');
        if (input && this.apiKey) {
            input.value = this.apiKey;
        }
    }

    bindEvents() {
        // API Key 保存
        document.getElementById('ai-api-key')?.addEventListener('change', (e) => {
            this.apiKey = e.target.value.trim();
            storage.saveApiKey(this.apiKey);
        });

        // 模型选择
        document.getElementById('ai-model')?.addEventListener('change', (e) => {
            this.model = e.target.value;
        });

        // 发送消息
        document.getElementById('ai-send')?.addEventListener('click', () => {
            this.sendMessage();
        });

        // 回车发送
        document.getElementById('ai-input')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    async sendMessage() {
        const input = document.getElementById('ai-input');
        const messagesContainer = document.getElementById('ai-messages');

        if (!input || !messagesContainer) return;

        const userMessage = input.value.trim();
        if (!userMessage) return;

        if (!this.apiKey) {
            showToast('请先输入 API Key', 'error');
            return;
        }

        // 添加用户消息
        this.addMessage('user', userMessage);
        input.value = '';

        // 显示加载状态
        const loadingId = 'loading-' + Date.now();
        this.addMessage('assistant', '正在思考...', loadingId);

        try {
            const response = await this.callGeminiAPI(userMessage);

            // 移除加载消息
            const loadingMsg = document.getElementById(loadingId);
            if (loadingMsg) loadingMsg.remove();

            // 添加AI回复
            this.addMessage('assistant', response);
        } catch (error) {
            console.error('AI API error:', error);

            const loadingMsg = document.getElementById(loadingId);
            if (loadingMsg) loadingMsg.remove();

            this.addMessage('assistant', '抱歉，遇到了一些问题：' + error.message);
            showToast('AI 请求失败', 'error');
        }
    }

    addMessage(role, content, id = null) {
        const messagesContainer = document.getElementById('ai-messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${role}`;
        if (id) messageDiv.id = id;
        messageDiv.textContent = content;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        this.messages.push({ role, content });
    }

    async callGeminiAPI(userMessage) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

        // 构建系统提示词
        const systemPrompt = `你是一个专业的小说创作助手。你可以帮助用户：
1. 提供创意灵感和建议
2. 分析情节结构和人物设定
3. 提供写作技巧指导
4. 帮助完善故事大纲
5. 提供文字润色建议

请用简洁、有启发性的方式回答问题，并给出具体可行的建议。`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: systemPrompt }
                        ]
                    },
                    {
                        parts: [
                            { text: userMessage }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.9,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || '请求失败');
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('未获取到有效响应');
        }

        return text;
    }

    // 快捷功能：根据创意生成大纲
    async generateOutlineFromIdea(idea) {
        const prompt = `基于以下创意，帮我生成一个详细的小说大纲：

创意标题：${idea.title}
创意内容：${idea.content}

请提供：
1. 故事背景设定
2. 主要人物介绍
3. 情节发展（起承转合）
4. 可能的结局走向`;

        return await this.callGeminiAPI(prompt);
    }

    // 快捷功能：优化章节内容
    async improveChapter(chapterContent) {
        const prompt = `请帮我优化以下章节内容，使其更加生动、引人入胜：

${chapterContent}

请提供改进建议，包括：
1. 文字润色
2. 情节节奏
3. 人物对话
4. 场景描写`;

        return await this.callGeminiAPI(prompt);
    }

    // 快捷功能：分析作品结构
    async analyzeBook(bookInfo) {
        const prompt = `请帮我分析《${bookInfo.bookTitle}》这部作品${bookInfo.author ? '（作者：' + bookInfo.author + '）' : ''}的写作手法和结构特点。

请从以下角度分析：
1. 情节结构特点
2. 人物塑造方法
3. 叙事技巧
4. 语言风格
5. 值得学习的地方`;

        return await this.callGeminiAPI(prompt);
    }
}
