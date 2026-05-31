# Introduction

> GPT Actions 存储在 [Custom GPTs](https://openai.

GPT Actions 存储在 [Custom GPTs](https://openai.com/blog/introducing-gpts) 中，它允许用户通过提供指令、附加文档作为知识库以及连接第三方服务来为特定用例定制 ChatGPT。

GPT Actions 使 ChatGPT 用户能够仅通过自然语言与外部应用程序进行交互，通过 RESTful API 调用访问 ChatGPT 之外的服务。它们将自然语言文本转换为 API 调用所需的 json schema。GPT Actions 通常用于向 ChatGPT [检索数据](/actions/data-retrieval)（例如查询数据仓库）或在其他应用程序中执行操作（例如创建 JIRA 工单）。

## GPT Actions 的工作原理

GPT Actions 的核心是利用 [Function Calling](/guides/function-calling) 来执行 API 调用。

类似于 ChatGPT 的数据分析功能（生成 Python 代码然后执行），它们利用 Function Calling 来 (1) 决定哪个 API 调用与用户的问题相关，以及 (2) 生成 API 调用所需的 json 输入。然后，GPT Action 使用该 json 输入执行 API 调用。

开发者甚至可以指定 Action 的认证机制，Custom GPT 将使用第三方应用的认证来执行 API 调用。GPT Actions 对终端用户隐藏了 API 调用的复杂性：他们只需用自然语言提问，ChatGPT 也会以自然语言提供输出。

## GPT Actions 的优势

API 提供了**互操作性**，使您的组织能够访问其他应用程序。然而，让用户从第三方 API 中获取正确的信息可能需要开发者付出大量的工作。

GPT Actions 提供了一种可行的替代方案：开发者现在只需描述 API 调用的 schema、配置认证并向 GPT 添加一些指令，ChatGPT 就能在用户的自然语言问题和 API 层之间架起桥梁。

## 简化示例

[入门指南](/actions/getting-started)通过使用 [weather.gov](weather.gov) 的两个 API 调用来生成天气预报的示例进行了详细说明：

*   /points/{latitude},{longitude} 输入经纬度坐标，输出预报办公室 (wfo) 和 x-y 坐标
*   /gridpoints/{office}/{gridX},{gridY}/forecast 输入 wfo、x、y 坐标，输出天气预报

一旦开发者在 GPT Action 中编码了填充这两个 API 调用所需的 json schema，用户只需问"这个周末去华盛顿特区旅行我应该带什么？"GPT Action 就会找出该位置的经纬度，按顺序执行两个 API 调用，并根据收到的周末天气预报回复一份打包清单。

在此示例中，GPT Actions 将向 api.weather.gov 提供两个 API 输入：

/points API 调用：

```
{
  "latitude": 38.9072,
  "longitude": -77.0369
}
```

/forecast API 调用：

```
{
  "wfo": "LWX",
  "x": 97,
  "y": 71
}
```

## 开始构建

查看[入门指南](/actions/getting-started)以深入了解此天气示例，以及我们的 [actions library](/actions/actions-library) 以获取最常见第三方应用的预构建 GPT Actions 示例。

## 附加信息

*   熟悉我们的 [GPT 政策](https://openai.com/policies/usage-policies#:~:text=or%20educational%20purposes.-,Building%20with%20ChatGPT,-Shared%20GPTs%20allow)
*   查看 [GPT 数据隐私常见问题](https://help.openai.com/en/articles/8554402-gpts-data-privacy-faqs)
*   查找[常见 GPT 问题的答案](https://help.openai.com/en/articles/8554407-gpts-faq)
