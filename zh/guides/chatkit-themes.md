
按照 [ChatKit 快速入门](/guides/chatkit) 完成设置后，了解如何更改主题并为聊天嵌入添加自定义样式。通过浅色和深色主题、设置强调色、控制信息密度和圆角来匹配您应用的视觉风格。

## 概述

从高层来看，通过传入一个选项对象来自定义主题。如果您按照 [ChatKit 快速入门](/guides/chatkit) 将 ChatKit 嵌入到前端，请使用下面的 React 语法。

*   **React**：将选项传递给 `useChatKit({...})`
*   **高级集成**：使用 `chatkit.setOptions({...})` 设置选项

在两种集成类型中，选项对象的结构是相同的。

## 探索自定义选项

访问 [ChatKit Studio](https://chatkit.studio) 查看 ChatKit 的工作实现和交互式构建器。如果您喜欢通过动手尝试来学习而不是阅读文档，这些资源是一个很好的起点。

#### 探索 ChatKit UI

[chatkit.world - 体验 ChatKit 的交互式演示。](https://chatkit.world)

[Widget 构建器 - 浏览可用的 widget。](https://widgets.chatkit.studio)

[ChatKit 演练场 - 通过交互式演示动手学习。](https://chatkit.studio/playground)

#### 查看工作示例

[GitHub 上的示例 - 查看 ChatKit 的工作示例并获取灵感。](https://github.com/openai/openai-chatkit-advanced-samples)

[入门应用仓库 - 克隆一个仓库，从完整的工作模板开始。](https://github.com/openai/openai-chatkit-starter-app)

## 更改主题

通过指定颜色、排版等来匹配产品的外观和风格。下面，我们设置为深色模式、更改颜色、圆角化边角、调整信息密度并设置字体。

有关所有主题选项，请参阅 [API 参考](https://openai.github.io/chatkit-js/api/openai/chatkit/type-aliases/themeoption/)。

```text
const options: Partial&lt;ChatKitOptions> = {
  theme: {
    colorScheme: "dark",
    color: {
      accent: {
        primary: "#2D8CFF",
        level: 2
      }
    },
    radius: "round",
    density: "compact",
    typography: { fontFamily: "'Inter', sans-serif" },
  },
};
```

## 自定义起始屏幕文本

通过更改编辑器的占位文本，让用户知道可以问什么或引导他们的首次输入。

```text
const options: Partial&lt;ChatKitOptions> = {
  composer: {
    placeholder: "Ask anything about your data…",
  },
  startScreen: {
    greeting: "Welcome to FeedbackBot!",
  },
};
```

## 为新对话显示引导提示

通过在开始对话时建议提示想法，引导用户了解可以问什么或做什么。

```text
const options: Partial&lt;ChatKitOptions> = {
  startScreen: {
    greeting: "What can I help you build today?",
    prompts: [
      {
        name: "Check on the status of a ticket",
        prompt: "Can you help me check on the status of a ticket?",
        icon: "search"
      },
      {
        name: "Create Ticket",
        prompt: "Can you help me create a new support ticket?",
        icon: "write"
      },
    ],
  },
};
```

## 在头部添加自定义按钮

自定义头部按钮帮助您添加与集成相关的导航、上下文或操作。

```text
const options: Partial&lt;ChatKitOptions> = {
  header: {
    customButtonLeft: {
      icon: "settings-cog",
      onClick: () => openProfileSettings(),
    },
    customButtonRight: {
      icon: "home",
      onClick: () => openHomePage(),
    },
  },
};
```

## 启用文件附件

附件默认是禁用的。要启用它们，请添加附件配置。除非您使用自定义后端，否则必须使用 `hosted` 上传策略。有关其他上传策略如何与自定义后端配合使用的更多信息，请参阅 Python SDK 文档。

您还可以控制用户可以附加到消息中的文件数量、大小和类型。

```text
const options: Partial&lt;ChatKitOptions> = {
  composer: {
    attachments: {
      uploadStrategy: { type: 'hosted' },
      maxSize: 20 * 1024 * 1024, // 20MB per file
      maxCount: 3,
      accept: { "application/pdf": [".pdf"], "image/*": [".png", ".jpg"] },
    },
  },
}
```

## 在编辑器中启用 @提及（实体标签）

让用户通过 @提及来标记自定义"实体"。这可以实现更丰富的对话上下文和交互性。

*   使用 `onTagSearch` 根据输入查询返回实体列表。
*   使用 `onClick` 处理实体的点击事件。

```text
const options: Partial&lt;ChatKitOptions> = {
  entities: {
    async onTagSearch(query) {
      return [
        {
          id: "user_123",
          title: "Jane Doe",
          group: "People",
          interactive: true,
        },
        {
          id: "document_123",
          title: "Quarterly Plan",
          group: "Documents",
          interactive: true,
        },
      ]
    },
    onClick: (entity) => {
      navigateToEntity(entity.id);
    },
  },
};
```

## 自定义实体标签的显示方式

您可以使用 widget 自定义实体标签在鼠标悬停时的外观。当用户将鼠标悬停在实体标签上时，显示丰富的预览，如名片、文档摘要或图片。

[Widget 构建器 - 浏览可用的 widget。](https://widgets.chatkit.studio)

```text
const options: Partial&lt;ChatKitOptions> = {
  entities: {
    async onTagSearch() { /* ... */ },
    onRequestPreview: async (entity) => ({
      preview: {
        type: "Card",
        children: [
          { type: "Text", value: `Profile: ${entity.title}` },
          { type: "Text", value: "Role: Developer" },
        ],
      },
    }),
  },
};
```

## 在编辑器中添加自定义工具

通过让用户从编辑器栏触发应用特定的操作来提高生产力。选定的工具将作为工具偏好发送给模型。

```text
const options: Partial&lt;ChatKitOptions> = {
  composer: {
    tools: [
      {
        id: 'add-note',
        label: 'Add Note',
        icon: 'write',
        pinned: true,
      },
    ],
  },
};
```

## 切换 UI 区域和功能

如果您需要对头部中可用选项进行更多自定义并希望实现自己的替代方案，可以禁用主要 UI 区域和功能。当线程和历史记录的概念对您的用例没有意义时（例如在支持聊天机器人中），禁用历史记录会很有用。

```text
const options: Partial&lt;ChatKitOptions> = {
  history: { enabled: false },
  header: { enabled: false },
};
```

## 覆盖语言区域设置

如果您有应用级别的语言设置，可以覆盖默认的语言区域设置。默认情况下，语言区域设置为浏览器的区域设置。

```text
const options: Partial&lt;ChatKitOptions> = {
  locale: 'de-DE',
};
```
