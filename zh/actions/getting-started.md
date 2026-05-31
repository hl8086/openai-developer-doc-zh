# Getting started

> Set up and test GPT Actions from scratch.

## Weather.gov 示例

NSW（国家气象局）维护着一个[公共 API](https://www.weather.gov/documentation/services-web-api)，用户可以查询该 API 来获取任意经纬度坐标点的天气预报。要获取天气预报，需要两个步骤：

1.  用户向 api.weather.gov/points API 提供经纬度坐标，并获得 WFO（气象预报办公室）、grid-X 和 grid-Y 坐标
2.  这三个要素输入到 api.weather.gov/forecast API 中，以获取该坐标的天气预报

在本练习中，让我们构建一个自定义 GPT，用户输入城市、地标或经纬度坐标，自定义 GPT 就能回答该位置的天气预报相关问题。

## 步骤 1：编写并测试 Open API schema（使用 Actions GPT）

GPT Action 需要一个 [Open API schema](https://swagger.io/specification/) 来描述 API 调用的参数，这是描述 API 的标准规范。

OpenAI 发布了一个公开的 [Actions GPT](https://chatgpt.com/g/g-TYEliDU6A-actionsgpt) 来帮助开发者编写此 schema。例如，前往 Actions GPT 并询问：_"前往 [https://www.weather.gov/documentation/services-web-api](https://www.weather.gov/documentation/services-web-api) 并阅读该页面上的文档。为 /points/{latitude},{longitude} 和 /gridpoints/{office}/{gridX},{gridY}/forecast API 调用构建一个 Open API Schema"_

![上述 Actions GPT 请求](https://cdn.openai.com/API/images/guides/actions_action_gpt.png)

Deep dive

查看完整 Open API Schema

ChatGPT 使用顶部的 **info**（特别是其中的 description）来判断此 action 是否与用户查询相关。

```
info:
  title: NWS Weather API
  description: Access to weather data including forecasts, alerts, and observations.
  version: 1.0.0
```

然后下面的 **parameters** 进一步定义了 schema 的每个部分。例如，我们告知 ChatGPT _office_ 参数指的是气象预报办公室（WFO）。

```
/gridpoints/{office}/{gridX},{gridY}/forecast:
  get:
    operationId: getGridpointForecast
    summary: Get forecast for a given grid point
    parameters:
      - name: office
        in: path
        required: true
        schema:
          type: string
        description: Weather Forecast Office ID
```

**关键：** 请特别注意你在 Open API schema 中使用的 **schema 名称**和**描述**。ChatGPT 使用这些名称和描述来理解 (a) 应该调用哪个 API action，以及 (b) 应该使用哪个参数。如果某个字段仅限于特定值，你还可以提供带有描述性类别名称的 "enum"。

虽然你可以直接在 GPT Action 中尝试 Open API schema，但直接在 ChatGPT 中调试可能比较困难。我们建议使用第三方服务（如 [Postman](https://www.postman.com/)）来测试你的 API 调用是否正常工作。Postman 免费注册，错误处理信息详尽，认证选项全面。它甚至提供直接导入 Open API schema 的选项（见下图）。

![选择使用 Postman 导入你的 API](https://cdn.openai.com/API/images/guides/actions_import.png)

## 步骤 2：确定认证要求

这个天气第三方服务不需要认证，因此你可以跳过此自定义 GPT 的该步骤。对于其他需要认证的 GPT Actions，有两个选项：API Key 或 OAuth。向 ChatGPT 提问可以帮助你开始大多数常见应用的配置。例如，如果我需要使用 OAuth 认证到 Google Cloud，我可以提供截图并询问详情：_"我正在通过 OAuth 构建与 Google Cloud 的连接。请提供如何填写每个输入框的说明。"_

![上述 ChatGPT 请求](https://cdn.openai.com/API/images/guides/actions_oauth_panel.png)

通常，ChatGPT 能为所有 5 个要素提供正确的指导。准备好这些基础信息后，尝试在 Postman 或其他类似服务中测试和调试认证。如果遇到错误，将错误信息提供给 ChatGPT，它通常可以帮助你从那里开始调试。

## 步骤 3：创建 GPT Action 并测试

现在是创建自定义 GPT 的时候了。如果你从未创建过自定义 GPT，请从我们的[创建 GPT 指南](https://help.openai.com/en/articles/8554397-creating-a-gpt)开始。

1.  提供名称、描述和图片来描述你的自定义 GPT
2.  前往 Action 部分并粘贴你的 Open API schema。在编写指令时，请注意 Action 名称和 json 参数。
3.  添加你的认证设置
4.  返回主页面并添加指令

Deep dive

编写指令的指导

### 测试 GPT Action

在每个 action 旁边，你会看到一个 **Test** 按钮。点击每个 action 的该按钮。在测试中，你可以看到每个 API 调用的详细输入和输出。

![可用的 actions](https://cdn.openai.com/API/images/guides/actions_available_action.png)

如果你的 API 调用在 Postman 等第三方工具中正常工作，但在 ChatGPT 中不行，可能有以下几个原因：

*   ChatGPT 中的参数错误或缺失
*   ChatGPT 中的认证问题
*   你的指令不完整或不清晰
*   Open API schema 中的描述不清晰

![测试天气 API 调用的预览响应](https://cdn.openai.com/API/images/guides/actions_test_action.png)

## 步骤 4：在第三方应用中设置回调 URL

如果你的 GPT Action 使用 OAuth 认证，你需要在第三方应用中设置回调 URL。一旦你设置了使用 OAuth 的 GPT Action，ChatGPT 会为你提供一个回调 URL（每次更新 OAuth 参数时，该 URL 都会更新）。复制该回调 URL 并将其添加到你的应用中的相应位置。

![设置回调 URL](https://cdn.openai.com/API/images/guides/actions_bq_callback.png)

## 步骤 5：评估自定义 GPT

即使你在上一步中测试了 GPT Action，你仍然需要评估指令和 GPT Action 是否按用户期望的方式运行。尝试想出至少 5-10 个代表性问题（越多越好）作为**"评估集"**来询问你的自定义 GPT。

**关键：** 测试自定义 GPT 是否按你的预期处理每个问题。

一个示例问题：_"这个周末去白宫旅行我应该带什么？"_ 测试了自定义 GPT 的能力：(1) 将地标转换为经纬度，(2) 运行两个 GPT Actions，以及 (3) 回答用户的问题。

![上述 ChatGPT 请求的响应，包含天气数据](https://cdn.openai.com/API/images/guides/actions_prompt_2_actions.png) ![上述响应的续接](https://cdn.openai.com/API/images/guides/actions_output.png)

## 常见调试步骤

_问题：_ GPT Action 调用了错误的 API（或根本没有调用）

*   _解决方案：_ 确保 Actions 的描述清晰——并在自定义 GPT 指令中引用 Action 名称

_问题：_ GPT Action 调用了正确的 API 但参数使用不正确

*   _解决方案：_ 在 GPT Action 中添加或修改参数的描述

_问题：_ 自定义 GPT 不工作但没有收到明确的错误信息

*   _解决方案：_ 确保测试 Action——测试窗口中有更详细的日志。如果仍然不清楚，使用 Postman 或其他第三方服务来更好地诊断。

_问题：_ 自定义 GPT 出现认证错误

*   _解决方案：_ 确保你的回调 URL 设置正确。尝试在 Postman 或其他第三方服务中测试完全相同的认证设置

_问题：_ 自定义 GPT 无法处理更困难/模糊的问题

*   _解决方案：_ 尝试在自定义 GPT 中对指令进行提示工程优化。请参阅我们的[提示工程指南](/guides/prompt-engineering)中的示例

以上就是构建自定义 GPT 的指南。祝你构建顺利，如有其他问题，请利用 [OpenAI 开发者论坛](https://community.openai.com/)。
