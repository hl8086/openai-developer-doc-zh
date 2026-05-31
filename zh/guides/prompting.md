# Overview

> 了解如何向模型提供有效的输入。

**提示词（Prompting）** 是向模型提供输入的过程。输出的质量通常取决于你向模型提供提示词的能力。

## 概述

提示词编写既是一门艺术，也是一门科学。OpenAI 提供了一些策略和 API 设计决策，帮助你构建强大的提示词并从模型中获得一致的良好结果。我们鼓励你进行实验。

### API 中的提示词

OpenAI 提供了一个长期存在的提示词对象，具有版本控制和模板功能，供项目中的所有用户共享。这种设计让你可以在团队中管理、测试和复用提示词，通过一个集中定义跨 API、SDK 和仪表板使用。

通用提示词 ID 为你提供了测试和构建的灵活性。变量和提示词共享一个基础提示词，因此当你创建新版本时，可以将其用于 [评估](/guides/evals) 并确定提示词的表现是更好还是更差。

### 提示词工具和技术

*   **[提示词缓存](/guides/prompt-caching)**：将延迟降低最多 80%，成本降低最多 75%
*   **[提示词工程](/guides/prompt-engineering)**：学习构建提示词的策略、技术和工具

## 创建提示词

登录并使用 OpenAI [仪表板](https://platform.openai.com/chat) 来创建、保存、版本管理和共享你的提示词。

1.  **开始编写提示词**
    
    在 [Playground](https://platform.openai.com/playground) 中，填写字段以创建你想要的提示词。
    
      
    
2.  **添加提示词变量**
    
    变量允许你在不更改提示词的情况下注入动态值。可以在任何消息角色中使用 `\{\{variable\}\}` 来使用它们。例如，在创建本地天气提示词时，你可以添加一个值为 `San Francisco` 的 `city` 变量。
    
      
    
3.  **在 [Responses API](/guides/text?api-mode=responses) 调用中使用提示词**
    
    在 URL 中找到你的提示词 ID 和版本号，并将其作为 `prompt_id` 传递：
    
    ```
    curl -s -X POST "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "prompt": {
        "prompt_id": "pmpt_123",
        "variables": {
            "city": "San Francisco"
        }
        }
    }'
    ```
    
4.  **创建新的提示词版本**
    
    版本允许你在不覆盖现有内容的情况下迭代提示词。你可以在 API 中使用所有版本，并评估它们之间的性能差异。除非你指定版本，否则提示词 ID 指向最新发布的版本。
    
    要创建新版本，编辑提示词并点击 **Update**。你将收到一个新的提示词 ID，可以复制并在 Responses API 调用中使用。
    
      
    
5.  **需要时回滚**
    
    在[提示词仪表板](https://platform.openai.com/chat)中，选择你要回滚的提示词。在右侧点击 **History**。找到你要恢复的版本，然后点击 **Restore**。
    

## 优化你的提示词

*   将整体语气或角色指导放在系统消息中；将任务特定的细节和示例放在用户消息中。
*   将少样本示例合并为简洁的 YAML 风格或项目符号块，使其易于浏览和更新。
*   用清晰的文件夹名称映射你的项目结构，以便团队成员能快速找到提示词。
*   每次发布时重新运行关联的评估——尽早发现问题比在生产环境中修复要便宜得多。

## 后续步骤

当你对提示词有信心时，可以查看以下指南和资源。

[在 Playground 中构建提示词 - 使用 Playground 开发和迭代提示词。](https://platform.openai.com/chat/edit)

[文本生成 - 学习如何提示模型生成文本。](/guides/text)

[工程化更好的提示词 - 了解 OpenAI 的提示词工程工具和技术。](/guides/prompt-engineering)
