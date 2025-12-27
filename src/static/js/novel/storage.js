// 数据存储模块 - 使用 localStorage 和 IndexedDB
export class StorageManager {
    constructor() {
        this.dbName = 'NovelWriterDB';
        this.dbVersion = 1;
        this.db = null;
        this.initDB();
    }

    // 初始化 IndexedDB
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // 创建对象存储
                if (!db.objectStoreNames.contains('ideas')) {
                    const ideasStore = db.createObjectStore('ideas', { keyPath: 'id', autoIncrement: true });
                    ideasStore.createIndex('category', 'category', { unique: false });
                    ideasStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                if (!db.objectStoreNames.contains('analyses')) {
                    const analysesStore = db.createObjectStore('analyses', { keyPath: 'id', autoIncrement: true });
                    analysesStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                if (!db.objectStoreNames.contains('novels')) {
                    const novelsStore = db.createObjectStore('novels', { keyPath: 'id', autoIncrement: true });
                    novelsStore.createIndex('createdAt', 'createdAt', { unique: false });
                    novelsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
                }

                if (!db.objectStoreNames.contains('chapters')) {
                    const chaptersStore = db.createObjectStore('chapters', { keyPath: 'id', autoIncrement: true });
                    chaptersStore.createIndex('novelId', 'novelId', { unique: false });
                    chaptersStore.createIndex('order', 'order', { unique: false });
                }
            };
        });
    }

    // 通用添加方法
    async add(storeName, data) {
        await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add({
                ...data,
                createdAt: data.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 通用获取方法
    async get(storeName, id) {
        await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 通用获取所有方法
    async getAll(storeName) {
        await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    // 通用更新方法
    async update(storeName, data) {
        await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put({
                ...data,
                updatedAt: new Date().toISOString()
            });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 通用删除方法
    async delete(storeName, id) {
        await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // 按索引查询
    async getByIndex(storeName, indexName, value) {
        await this.initDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    // 导出所有数据
    async exportData() {
        const data = {
            version: this.dbVersion,
            exportDate: new Date().toISOString(),
            ideas: await this.getAll('ideas'),
            analyses: await this.getAll('analyses'),
            novels: await this.getAll('novels'),
            chapters: await this.getAll('chapters'),
            settings: this.getSettings()
        };
        return data;
    }

    // 导入数据
    async importData(data) {
        try {
            // 清空现有数据
            await this.clearAll();

            // 导入数据
            for (const idea of data.ideas || []) {
                await this.add('ideas', idea);
            }
            for (const analysis of data.analyses || []) {
                await this.add('analyses', analysis);
            }
            for (const novel of data.novels || []) {
                await this.add('novels', novel);
            }
            for (const chapter of data.chapters || []) {
                await this.add('chapters', chapter);
            }

            // 导入设置
            if (data.settings) {
                this.saveSettings(data.settings);
            }

            return true;
        } catch (error) {
            console.error('Import error:', error);
            throw error;
        }
    }

    // 清空所有数据
    async clearAll() {
        const stores = ['ideas', 'analyses', 'novels', 'chapters'];
        for (const storeName of stores) {
            await this.initDB();
            await new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }
    }

    // localStorage 相关方法
    saveSettings(settings) {
        localStorage.setItem('novelWriter_settings', JSON.stringify(settings));
    }

    getSettings() {
        const settings = localStorage.getItem('novelWriter_settings');
        return settings ? JSON.parse(settings) : {
            autoSave: true,
            fontSize: 16,
            apiKey: ''
        };
    }

    // 保存 API Key
    saveApiKey(apiKey) {
        const settings = this.getSettings();
        settings.apiKey = apiKey;
        this.saveSettings(settings);
    }

    // 获取 API Key
    getApiKey() {
        const settings = this.getSettings();
        return settings.apiKey || '';
    }

    // 统计数据
    async getStats() {
        const ideas = await this.getAll('ideas');
        const analyses = await this.getAll('analyses');
        const novels = await this.getAll('novels');

        // 计算今日字数
        const today = new Date().toISOString().split('T')[0];
        const todayChapters = await this.getAll('chapters');
        const todayWords = todayChapters
            .filter(chapter => chapter.updatedAt.startsWith(today))
            .reduce((sum, chapter) => sum + (chapter.content?.length || 0), 0);

        return {
            ideaCount: ideas.length,
            analysisCount: analyses.length,
            novelCount: novels.length,
            todayWords
        };
    }

    // 获取最近编辑的项目
    async getRecentItems(limit = 5) {
        const ideas = await this.getAll('ideas');
        const analyses = await this.getAll('analyses');
        const novels = await this.getAll('novels');

        const items = [
            ...ideas.map(item => ({ ...item, type: 'idea' })),
            ...analyses.map(item => ({ ...item, type: 'analysis' })),
            ...novels.map(item => ({ ...item, type: 'novel' }))
        ];

        return items
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, limit);
    }
}

// 创建单例
export const storage = new StorageManager();
