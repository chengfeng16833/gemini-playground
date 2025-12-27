# Gemini AI 模型说明

> 更新日期：2025年12月
> 最新版本：**Gemini 3.0**（2025年11月18日发布）

---

## 🎉 Gemini 3.0 已发布！

**重大更新**：Google 于 2025 年 11 月 18 日正式发布了 Gemini 3.0！

这是 Google 最强大的 AI 模型，具有以下突破性特性：
- 🧠 **1M token 上下文窗口** - 可处理超长文本
- 💬 **最多 64k token 输出** - 生成更长的内容
- 📅 **知识截止 2025年1月** - 最新的知识库
- 🎯 **可控思考深度** - 可调整推理深度

---

## 🤖 可用模型列表

### Gemini 3.0 系列（最新）⭐

#### 1. **Gemini 3.0 Pro** 🔥 最强
- **模型ID**: `gemini-3-pro-preview`
- **发布日期**: 2025年11月18日
- **特点**: Google 最强大的AI模型
- **上下文**: 1M tokens
- **输出**: 最多 64k tokens
- **思考深度**: 支持 low / high
- **适用场景**:
  - 复杂情节设计
  - 深度作品分析
  - 长篇小说创作
  - 专业内容生成
- **费用**: 暂无免费额度（API 付费）

#### 2. **Gemini 3.0 Flash** ⚡ 超快
- **模型ID**: `gemini-3-flash-preview`
- **发布日期**: 2025年11月18日
- **特点**: 速度快，效率高
- **上下文**: 1M tokens
- **输出**: 最多 64k tokens
- **思考深度**: 支持 minimal / low / medium / high
- **适用场景**:
  - 快速创意生成
  - 日常写作辅助
  - 实时对话
  - 章节快速润色
- **费用**: Gemini API 有免费额度

---

### Gemini 2.0 系列

#### 3. **Gemini 2.0 Flash**
- **模型ID**: `gemini-2.0-flash-exp`
- **特点**: 多模态能力（文本、图像、音频、视频）
- **速度**: 快速
- **输出**: 8192 tokens
- **适用场景**: 平衡的日常使用

#### 4. **Gemini 2.0 Flash Thinking** 🧠
- **模型ID**: `gemini-2.0-flash-thinking-exp`
- **特点**: 展示思考过程
- **速度**: 较慢（有推理过程）
- **输出**: 8192 tokens
- **适用场景**: 需要看到推理过程的复杂任务

---

### Gemini 1.5 系列

#### 5. **Gemini 1.5 Pro (Latest)**
- **模型ID**: `gemini-1.5-pro-latest`
- **特点**: 1.5 系列最新版
- **输出**: 2048 tokens

#### 6. **Gemini 1.5 Pro**
- **模型ID**: `gemini-1.5-pro`
- **特点**: 稳定版本
- **输出**: 2048 tokens

#### 7. **Gemini 1.5 Flash**
- **模型ID**: `gemini-1.5-flash`
- **特点**: 快速响应
- **输出**: 2048 tokens

#### 8. **Gemini 1.5 Flash 8B**
- **模型ID**: `gemini-1.5-flash-8b`
- **特点**: 超轻量级
- **输出**: 1024 tokens

---

## 🎯 使用建议

### 最佳选择（2025年）

```
🥇 长篇创作: Gemini 3.0 Pro
   - 1M token 上下文，可处理整本小说
   - 64k token 输出，可生成超长内容

🥈 日常写作: Gemini 3.0 Flash
   - 速度快，免费额度
   - 仍有 1M token 上下文

🥉 快速灵感: Gemini 2.0 Flash
   - 多模态能力
   - 平衡性能
```

### 场景推荐

| 场景 | 推荐模型 | 原因 |
|------|----------|------|
| 📖 创作长篇小说 | Gemini 3.0 Pro | 超大上下文+输出 |
| ⚡ 快速灵感 | Gemini 3.0 Flash | 快速+免费 |
| 🤔 复杂情节设计 | Gemini 3.0 Pro | 可控思考深度 |
| 📝 章节润色 | Gemini 2.0 Flash | 多模态能力 |
| 💬 对话交互 | Gemini 3.0 Flash | 速度快 |

---

## 🆕 Gemini 3.0 的新特性

### 1. 超大上下文窗口
- **1M tokens** ≈ 75万字中文
- 可以一次性处理整本小说
- 适合长文本分析和创作

### 2. 巨大输出容量
- **64k tokens** ≈ 4.8万字中文
- 可以一次生成多个章节
- 适合长篇内容生成

### 3. 可控思考深度
```javascript
// Gemini 3.0 Pro
thinkingDepth: 'low' | 'high'

// Gemini 3.0 Flash
thinkingDepth: 'minimal' | 'low' | 'medium' | 'high'
```

### 4. 最新知识库
- 知识截止：2025年1月
- 包含最新的写作技巧和趋势

---

## 💡 应用中的配置

小说创作工作室已针对 Gemini 3.0 优化：

```javascript
// Gemini 3.0 配置
{
  temperature: 1.0,        // Pro 版本
  topK: 64,
  topP: 0.95,
  maxOutputTokens: 8192    // 可调整到 64k
}
```

---

## 📊 性能对比

| 模型 | 上下文 | 输出 | 速度 | 质量 | 成本 |
|------|--------|------|------|------|------|
| Gemini 3.0 Pro | 1M | 64k | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | 💰💰💰 |
| Gemini 3.0 Flash | 1M | 64k | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐ | 💰 |
| Gemini 2.0 Flash | 标准 | 8k | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | 💰 |
| Gemini 1.5 Pro | 标准 | 2k | ⚡⚡⚡ | ⭐⭐⭐⭐ | 💰💰 |

---

## 🔗 官方资源

了解更多关于 Gemini 3.0 的信息：

- [Gemini 3 Developer Guide](https://ai.google.dev/gemini-api/docs/gemini-3)
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Google AI Blog](https://blog.google/products/gemini/gemini-3/)
- [Vertex AI Gemini 3 Pro](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/3-pro)
- [Vertex AI Gemini 3 Flash](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/3-flash)

---

## ❓ 常见问题

**Q: Gemini 3.0 什么时候发布的？**
A: 2025年11月18日正式发布。

**Q: 现在应该用哪个模型？**
A: 推荐 Gemini 3.0 Flash（免费+快速）或 3.0 Pro（最强大）。

**Q: Gemini 3.0 有什么优势？**
A: 超大上下文（1M tokens）+ 超大输出（64k tokens）+ 可控思考深度。

**Q: 如何获取 API Key？**
A: 访问 https://makersuite.google.com/app/apikey 免费获取。

**Q: Gemini 3.0 Flash 免费吗？**
A: 是的！在 Gemini API 中有免费额度。

**Q: 可以用来写整本小说吗？**
A: 可以！1M token 上下文足够处理整本小说的内容。

---

## 🎉 已更新功能

小说创作工作室现已全面支持 Gemini 3.0：

✅ Gemini 3.0 Pro - 最强大的创作助手
✅ Gemini 3.0 Flash - 快速且免费
✅ 8 种模型可选
✅ 自动优化配置
✅ 模型选择持久化保存

**立即体验最新的 Gemini 3.0！**

---

## 📝 更新日志

- **2025-12-27**: 添加 Gemini 3.0 Pro 和 Flash 支持
- **2025-11-18**: Gemini 3.0 正式发布
- **2024-12**: Gemini 2.0 发布
- **2024**: Gemini 1.5 系列发布
