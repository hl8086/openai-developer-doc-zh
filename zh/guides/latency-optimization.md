<!-- Source: https://developers.openai.com/api/docs/guides/latency-optimization -->

本指南涵盖了一组核心原则，您可以应用这些原则来改善各种 LLM 相关用例的延迟。这些技术来自于与大量客户和开发者在生产应用上的合作经验，因此无论您在构建什么——从细粒度的工作流到端到端的聊天机器人——都应该适用。

虽然有许多单独的技术，但我们将它们归纳为**七个原则**，旨在代表改善延迟方法的高层分类体系。

最后，我们将通过一个[示例](#example)来展示如何应用这些原则。

### 七个原则

1.  [更快地处理 token。](#process-tokens-faster)
2.  [生成更少的 token。](#generate-fewer-tokens)
3.  [使用更少的输入 token。](#use-fewer-input-tokens)
4.  [减少请求次数。](#make-fewer-requests)
5.  [并行化。](#parallelize)
6.  [减少用户等待时间。](#make-your-users-wait-less)
7.  [不要默认使用 LLM。](#don-t-default-to-an-llm)

## 更快地处理 token

**推理速度**可能是解决延迟问题时首先想到的（但正如您很快会看到的，这远不是唯一的因素）。这指的是 LLM **处理 token 的实际速率**，通常以 TPM（每分钟 token 数）或 TPS（每秒 token 数）来衡量。

影响推理速度的主要因素是**模型大小**——较小的模型通常运行更快（也更便宜），并且在正确使用时甚至可以超越较大的模型。要在使用较小模型时保持高质量性能，您可以探索：

*   使用更长、[更详细的提示词](/api/docs/guides/prompt-engineering#tactic-specify-the-steps-required-to-complete-a-task)，
*   添加（更多）[少样本示例](/api/docs/guides/prompt-engineering#tactic-provide-examples)，或
*   [微调](/api/docs/guides/model-optimization) / 蒸馏。

您还可以采用推理优化技术，例如我们的 [**Predicted outputs**](/api/docs/guides/predicted-outputs) 功能。Predicted outputs 让您在预先知道大部分输出内容时（例如代码编辑任务）显著降低生成延迟。通过给模型一个预测，LLM 可以更多地关注实际变化，而不是保持不变的内容。

深入了解

计算容量和额外的推理优化

## 生成更少的 token

生成 token 几乎总是使用 LLM 时延迟最高的步骤：作为一般经验法则，**减少 50% 的输出 token 可能会减少约 50% 的延迟**。减少输出大小的方式取决于输出类型：

如果您正在生成**自然语言**，简单地**要求模型更简洁**（"20 个字以内"或"非常简短"）可能会有帮助。您还可以使用少样本示例和/或微调来教模型生成更短的回复。

如果您正在生成**结构化输出**，尽量在可能的情况下**最小化输出语法**：缩短函数名、省略命名参数、合并参数等。

最后，虽然不常见，您也可以使用 `max_tokens` 或 `stop_tokens` 来提前结束生成。

永远记住：减少一个输出 token 就是节省一（毫）秒！

## 使用更少的输入 token

虽然减少输入 token 数量确实会降低延迟，但这通常不是一个显著因素——**减少 50% 的提示词可能只会带来 1-5% 的延迟改善**。除非您正在处理真正大规模的上下文（文档、图像），否则您可能应该将精力放在其他地方。

话虽如此，如果您_确实_在处理大规模上下文（或者您决心榨取每一点性能_并且_已经用尽了所有其他选项），您可以使用以下技术来减少输入 token：

*   **微调模型**，以替代冗长的指令/示例的需求。
*   **过滤上下文输入**，例如修剪 RAG 结果、清理 HTML 等。
*   **最大化共享提示词前缀**，将动态部分（例如 RAG 结果、历史记录等）放在提示词的后面。这使您的请求更加 [KV cache](https://medium.com/@joaolages/kv-caching-explained-276520203249) 友好（大多数 LLM 提供商都使用它），意味着每次请求处理的输入 token 更少。

查看我们的文档以了解更多关于[提示词缓存](/api/docs/guides/prompt-engineering#prompt-caching)的工作原理。

## 减少请求次数

每次发出请求时都会产生一些往返延迟——这可能会累积起来。

如果您有需要 LLM 执行的顺序步骤，与其每个步骤发送一个请求，不如考虑**将它们放在一个提示词中并在一次响应中获取所有结果**。您将避免额外的往返延迟，并可能降低处理多个响应的复杂性。

一种方法是在组合提示词中将步骤收集为编号列表，然后请求模型在 JSON 的命名字段中返回结果。这样您可以轻松解析和引用每个结果！

## 并行化

在使用 LLM 执行多个步骤时，并行化可以非常强大。

如果步骤**_不是_严格顺序的**，您可以**将它们拆分为并行调用**。晾干两件衬衫和晾干一件所需的时间一样长。

然而，如果步骤**_是_严格顺序的**，您仍然可能能够**利用推测执行**。这在一个结果比其他结果更可能出现的分类步骤中特别有效（例如内容审核）。

1.  同时启动步骤 1 和步骤 2（例如输入审核和故事生成）
2.  验证步骤 1 的结果
3.  如果结果不是预期的，取消步骤 2（必要时重试）

如果您对步骤 1 的猜测是正确的，那么您基本上以零额外延迟运行了它！

## 减少用户等待时间

**等待**和**观看进度发生**之间有巨大的区别——确保您的用户体验到后者。以下是一些技术：

*   **流式传输**：最有效的单一方法，因为它将_等待_时间缩短到一秒或更少。（想象一下如果 ChatGPT 在每个响应完成之前什么都不显示会是什么感觉。）
*   **分块处理**：如果您的输出在展示给用户之前需要进一步处理（审核、翻译），考虑**分块处理**而不是一次性处理。通过流式传输到后端，然后将处理后的块发送到前端来实现。
*   **展示步骤**：如果您正在执行多个步骤或使用工具，将此展示给用户。您能展示的真实进度越多越好。
*   **加载状态**：加载动画和进度条大有帮助。

请注意，虽然**展示步骤和加载状态**主要是心理效果，但**流式传输和分块处理**在考虑应用 + 用户系统时确实能降低整体延迟：用户会更快地读完响应。

## 不要默认使用 LLM

LLM 非常强大和通用，因此有时会被用在**更快的经典方法**更合适的场景中。识别这些场景可能让您显著降低延迟。考虑以下示例：

*   **硬编码：** 如果您的**输出**高度受限，您可能不需要 LLM 来生成它。操作确认、拒绝消息和标准输入请求都是硬编码的好候选。（您甚至可以使用古老的方法为每个场景准备几个变体。）
*   **预计算：** 如果您的**输入**是受限的（例如类别选择），您可以提前生成多个响应，只需确保不会向同一用户展示两次相同的内容。
*   **利用 UI：** 汇总指标、报告或搜索结果有时用经典的定制 UI 组件比 LLM 生成的文本更好传达。
*   **传统优化技术：** LLM 应用仍然是应用；二分搜索、缓存、哈希表和运行时复杂度在 LLM 的世界中_仍然_有用。

## 示例

现在让我们看一个示例应用，识别潜在的延迟优化，并提出一些解决方案！

我们将分析一个受真实生产应用启发的假设客户服务机器人的架构和提示词。[架构和提示词](#architecture-and-prompts)部分设定场景，[分析和优化](#analysis-and-optimizations)部分将逐步介绍延迟优化过程。

您会注意到这个示例并没有涵盖每一个原则，就像现实世界的用例不需要应用每一种技术一样。

### 架构和提示词

以下是一个假设的**客户服务机器人**的**初始架构**。这是我们将要进行修改的内容。

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-0.png)

在高层次上，图表流程描述了以下过程：

1.  用户作为正在进行的对话的一部分发送消息。
2.  最后一条消息被转换为**自包含的查询**（参见提示词中的示例）。
3.  我们确定是否需要**额外的（检索的）信息**来回应该查询。
4.  执行**检索**，产生搜索结果。
5.  助手对用户的查询和搜索结果进行**推理**，并**生成响应**。
6.  响应被发送回用户。

以下是图表中每个部分使用的提示词。虽然它们仍然只是假设和简化的，但它们的结构和措辞与您在生产应用中找到的相同。

您看到的占位符如"**\[user input here\]**"代表动态部分，在运行时会被实际数据替换。

查询上下文化提示词

重写用户查询使其成为自包含的搜索查询。

```
SYSTEM: Given the previous conversation, re-write the last user query so it contains
all necessary context.

# Example
History: [{user: "What is your return policy?"},{assistant: "..."}]
User Query: "How long does it cover?"
Response: "How long does the return policy cover?"

# Conversation
[last 3 messages of conversation]

# User Query
[last user query]

USER: [JSON-formatted input conversation here]
```

检索检查提示词

确定查询是否需要执行检索来响应。

```
SYSTEM: Given a user query, determine whether it requires doing a realtime lookup to
respond to.

# Examples
User Query: "How can I return this item after 30 days?"
Response: "true"

User Query: "Thank you!"
Response: "false"

USER: [input user query here]
```

助手提示词

填充 JSON 的字段，通过预定义的步骤集进行推理，根据用户对话和相关检索信息生成最终响应。

```
SYSTEM: You are a helpful customer service bot.

Use the result JSON to reason about each user query - use the retrieved context.

# Example

User: "My computer screen is cracked! I want it fixed now!!!"

Assistant Response:
{
  "message_is_conversation_continuation": "True",
  "number_of_messages_in_conversation_so_far": "1",
  "user_sentiment": "Aggravated",
  "query_type": "Hardware Issue",
  "response_tone": "Validating and solution-oriented",
  "response_requirements": "Propose options for repair or replacement.",
  "user_requesting_to_talk_to_human": "False",
  "enough_information_in_context": "True",
  "response": "..."
}

USER: # Relevant Information
` ` `
[retrieved context]
` ` `

USER: [input user query here]
```

### 分析和优化

#### 第 1 部分：查看检索提示词

查看架构，首先引人注目的是**连续的 GPT-4 调用**——这暗示了潜在的低效率，通常可以用单次调用或并行调用来替代。

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-2.png)

在这种情况下，由于检索检查需要上下文化的查询，让我们**将它们合并为一个提示词**以[减少请求次数](#make-fewer-requests)。

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-3.png)

合并的查询上下文化和检索检查提示词

**有什么变化？** 之前，我们有一个提示词用于重写查询，一个用于确定是否需要进行检索查找。现在，这个合并的提示词同时完成两者。具体来说，注意提示词第一行更新的指令，以及更新的输出 JSON：

```
{
  query:"[contextualized query]",
  retrieval:"[true/false - whether retrieval is required]"
}
```

```
SYSTEM: Given the previous conversation, re-write the last user query so it contains
all necessary context. Then, determine whether the full request requires doing a
realtime lookup to respond to.

Respond in the following form:
{
  query:"[contextualized query]",
  retrieval:"[true/false - whether retrieval is required]"
}

# Examples

History: [{user: "What is your return policy?"},{assistant: "..."}]
User Query: "How long does it cover?"
Response: {query: "How long does the return policy cover?", retrieval: "true"}

History: [{user: "How can I return this item after 30 days?"},{assistant: "..."}]
User Query: "Thank you!"
Response: {query: "Thank you!", retrieval: "false"}

# Conversation
[last 3 messages of conversation]

# User Query
[last user query]

USER: [JSON-formatted input conversation here]
```

  

实际上，添加上下文和确定是否检索是非常直接且定义明确的任务，所以我们很可能可以使用**更小的微调模型**来代替。切换到 GPT-3.5 将让我们[更快地处理 token](#process-tokens-faster)。

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-4.png)

#### 第 2 部分：分析助手提示词

现在让我们将注意力转向助手提示词。在填充 JSON 字段时似乎有许多不同的步骤在进行——这可能表明有[并行化](#parallelize)的机会。

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-5.png)

然而，假设我们已经运行了一些测试，发现拆分 JSON 中的推理步骤会产生更差的响应，所以我们需要探索不同的解决方案。

**我们能否使用微调的 GPT-3.5 代替 GPT-4？** 也许可以——但一般来说，助手的开放式响应最好留给 GPT-4，这样它可以更好地处理更大范围的情况。话虽如此，查看推理步骤本身，它们可能并不都需要 GPT-4 级别的推理能力来生成。其定义明确、范围有限的特性使它们成为**微调的良好潜在候选**。

```
{
  "message_is_conversation_continuation": "True", // <-
  "number_of_messages_in_conversation_so_far": "1", // <-
  "user_sentiment": "Aggravated", // <-
  "query_type": "Hardware Issue", // <-
  "response_tone": "Validating and solution-oriented", // <-
  "response_requirements": "Propose options for repair or replacement.", // <-
  "user_requesting_to_talk_to_human": "False", // <-
  "enough_information_in_context": "True", // <-
  "response": "..." // X -- 受益于 GPT-4
}
```

这开启了一种权衡的可能性。我们是保持**完全由 GPT-4 生成的单次请求**，还是**拆分为两个顺序请求**并对除最终响应外的所有内容使用 GPT-3.5？我们面临原则冲突的情况：第一个选项让我们[减少请求次数](#make-fewer-requests)，但第二个可能让我们[更快地处理 token](#1-process-tokens-faster)。

与许多优化权衡一样，答案取决于具体细节。例如：

*   `response` 中的 token 与其他字段的比例。
*   更快处理大多数字段带来的平均延迟降低。
*   进行两次请求而不是一次带来的平均延迟_增加_。

结论因情况而异，做出判断的最佳方式是使用生产示例进行测试。在这种情况下，假设测试表明拆分提示词以[更快地处理 token](#process-tokens-faster) 是有利的。

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-6.png)

**注意：** 我们将在第二个提示词中将 `response` 和 `enough_information_in_context` 分组在一起，以避免将检索到的上下文传递给两个新提示词。

助手提示词 - 推理

此提示词将传递给 GPT-3.5，并可以在精选示例上进行微调。

**有什么变化？** "enough\_information\_in\_context" 和 "response" 字段被移除，检索结果不再加载到此提示词中。

```
SYSTEM: You are a helpful customer service bot.

Based on the previous conversation, respond in a JSON to determine the required
fields.

# Example

User: "My freaking computer screen is cracked!"

Assistant Response:
{
  "message_is_conversation_continuation": "True",
  "number_of_messages_in_conversation_so_far": "1",
  "user_sentiment": "Aggravated",
  "query_type": "Hardware Issue",
  "response_tone": "Validating and solution-oriented",
  "response_requirements": "Propose options for repair or replacement.",
  "user_requesting_to_talk_to_human": "False",
}
```

助手提示词 - 响应

此提示词将由 GPT-4 处理，并将接收在前一个提示词中确定的推理步骤，以及检索结果。

**有什么变化？** 除了 "enough\_information\_in\_context" 和 "response" 之外的所有步骤都被移除。此外，我们之前作为输出填充的 JSON 将作为输入传递给此提示词。

```
SYSTEM: You are a helpful customer service bot.

Use the retrieved context, as well as these pre-classified fields, to respond to
the user's query.

# Reasoning Fields
` ` `
[reasoning json determined in previous GPT-3.5 call]
` ` `

# Example

User: "My freaking computer screen is cracked!"

Assistant Response:
{
  "enough_information_in_context": "True",
  "response": "..."
}

USER: # Relevant Information
` ` `
[retrieved context]
` ` `
```

  

事实上，现在推理提示词不依赖于检索到的上下文，我们可以[并行化](#parallelize)，同时发出检索检查和推理步骤。

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-6b.png)

#### 第 3 部分：优化结构化输出

让我们再看一下推理提示词。

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-7b.png)

仔细查看推理 JSON，您可能会注意到字段名本身相当长。

```
{
  "message_is_conversation_continuation": "True", // <-
  "number_of_messages_in_conversation_so_far": "1", // <-
  "user_sentiment": "Aggravated", // <-
  "query_type": "Hardware Issue", // <-
  "response_tone": "Validating and solution-oriented", // <-
  "response_requirements": "Propose options for repair or replacement.", // <-
  "user_requesting_to_talk_to_human": "False", // <-
}
```

通过缩短它们并将解释移到注释中，我们可以[生成更少的 token](#generate-fewer-tokens)。

```
{
  "cont": "True", // whether last message is a continuation
  "n_msg": "1", // number of messages in the continued conversation
  "tone_in": "Aggravated", // sentiment of user query
  "type": "Hardware Issue", // type of the user query
  "tone_out": "Validating and solution-oriented", // desired tone for response
  "reqs": "Propose options for repair or replacement.", // response requirements
  "human": "False", // whether user is expressing want to talk to human
}
```

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-8b.png)

这个小改动减少了 19 个输出 token。虽然使用 GPT-3.5 时这可能只带来几毫秒的改善，但使用 GPT-4 时可能节省多达一秒。

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/token-counts-latency-customer-service-large.png)

然而，您可以想象，对于更大的模型输出，这可能会产生相当显著的影响。

我们可以更进一步，对 JSON 字段使用单个字符，或将所有内容放入数组中，但这可能会开始损害我们的响应质量。再次强调，了解最佳方案的方式是通过测试。

#### 示例总结

让我们回顾一下我们为客户服务机器人示例实施的优化：

![Assistants object architecture diagram](https://cdn.openai.com/API/docs/images/diagram-latency-customer-service-11b.png)

1.  **合并**了查询上下文化和检索检查步骤以[减少请求次数](#make-fewer-requests)。
2.  对新提示词，**切换到更小的微调 GPT-3.5** 以[更快地处理 token](process-tokens-faster)。
3.  将助手提示词拆分为两个，对推理部分**切换到更小的微调 GPT-3.5**，同样是为了[更快地处理 token](#process-tokens-faster)。
4.  [并行化](#parallelize)了检索检查和推理步骤。
5.  **缩短了推理字段名**并将注释移入提示词，以[生成更少的 token](#generate-fewer-tokens)。
