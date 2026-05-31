
`gpt-realtime-2` 是我们最先进的推理语音模型，专为低延迟的语音到语音应用设计。它能在说话前进行思考，更可靠地遵循指令，使用更大的上下文窗口，并且比早期的实时模型更精确地调用工具。

为了充分利用这些优势，请更有意图地设计提示词。清晰地定义助手的职责、决策点、工具调用行为和防护措施：它应该做什么、什么时候做、以及应该避免什么。

从简单开始。不要一开始就过度提示。先用最小化的提示词，运行评估，然后只为测试中失败的行为添加指令。

## 选择模型

| 模型 | 适用场景 | 提示词重点 |
| --- | --- | --- |
| [`gpt-realtime-2`](/models/gpt-realtime-2) | 需要最强的实时推理、工具使用和指令遵循能力。 | 调整推理力度、前导语、工具策略、精确实体捕获和长会话状态。 |
| [`gpt-realtime-1.5`](/models/gpt-realtime-1.5) | 需要快速、可靠的非推理语音到语音模型。 | 遵循核心实时提示词结构，并测试延迟敏感行为。 |

gpt-realtime-2gpt-realtime-1.5

## Realtime 2.0 提示词指南

当语音代理需要更强的推理、工具选择、精确实体处理或长会话状态时，使用 `gpt-realtime-2`。从 `reasoning.effort: "low"` 开始，测试默认前导语行为，并在写入操作前定义清晰的确认边界。

## Realtime 2 的变化

将 Realtime 2 作为推理语音代理来提示，而不是基础语音机器人。

| 变化 | 对提示词的影响 |
| --- | --- |
| 推理能力 | 允许模型在说话或调用工具之前对复杂任务进行内部推理。使用前导语避免尴尬的沉默或不必要的填充语。 |
| 提示词精确度更重要 | 用清晰的触发条件、动作和例外规则替代宽泛的指导（如"保持有帮助"）：何时行动、做什么、何时不做。 |
| 指令冲突代价更高 | 除非确实需要，否则移除重叠的 `always`、`never`、`only` 和 `must` 规则。当规则竞争时定义优先级。 |
| 工具行为更可控 | 指定助手何时应立即行动、询问缺失信息、确认高精度细节、失败后重试或升级处理。 |
| 前导语成为一等行为 | 模型可能在较长的推理或工具使用流程之前说出简短的更新。控制前导语何时出现、应该多短、以及何时跳过。 |
| 扩展的上下文窗口 | `gpt-realtime-2` 将实时上下文窗口从 32k 扩展到 128k token，使其更适合长会话和更大的系统提示词。 |

前导语不是隐藏的思维链。它们是简短的口头更新，如"我现在来查一下那个订单。"不要要求模型透露私有推理过程。

## 推荐的提示词结构

使用简短的、带标签的章节。模型应该能快速找到相关指令。

```
# Role and Objective

# Personality and Tone

# Language

# Reasoning

# Message Channels

# Preambles

# Verbosity

# Tools

# Unclear Audio

# Entity Capture

# Long Context Behavior

# Escalation
```

并非每个用例都需要每个章节。添加与你的产品相关的章节即可。

## 设置推理力度

`gpt-realtime-2` 可以用延迟换取更深入的推理。使用仍能为工作流提供足够智能的最低推理级别。

对于大多数生产语音代理，从 `low` 开始。根据任务复杂度、延迟容忍度和失败成本进行上下调整。

| 力度 | 适用场景 | 示例 |
| --- | --- | --- |
| `minimal` | 最低延迟最重要且任务简单。 | 智能家居命令、计时器、简单日历查询。 |
| `low` | 需要响应性加上基本推理。 | 客户支持、订单查询、简单策略问题。 |
| `medium` | 助手必须推理多步骤任务。 | 技术支持、诊断、复杂路由。 |
| `high` | 更深入的推理能显著提高成功率。 | 高精度工作流、升级决策、有约束的任务。 |
| `xhigh` | 最大推理值得额外的延迟和成本。 | 复杂规划、关键分诊、高风险工具编排。 |

除了 API 设置外，还可以引导模型何时以及推理多少。

```
## Reasoning

- For direct answers, simple lookups, and short confirmations, respond quickly and do not reason.
- For multi-step tasks, tool decisions, troubleshooting, or escalation, reason before acting.
- Do not perform extended reasoning when the user's audio is unclear; ask for clarification instead.
```

## 有意识地使用前导语

前导语是简短的口头更新，在语音代理推理、查找信息或调用工具时保持响应感。使用得当，它们能让用户放心助手正在工作。使用不当，它们会变成填充语并增加感知延迟。

`gpt-realtime-2` 默认生成前导语。先测试默认行为。如果不符合你的产品体验，再明确调整。

![Preamble generation and playback timeline]( https://cdn.openai.com/API/docs/images/platform/guides/realtime-2-preambles.png)

```
## Preambles

Use short preambles only when they help the user understand that work is happening.

### When to use a preamble

Use a preamble when:

- you are about to call a tool that may take noticeable time;
- you need to reason through a multi-step request;
- you are checking records, availability, account state, or policy details;
- you are preparing an escalation or handoff;
- silence would make the assistant feel unresponsive.

When a preamble is needed, output it immediately before substantive reasoning or tool use.

### When to not use a preamble

Do not use a preamble when:

- the answer is direct and can be given immediately;
- the user is only confirming, correcting, or declining something;
- the audio is unclear and you need clarification;
- the latest audio is silence, background noise, hold music, TV audio, or side conversation;
- the tool call is lightweight and the user would not benefit from an update.

### Preamble style

When using a preamble:

- keep it natural, calm, and concise;
- vary the wording across turns;
- describe the action, not the internal reasoning;
- avoid filler.

Avoid phrases like:

- "Let me think..."
- "Hmm..."
- "One moment while I process that..."
- "I am now going to access the tool..."

### Preamble length

Use one short sentence.

Do not exceed two short sentences unless the user needs an explanation before a high-impact action.

### Prefer

- "I'll check that order now."
- "I'll look up your appointment details."
- "I'll verify that before we make any changes."
- "I'll check the policy and then give you the next step."
- "I'll pull that up so we can make sure it's the right account."

### Avoid

- "Let me think about that for a second."
- "Please wait while I process your request."
- "I'm going to use my tools now."
- "Interesting question. I will reason through this carefully."
```

## 控制回复长度

当提示词指定每种任务类型应给出多少细节时，`gpt-realtime-2` 最能遵循长度指导。与其告诉模型"保持简洁"，不如在上下文中定义简洁的含义：直接回答、工具结果、故障排除、比较和升级可能各需要不同的回复长度。

```
## Verbosity

- Direct answers: Use 1-2 short sentences.
- Clarifying questions: Ask one question at a time.
- Tool results: Summarize the result first, then give only the next useful action.
- Product or option comparisons: Include key differences, tradeoffs, and who each option fits.
- Troubleshooting: Give one step at a time unless the user asks for the full procedure.
- Escalations: Briefly explain why escalation is needed and what will happen next.
```

示例：

> 用户：我应该选择哪个方案？

> 助手：如果你想要最低成本，选择 Basic。如果你需要团队权限和共享账单，选择 Pro。如果合规审查或管理控制很重要，选择 Enterprise。

## 设计工具行为

`gpt-realtime-2` 在工具调用方面更强，但工具行为仍然取决于提示词和工具规格设计。如果提示词没有定义何时行动、询问、确认或恢复，助手可能会过早调用工具、提出不必要的问题或重复失败的调用。

### 设置工具调用积极度

高积极度适用于只读、低风险操作。低积极度更适合修改数据、触发外部效果或依赖精确标识符的工具。

| 工具类型 | 默认行为 |
| --- | --- |
| 只读、低风险查询 | 当意图和必填字段明确时调用。 |
| 带精确标识符的只读 | 查询前确认标识符。 |
| 用户可见的通信 | 发送前起草或总结。 |
| 账户变更 | 调用前确认。 |
| 购买、取消、支付 | 调用前确认金额、目标和后果。 |
| 不可逆或高影响操作 | 明确确认并在适当时提供升级选项。 |

当你有读写操作混合时，使用这个平衡的默认值。根据你的用例进行调整。

```
## Tools

Use only the tools explicitly provided in the current tool list. Do not invent, assume, simulate, or rename tools.

For read-only tools:

- Call the tool when the user's intent is clear and all required fields are available.
- Do not ask for confirmation unless the lookup depends on a high-precision identifier or there is meaningful risk of using the wrong record.
- Ask a clarification question only if a required field is missing, ambiguous, or conflicting.

For write tools or external actions:

- Summarize the intended action before calling the tool.
- Include the key consequence, such as what will be changed, sent, canceled, ordered, or charged.
- Ask for confirmation.
- Do not call the tool until the user clearly confirms.

For exact identifiers:

- Treat order IDs, tracking numbers, account numbers, confirmation codes, phone numbers, and email addresses as high precision.
- Normalize only when the field type is clear.
- Confirm the final value before account-specific lookups, validation, or write actions.

After tool calls:

- Only say an action was completed after the tool call succeeds.
- If the tool fails, explain the failure briefly, avoid raw errors, and give the user a clear next step.
```

高风险示例：

> 用户：用我的卡扣除剩余余额。

不好的做法：

> 助手：我已经扣了你的卡。

好的做法：

> 助手：确认一下，你想让我用存档的卡扣除 $248.16 的剩余余额。要继续吗？

### 从工具失败中恢复

工具失败是对话的一部分。好的恢复应该解释发生了什么并给用户一个清晰的下一步。

不要对每个失败都一视同仁。恢复行为应取决于工具类型、失败模式和用户影响。有些失败应该通过重试静默处理。其他的需要要求用户澄清、更正标识符、确认新操作或选择替代路径。

```
## Tool Failures

If a tool call fails:

1. Briefly explain what failed in user-friendly language.
2. Do not blame the user or expose raw tool errors.
3. If the failure may be due to an exact identifier, read back the value used and ask the user to correct it.
4. If the failure may be temporary, offer to retry once.
5. If the same failure happens repeatedly, offer an alternate path or escalation.

Do not repeatedly call the same tool with the same arguments after failure.

Do not ask for a different identifier until you have first checked whether the captured value was correct.
```

不好的做法：

> 助手：出了点问题。

好的做法：

> 助手：我找不到 O R D dash 3 1 2 5 B 2 3 的匹配项。我有没有听错哪个部分？

### 保持工具可用性同步

实时模型很乐于帮忙。如果提示词提到了一个实际上不可用的工具，或者工具列表与提示词不匹配，模型可能会编造工具名称或假装完成了操作。

例如，如果提示词引用了 `lookup_order`，但提供的工具名为 `search_orders`，模型可能会调用错误的名称或模拟操作。

```
## Tool Availability

Use only the tools that are explicitly provided in the current tool list.

Do not invent, assume, or simulate tools. If a tool is mentioned in the instructions but is not present in the tool list, treat it as unavailable.

If the user requests an action that requires an unavailable tool:

1. Do not pretend to complete the action.
2. Briefly explain that the tool is not available.
3. Offer the closest supported next step.

Only say an action was completed after the relevant tool call succeeds.
```

使用附录中的提示词审计元提示来检查生产提示词中的矛盾、缺失工具和脆弱指令。

## 处理静音和背景音频

语音代理倾向于默认回应。在生产中，它们经常听到不应该收到口头回应的音频，如静音、背景噪音、等待音乐、电视音频或旁边的对话。

当助手应该保持安静并继续监听时，使用无操作等待工具。该工具给模型一个有效的非说话动作，而不是让它说"我在这里"或"我没听清"之类的话。

工具设计：

```
{
  "name": "wait_for_user",
  "description": "Call this when the latest audio does not need a spoken response, such as silence, background noise, hold music, TV audio, side conversation, or speech not addressed to the assistant. This tool helps end the turn without a spoken reply.",
  "parameters": {
    "type": "object",
    "properties": {},
    "required": []
  }
}
```

配合提示词指令：

```
## Handling Silence and Background Noise

If the latest audio is silence, background noise, hold music, TV audio, side conversation, or speech not addressed to you, call `wait_for_user`.

Do not respond conversationally after calling this tool.

Do not say "I'm here," "I didn't catch that," "Take your time," or "Let me know when you're ready."

Resume normal responses only when the user clearly addresses you or asks for help.
```

这用于非定向音频，而不是用于不清晰的用户请求。如果用户明显在对助手说话但内容无法理解，应该请求澄清。

## 有意识地使用消息通道

`gpt-realtime-2` 可以在评论通道中产生用户可见的中间消息，在最终通道中产生面向用户的最终回复。当行为取决于出现位置时，使用通道特定的指令。

| 通道 | 用户可见？ | 用途 |
| --- | --- | --- |
| `commentary` | 是 | 前导语和工具调用。 |
| `final` | 是 | 最终面向用户的消息。 |

例如，工具调用发生在评论通道中。如果你想让助手在工具使用之前、期间或之后说些什么，请指定与评论通道相关的行为。

```
Before calling tools in the commentary channel, briefly tell the user what you are doing.
```

`gpt-realtime-2` 可以在单个回合中发出多个响应阶段。在 API 输出中，这种区别由 `response.done` 事件表示，其中包含一个 `phase` 值，指示内容是评论还是最终答案。

你可以使用此字段在应用程序中以不同方式处理每个阶段。例如，评论可以作为简短的中间更新播放或显示，而 `final_answer` 可以保留给助手的完整回复。

```
response.output[0].phase: "commentary"
response.output[1].phase: "final_answer"
```

响应阶段示例

用户提示：

> "我在这道 AP 生物题上卡住了 \[QUESTION\]。"

简化的 API 响应：

```
{
  "type": "response.done",
  "response": {
    "output": [
      {
        "phase": "commentary",
        "content": [
          {
            "type": "output_audio",
            "transcript": "Let's zero in on the enzyme's shape and binding, since that's the key idea here."
          }
        ]
      },
      {
        "phase": "final_answer",
        "content": [
          {
            "type": "output_audio",
            "transcript": "What changes at the active site at high temperature?"
          }
        ]
      }
    ]
  }
}
```

## 处理不清晰的音频

模型应该只对它能自信理解的音频采取行动。如果音频不清晰，模型应该提出简短的澄清问题而不是猜测。

不要让模型推断缺失的词语、调用工具、捕获实体、生成前导语或花费隐藏的推理时间来重建用户可能说了什么。

```
## Unclear Audio

- Only respond to clear audio or text.
- If the user's audio is not clear, ask for clarification using a short English phrase such as "Sorry, could you repeat that clearly?"
- Don't repeat the same unclear-audio clarification twice.
- Treat audio as unclear if it is ambiguous, noisy, silent, unintelligible, partially cut off, or if you are unsure of the exact words the user said.
- Do not guess what the user meant from unclear audio.
- Do not reason when the audio is unclear.
- Do not provide a preamble or call tools in the commentary channel when the audio is unclear.
```

示例：

> 用户音频："查一下订单三一-" \[被截断\]

不好的做法：

> 助手：我现在来查订单 31。

好的做法：

> 助手：我只听到了订单号的一部分。你能逐位重复一下吗？

## 捕获精确实体

许多实时工作流依赖于精确值：订单 ID、追踪号、电子邮件地址、确认码、账户号、理赔号、工单 ID、支持参考号和电话号码。

语音使这变得困难。用户说话快、以不同方式分组数字、拼写部分值、使用填充语、在说话中途自我更正，或发出听起来相似的字符。一个错误的数字就可能导致查询失败或检索到错误的账户。

保守地捕获实体。一次收集一个值，只规范化清晰的内容，在工具调用前确认高精度值，并使每次更正都可恢复。

### 一次收集一个实体

当工作流需要多个值时，一次收集一个。这可以防止字段混在一起，特别是在语音对话中。

```
## Entity Collection Order

Collect required values one at a time.

- Ask for only the next missing value.
- Do not ask for multiple values in the same turn.
- Before asking, check whether the value was already provided earlier in the conversation or the session.
- If a possible value already exists, confirm it with the user before using it.

Example:

"I see tracking number ABC-54321 from earlier. Should I use that one, or do you have a different tracking number?"

Do not call tools until the current value has been collected, validated, and confirmed.
```

### 处理逐字拼读的字符

当用户逐字拼读 ID、代码、名称或电子邮件地址时使用此方法。口述形式是输入，不是最终值。

```
## Spelled-Out Characters

When a user dictates an ID, code, or email character by character, treat the spoken sequence as one compact value. Preserve explicitly spoken separators like dash, dot, underscore, slash, or plus; otherwise do not add spaces or separators.

Examples:

- "A B C one two three" -> "ABC123"
- "B C dash nine eight seven" -> "BC-987"
- "J O H N at example dot com" -> "john@example.com"

Do not insert spaces between spelled-out characters unless the user explicitly says the value contains spaces.
```

### 谨慎规范化口述数字

对于数字标识符，用户可能逐个说出数字、分组或使用自然数字短语。如果字段期望一个连续的数字值，将清晰的数字语音转换为数字。

```
## Spoken Number Handling

Convert spoken numbers into digits when collecting numeric identifiers.

Examples:

- "one two three four" -> "1234"
- "one twenty three" -> "123"
- "one nineteen" -> "119"
- "ninety nine eleven" -> "9911"
- "nine thousand nine hundred eleven" -> "9911"

If multiple interpretations are plausible, ask the user to clarify before using the value.

Example:

"I heard either 119 or 1-19. Could you repeat the number digit by digit?"
```

### 在工具调用前确认精确标识符

订单 ID、追踪号、账户号、理赔号、确认码和类似标识符是高精度字段。在工具调用中使用它们之前进行确认。

对于数字标识符，逐位读回值。将值作为完整数字读出可能会隐藏错误。

示例：

> 助手：确认一下，我听到的是 8… 3… 5… 2… 1。对吗？

如果用户更正了一个字符或数字，在调用工具前重复完整的更正值。

示例：

> 助手：明白了。我这里是 8… 3… 5… 7… 1。对吗？

```
## Exact Identifier Confirmation

Before calling tools with high-precision identifiers:

- Confirm the final normalized value with the user.
- Read numeric identifiers back digit by digit.
- Do not use guessed, partial, or ambiguous values.
- If the user corrects the value, repeat the full corrected value before calling the tool.
```

### 逐字确认电子邮件

电子邮件地址是重要的值。点、破折号、下划线、重复字母和发音相似的名称可能导致账户查询失败或将消息发送到错误的地址。

要求用户拼写电子邮件地址：

> 助手：你能逐字拼写电子邮件地址吗？这样我可以确保完全正确。

读回时，确认确切的最终地址：

> 助手：确认一下，是 c-h-e-n at example dot com，对吗？

```
## Email Confirmation

Email addresses must be captured exactly.

If the user says the email naturally without spelling it out, ask them to repeat it character by character.

Example:

"Could you spell the email address character by character so I can make sure I have it exactly right?"

When reading an email back, confirm the exact final email address.

Example:

"Just to confirm, that is c-h-e-n at example dot com, right?"
```

### 实体收集工作流

实体收集工作流示例

当任务在任何工具调用之前需要精确值时，使用此完整工作流。

```
## Entity Collection Workflow

When a workflow requires an exact value, collect and confirm it before using it in any tool call.

Exact values include order IDs, tracking numbers, confirmation codes, account numbers, claim numbers, ticket IDs, support references, email addresses, phone numbers, and similar identifiers.

Follow this workflow:

1. Collect the next required value.

- Ask for only one missing value at a time.
- Do not ask for multiple exact values in the same turn.
- Before asking, check whether the value was already provided earlier in the conversation or session.

2. Normalize only what is clear.

- Convert clearly spoken digits or spelled-out characters into the expected format.
- Preserve explicit separators such as dashes, dots, underscores, slashes, and plus signs.
- Do not guess, infer, repair, or fill in unclear characters.
- If the value could be interpreted in more than one way, ask the user to repeat or clarify it.

3. Confirm the final value.

- Read back the normalized value before using it.
- For numeric identifiers, confirm digit by digit.
- For email addresses, confirm character by character when precision matters.
- Wait for a clear confirmation from the user.

4. Call the tool only after confirmation.

- Do not call lookup, account, messaging, payment, booking, or update tools with guessed, partial, ambiguous, or unconfirmed values.

5. Recover safely from corrections.

- If the user corrects any part of the value, update the value, repeat the full corrected value, and ask for confirmation again.
- Do not use the corrected value in a tool call until the user confirms the full final value.

Examples:

User: My order ID is ORD-3125B23.

A: Just to confirm, I heard O-R-D dash 3-1-2-5-B-2-3. Is that right?

User: It is 83521 - actually, the fourth digit is 7.

A: Got it. I have 8... 3... 5... 7... 1. Is that correct?

User: My email is chen@example.com.

A: Could you spell that email address character by character so I can make sure I have it exactly right?

Never call tools with guessed, partial, ambiguous, or unconfirmed exact values.
```

## 避免字面指令陷阱

`gpt-realtime-2` 比早期实时模型更字面地遵循指令。在旧模型上运行良好的提示词可能需要调整。

使用精确的语言。模型可能会优先考虑指令的确切措辞，而不是你预期的更广泛行为。宽泛或僵硬的规则可能以令人惊讶的方式主导助手的行为，特别是当多个规则重叠时。

谨慎使用约束词如 `must`、`only`、`never` 和 `always`。当行为确实需要时才使用它们，而不是作为一般强调。过度使用硬约束可能使助手变得僵硬、过于谨慎或无法处理合理的例外情况。

优先使用精确范围：

```
For write actions that modify user data, ask for confirmation before calling the tool.
```

避免宽泛范围：

```
Always ask for confirmation before doing anything.
```

宽泛版本可能会在无害的只读查询（如检查订单状态、检索可用性或读取账户信息）之前导致不必要的确认。

### 字面解释示例

字面解释陷阱示例

这个提示词太窄了：

```
When a confirmation code is provided, repeat it verbatim and wait for a clear yes.
```

用户消息：

> 我的订单 ID 是 ORD-3125B23。

可能的失败：

模型可能不会应用该规则，因为用户提供的是订单 ID，而不是确认码。预期行为对开发者来说很清楚，但指令的范围太窄了。

更安全的重写：

```
When the user provides an exact identifier, including confirmation codes, order IDs, ticket IDs, reset PINs, claim numbers, tracking numbers, or account numbers, repeat the captured value and wait for confirmation before using it in a tool call.
```

通用提示词建议：

*   优先使用明确指令而非隐含意图。
*   除非行为确实必须僵硬，否则避免不必要的约束词。
*   最小化矛盾的指导。
*   谨慎使用分层或竞争的优先级指令。
*   增量测试提示词。小的措辞变化可能产生大的行为效果。
*   从早期实时模型迁移时，预期某些提示词需要重构以获得最佳结果。

## 分别控制语言和口音

语言和口音应该分别控制。

用户的口音与其预期语言不同。用户可能用印地语、西班牙语、法语或普通话口音说英语，但仍然期望英语回复。

避免宽泛的语言指令如：

```
Mirror the user.
Respond naturally in the user's language.
Switch languages when appropriate.
Sound local.
Adapt to the user's accent.
```

这些太宽泛了。模型可能将口音、填充词、回应词或孤立的外语词解释为切换语言的理由。

### 英语语言策略

```
## Language

English is the default response language.

- Do not infer language from accent alone.
- Ignore short filler sounds, backchannels, and isolated foreign words for language detection.
- Only switch languages if the user explicitly asks or provides a substantive utterance in another language.
- If language confidence is low, ask a short clarification instead of guessing.
- Keep preambles, spoken bridges, tool-related messages, and final answers in the same language.
- Accent adaptation must not change the response language.
```

### 多语言策略

```
## Language

Default to English unless the user clearly uses another language.

Switch languages only when:

- the user explicitly asks to use another language;
- the user provides a substantive utterance in another language. A substantive utterance means the user gives a complete request, question, or correction in another language, not just a greeting, name, address, filler word, or borrowed phrase.

Do not switch languages based on:

- accent;
- pronunciation;
- filler words;
- short backchannels;
- names;
- addresses;
- isolated foreign words.

If uncertain, ask:

"Would you like me to continue in English or [LANGUAGE]?"
```

### 口音控制

`gpt-realtime-2` 可以更强地遵循口音指令，但模糊的口音提示可能导致漂移或意外的语言切换。

口音控制提示词在指定以下内容时效果最好：

*   目标口音；
*   哪些特征应保持稳定；
*   预期的节奏、重音和韵律；
*   口音适应是否应影响语言选择。

不要用：

```
Sound Australian.
```

而是用：

```
## Accent

Speak English with a light Australian accent.

- Keep the accent stable from the first word to the last.
- Use natural Australian vowel shaping, but keep speech easy to understand.
- Do not exaggerate the accent.
- Do not change response language based on the user's accent.
```

### 自定义语音

当标准语音无法可靠满足品牌、口音或角色要求时，使用 [Custom Voices](https://developers.openai.com/blog/updates-audio-models#custom-voices)。

提示词可以引导口音、节奏和表达，但不能完全替代语音设计。对于需要一致品牌语音身份或口音保真度的用例，考虑使用 [Custom Voices](https://developers.openai.com/blog/updates-audio-models#custom-voices)。

Custom Voices 仅对获批客户可用。请联系你的客户团队获取访问权限。

## 在长会话中维护状态

`gpt-realtime-2` 将实时上下文窗口从 32k 扩展到 128k token，使其更适合长会话。对于密集的双向对话，128k token 大约相当于 1-2 小时的密集原始音频上下文。这会根据工具使用、内部推理、注入的记录和其他会话细节而变化。

对于长上下文用例，`gpt-realtime-2` 在能够区分哪些信息是当前的、哪些是背景的、以及当来源冲突时应忽略什么时表现最好。不要依赖模型从原始转录或大量上下文转储中推断来源优先级。使用结构化方式。

当以大量上下文开始会话时（如检索的记录、先前对话历史、策略、摘要、账户备注或背景文档），使用结构化模式。

长会话上下文模板示例

```
## Context

### Current State

- **Current task:** [current task]
- **Latest known state:** [current value]
- **Next safe step:** [what the assistant should do next]

### Authoritative Sources

- **Fact or record:** [fact or record]
- **Source:** [tool result / active policy / verified record]
- **Status:** current
- **Retrieved:** [date/time or this turn]

### Historical or Background Sources

- **Older fact or record:** [older fact or record]
- **Source:** [prior conversation / older record / summary]
- **Status:** stale or background
- **Note:** Do not use for current decisions if it conflicts with a current source.

### Relevant Policy or Rules

- [decision rule or constraint]

### Other Context

- [potentially useful but non-authoritative background]
```

## 从早期实时模型迁移

从早期实时模型迁移时，将提示词视为行为表面，而不仅仅是要移植的文本。

1.  使用 Codex 或强推理模型围绕最新的 Realtime 提示词指南重构提示词。包含此提示词指南的链接，以最佳实践为迁移提供基础。
2.  将推理力度设置为 `low` 而不是默认值。仅对需要更深入规划的工作流增加。
3.  审计工具名称、参数、枚举、JSON schema 和其他设置，确保它们与预期实现匹配。
4.  移除过时的示例。为正常路径、歧义、中断、工具调用和回退行为添加简短示例。
5.  比较迁移前后的代表性对话。检查现有评估的回归并记录有意的行为变化。
6.  运行最终一致性检查。确认提示词清晰地分离了硬性要求、默认值、工具规则、安全规则和回退行为。
7.  运行评估，检查代表性失败，并迭代提示词直到目标行为可靠。

## Realtime 1.5 提示词指南

`gpt-realtime-1.5` 是 Realtime API 中的语音到语音模型。相同的 `gpt-realtime` 提示词指导适用于此模型。

语音到语音系统对于将语音作为核心 AI 接口至关重要。`gpt-realtime-1.5` 支持强大、可用的实时语音代理，能够大规模处理关键任务工作流。

与早期的实时预览模型相比，`gpt-realtime-1.5` 提供了更强的指令遵循、更可靠的工具调用、更好的语音质量和整体更流畅的体验。这些改进使得从链式方法转向真正的实时体验成为可能，减少延迟并产生听起来更自然和富有表现力的回复。

实时模型受益于不直接适用于基于文本模型的提示技术。本提示词指南从建议的提示词骨架开始，然后逐步介绍每个部分，提供实用技巧、可复制的小模式和可适应你用例的示例。

## 通用技巧

*   **不断迭代**：小的措辞变化可能决定行为的成败。
    *   示例：对于不清晰音频指令，我们将 "inaudible" 换成 "unintelligible"，改善了噪声输入处理。
*   **优先使用要点而非段落**：清晰、简短的要点优于长段落。
*   **用示例引导**：模型会密切遵循示例短语。
*   **要精确**：歧义或冲突的指令 = 类似 GPT-5 的性能下降。
*   **控制语言**：如果看到不需要的语言切换，将输出固定到目标语言。
*   **减少重复**：添加多样性规则以减少机械化的措辞。
*   **使用大写文本强调**：大写关键规则使其更突出，更容易被模型遵循。
*   **将非文本规则转换为文本**：不要写 "IF x > 3 THEN ESCALATE"，而是写 "IF MORE THAN THREE FAILURES THEN ESCALATE"。

## 提示词结构

组织你的提示词使模型更容易理解上下文并在各回合中保持一致。它也使你更容易迭代和修改有问题的部分。

*   **作用**：在系统提示词中使用清晰的、带标签的章节，使模型能找到并遵循它们。每个章节专注于一件事。
*   **如何适应**：添加特定领域的章节（如合规、品牌策略）。移除不需要的章节（如果发音没有问题则移除参考发音）。

示例

```
# Role & Objective        — who you are and what "success" means
# Personality & Tone      — the voice and style to maintain
# Context                 — retrieved context, relevant info
# Reference Pronunciations — phonetic guides for tricky words
# Tools                   — names, usage rules, and preambles
# Instructions / Rules    — do's, don'ts, and approach
# Conversation Flow       — states, goals, and transitions
# Safety & Escalation     — fallback and handoff logic
```

## 角色和目标

此章节定义代理是谁以及"完成"意味着什么。示例展示了两种不同的身份，以演示当角色和目标明确时模型会多紧密地遵循。

*   **何时使用**：模型没有采用你需要的人设、角色或任务范围。
*   **作用**：固定语音代理的身份，使其回复以该角色描述为条件。
*   **如何适应**：根据你的用例修改角色。

#### 示例（模型采用特定口音）

```
# Role & Objective
You are a Quebecois French-speaking customer service bot. Your task is to answer the user's question.
```

早期实时预览：

`gpt-realtime-1.5`：

#### 示例（模型扮演角色）

```
# Role & Objective
You are a high-energy game-show host guiding the caller to guess a secret number from 1 to 100 to win 1,000,000$.
```

早期实时预览：

`gpt-realtime-1.5`：

`gpt-realtime-1.5` 能够比早期实时预览模型更可靠地扮演指定角色。

## 个性和语气

当模仿特定个性或语气时，`gpt-realtime-1.5` 能很好地遵循指令。你可以根据用例期望来定制语音体验和表达方式。

*   **何时使用**：回复感觉平淡、过于冗长或在各回合间不一致。
*   **作用**：设置语音、简洁度和节奏，使回复听起来自然且一致。
*   **如何适应**：调整温暖度/正式度和默认长度。对于受监管领域，倾向于中性精确。添加与你用例相关的其他子章节。

#### 示例

```
# Personality & Tone
## Personality
- Friendly, calm and approachable expert customer service assistant.

## Tone
- Warm, concise, confident, never fawning.

## Length
2–3 sentences per turn.
```

#### 示例（多情感）

```
# Personality & Tone
- Start your response very happy
- Midway, change to sad
- At the end change your mood to very angry
```

`gpt-realtime-1.5`：

模型能够遵循复杂指令并在整个音频回复中在三种情感之间切换。

### 速度指令

在 Realtime API 中，`speed` 参数改变的是播放速率，而不是模型组织语音的方式。要实际听起来更快，需要添加能引导节奏的指令。

*   **何时使用**：用户想要更快的说话语音；仅靠播放速度（使用 speed 参数）无法修复说话风格。
*   **作用**：独立于客户端播放速度调整说话风格（简洁度、节奏）。
*   **如何适应**：修改速度指令以满足用例要求。

#### 示例

```
# Personality & Tone
## Personality
- Friendly, calm and approachable expert customer service assistant.

## Tone
- Warm, concise, confident, never fawning.

## Length
- 2–3 sentences per turn.

## Pacing
- Deliver your audio response fast, but do not sound rushed.
- Do not modify the content of your response, only increase speaking speed for the same response.
```

早期实时预览：

`gpt-realtime-1.5`：

通过明确的节奏指令，`gpt-realtime-1.5` 可以产生明显更快的节奏而不会听起来太匆忙。

### 语言约束

语言约束确保模型在具有挑战性的条件下（如背景噪音或多语言输入）始终以预期语言回复。

*   **何时使用**：防止在多语言或嘈杂环境中意外切换语言。
*   **作用**：将输出锁定到所选语言以防止意外的语言变化。
*   **如何适应**：将 "English" 切换为你的目标语言；或根据用例添加更复杂的指令。

#### 示例（固定为一种语言）

```
# Personality & Tone
## Personality
- Friendly, calm and approachable expert customer service assistant.

## Tone
- Warm, concise, confident, never fawning.

## Length
- 2–3 sentences per turn.

## Language
- The conversation will be only in English.
- Do not respond in any other language even if the user asks.
- If the user speaks another language, politely explain that support is limited to English.
```

以下是使用 `gpt-realtime-1.5` 应用指令后的回复。

![lang constraint en]( https://cdn.openai.com/API/docs/cookbook/assets/images/lang_constraint_en.png)

#### 示例（模型教授语言）

```
# Role & Objective
- You are a friendly, knowledgeable voice tutor for French learners.
- Your goal is to help the user improve their French speaking and listening skills through engaging conversation and clear explanations.
- Balance immersive French practice with supportive English guidance to ensure understanding and progress.

# Personality & Tone
## Personality
- Friendly, calm and approachable expert customer service assistant.

## Tone
- Warm, concise, confident, never fawning.

## Length
- 2–3 sentences per turn.

## Language
### Explanations
Use English when explaining grammar, vocabulary, or cultural context.

### Conversation
Speak in French when conducting practice, giving examples, or engaging in dialogue.
```

以下是使用 `gpt-realtime-1.5` 应用指令后的回复。

![multi language]( https://cdn.openai.com/API/docs/cookbook/assets/images/multi-language.png)

模型能够根据自定义指令从一种语言切换到另一种语言。

### 减少重复

实时模型可以密切遵循示例短语以保持品牌一致性，但可能过度使用它们，使回复听起来机械或重复。添加重复规则有助于保持多样性，同时保留清晰度和品牌声音。

*   **何时使用**：输出在各回合或会话中重复使用相同的开头、填充语或句子模式。
*   **作用**：添加多样性约束——阻止重复短语，推动同义词和替代句子结构，并保持必需的术语不变。
*   **如何适应**：调整严格度（如"不要在每 N 个回合中重复使用相同的开头"），白名单必须保留的短语（法律/合规/品牌），并在一致性重要的地方允许更紧凑的措辞。

#### 示例

```
# Personality & Tone
## Personality
- Friendly, calm and approachable expert customer service assistant.

## Tone
- Warm, concise, confident, never fawning.

## Length
- 2–3 sentences per turn.

## Language
- The conversation will be only in English.
- Do not respond in any other language even if the user asks.
- If the user speaks another language, politely explain that support is limited to English.

## Variety
- Do not repeat the same sentence twice.
- Vary your responses so they don't sound robotic.
```

以下是使用 `gpt-realtime-1.5` 应用指令**之前**的回复。模型重复相同的确认：`Got it`。

![repeat before]( https://cdn.openai.com/API/docs/cookbook/assets/images/repeat_before.png)

以下是使用 `gpt-realtime-1.5` 应用指令**之后**的回复。

![repeat after]( https://cdn.openai.com/API/docs/cookbook/assets/images/repeat_after.png)

现在模型能够变化其回复和确认，不再听起来机械化。

## 参考发音

此章节介绍如何确保模型在口语交互中正确发音重要的词语、数字、名称和术语。

*   **何时使用**：品牌名称、技术术语或地名经常被错误发音。
*   **作用**：通过语音提示提高信任度和清晰度。
*   **如何适应**：保持简短列表；听到错误时更新。

#### 示例

```
# Reference Pronunciations
When voicing these words, use the respective pronunciations:
- Pronounce "SQL" as "sequel."
- Pronounce "PostgreSQL" as "post-gress."
- Pronounce "Kyiv" as "KEE-iv."
- Pronounce "Huawei" as "HWAH-way"
```

早期实时预览：

`gpt-realtime-1.5`：

通过参考发音指令，`gpt-realtime-1.5` 可以正确地将 SQL 发音为 "sequel"。

### 字母数字发音

实时 S2S 在读回关键信息（电话、信用卡、订单 ID）时可能会模糊或合并数字/字母。明确的逐字确认可以防止误听并产生更清晰的合成。

*   **何时使用**：如果模型在捕获或读回电话号码、卡号、2FA 代码、订单 ID、序列号、地址、单元号或混合字母数字字符串时有困难。
*   **作用**：强制模型用分隔符逐字说出一个字符，然后与用户确认并在更正后重新确认。可选地使用语音消歧器来区分字母（如 "A as in Alpha"）。

#### 示例（通用指令章节）

```
# Instructions/Rules
- When reading numbers or codes, speak each character separately, separated by hyphens (e.g., 4-1-5).
- Repeat EXACTLY the provided number; do not omit any digits.
```

_提示：如果你遵循对话流提示策略，可以指定哪个对话状态需要应用字母数字发音指令。_

#### 示例（对话状态中的指令）

_（取自我们 [openai-realtime-agents](https://github.com/openai/openai-realtime-agents/blob/main/src/app/agentConfigs/customerServiceRetail/authentication.ts) 提示词的对话流）_

```
{
    "id": "3_get_and_verify_phone",
    "description": "Request phone number and verify by repeating it back.",
    "instructions": [
      "Politely request the user's phone number.",
      "Once provided, confirm it by repeating each digit and ask if it's correct.",
      "If the user corrects you, confirm AGAIN to make sure you understand.",
    ],
    "examples": [
      "I'll need some more information to access your account if that's okay. May I have your phone number, please?",
      "You said 0-2-1-5-5-5-1-2-3-4, correct?",
      "You said 4-5-6-7-8-9-0-1-2-3, correct?"
    ],
    "transitions": [{
      "next_step": "4_authentication_DOB",
      "condition": "Once phone number is confirmed"
    }]
}
```

以下是使用 `gpt-realtime-1.5` 应用指令**之前**的回复。

> Sure! The number is 55119765423. Let me know if you need anything else!

以下是使用 `gpt-realtime-1.5` 应用指令**之后**的回复。

> Sure! The number is: 5-5-1-1-1-9-7-6-5-4-2-3. Please let me know if you need anything else!

## 指令

此章节介绍指导模型解决任务、应用最佳实践和修复可能问题的提示词指导。

也许不出所料，我们推荐类似于 [GPT-4.1 最佳效果]( https://cdn.openai.com/API/docs/cookbook/examples/gpt4-1_prompting_guide) 的提示模式。

### 指令遵循

与 GPT-4.1 和 GPT-5 一样，如果指令冲突、模糊或不清晰，`gpt-realtime-1.5` 的表现会更差。

*   **何时使用**：输出偏离规则、跳过阶段或误用工具。
*   **作用**：使用 LLM 在发布前指出歧义、冲突和缺失定义。

#### **指令质量提示词（可在 ChatGPT 或 API 中使用）**

使用以下提示词配合 GPT-5 来识别你的提示词中可以修复的问题区域。

```
## Role & Objective
You are a **Prompt-Critique Expert**.
Examine a user-supplied LLM prompt and surface any weaknesses following the instructions below.


## Instructions
Review the prompt that is meant for an LLM to follow and identify the following issues:
- Ambiguity: Could any wording be interpreted in more than one way?
- Lacking Definitions: Are there any class labels, terms, or concepts that are not defined that might be misinterpreted by an LLM?
- Conflicting, missing, or vague instructions: Are directions incomplete or contradictory?
- Unstated assumptions: Does the prompt assume the model has to be able to do something that is not explicitly stated?


## Do **NOT** list issues of the following types:
- Invent new instructions, tool calls, or external information. You do not know what tools need to be added that are missing.
- Issues that you are unsure about.


## Output Format
"""
# Issues
- Numbered list; include brief quote snippets.

# Improvements
- Numbered list; provide the revised lines you would change and how you would change them.

# Revised Prompt
- Revised prompt where you have applied all your improvements surgically with minimal edits to the original prompt
"""
```

#### **提示词优化元提示词（可在 ChatGPT 或 API 中使用）**

此元提示词通过针对特定失败模式来帮助你改进基础系统提示词。提供当前提示词并描述你看到的问题，模型（GPT-5）将建议收紧约束并减少问题的改进变体。

```
Here's my current prompt to an LLM:
[BEGIN OF CURRENT PROMPT]
{CURRENT_PROMPT}
[END OF CURRENT PROMPT]

But I see this issue happening from the LLM:
[BEGIN OF ISSUE]
{ISSUE}
[END OF ISSUE]
Can you provide some variants of the prompt so that the model can better understand the constraints to alleviate the issue?
```

### 无音频或不清晰音频

有时模型认为它听到了什么并试图回应。你可以添加自定义指令告诉模型在听到不清晰音频或用户输入时如何表现。根据你的用例修改期望行为。例如，你可能希望模型重复相同的问题而不是请求澄清。

*   **何时使用**：背景噪音、部分词语或静音触发了不需要的回复。
*   **作用**：阻止虚假回复并创建优雅的澄清。
*   **如何适应**：根据用例选择是请求澄清还是重复上一个问题。

#### 示例（咳嗽和不清晰音频）

```
# Instructions/Rules
...


## Unclear audio
- Always respond in the same language the user is speaking in, if unintelligible.
- Only respond to clear audio or text.
- If the user's audio is not clear (e.g. ambiguous input/background noise/silent/unintelligible) or if you did not fully hear or understand the user, ask for clarification using {preferred_language} phrases.
```

以下是使用 `gpt-realtime-1.5` 应用指令后的回复。

在此示例中，模型在我（非常）大声的咳嗽和不清晰音频后请求澄清。

### 背景音乐或声音

偶尔，模型可能在语音生成过程中产生意外的背景音乐、哼唱、节奏噪音或类似声音的伪影。这些伪影可能降低清晰度、分散用户注意力或使助手感觉不够专业。以下指令有助于防止或显著减少这些情况。

*   **何时使用**：当你观察到实时音频回复中出现意外的音乐元素或音效时使用。
*   **作用**：引导模型避免生成这些不需要的音频伪影。
*   **如何适应**：调整指令以尝试明确抑制你遇到的特定声音模式。

#### 示例

```
# Instructions/Rules
...
- Do not include any sound effects or onomatopoeic expressions in your responses.
```

## 工具

使用此章节告诉模型如何使用你的函数和工具。明确说明何时以及何时不调用工具、要收集哪些参数、调用运行时说什么、以及如何处理错误或部分结果。

### 工具选择

`gpt-realtime-1.5` 密切遵循指令。然而，如果你的指令与模型实际可访问的内容冲突，例如在提示词中提到了未在工具列表中传递的工具，可能导致不良回复。

*   **何时使用**：提示词提到了实际上不可用的工具。
*   **作用**：审查可用工具和系统提示词以确保它们一致。

#### 示例

```
# Tools
## lookup_account(email_or_phone)
...


## check_outage(address)
...
```

我们需要确保相同的工具可用且**描述不互相矛盾**：

```
[
{
    "name": "lookup_account",
    "description": "Retrieve a customer account using either an email or phone number to enable verification and account-specific actions.",
    "parameters": {
      ...
  },
{
    "name": "check_outage",
    "description": "Check for network outages affecting a given service address and return status and ETA if applicable.",
    "parameters": {
      ...
  }
]
```

### 工具调用前导语

某些用例可以从实时模型在调用工具的同时提供音频回复中受益。这带来更好的用户体验，掩盖延迟。你可以修改示例短语以适应你的用例。

*   **何时使用**：用户需要在工具调用的同时获得即时确认；有助于掩盖延迟。
*   **作用**：在工具调用前添加简短、一致的前导语。

#### 示例

```
# Tools
- Before any tool call, say one short line like "I'm checking that now." Then call the tool immediately.
```

以下是使用 `gpt-realtime-1.5` 应用指令后的回复。

![tool proactive]( https://cdn.openai.com/API/docs/cookbook/assets/images/tool_proactive.png)

使用该指令，模型在工具调用的同时输出音频回复 "I'm checking that right now"。

#### 工具调用前导语 + 示例短语

如果你想更精确地控制模型在调用工具时输出什么类型的短语，可以在工具规格描述中添加示例短语。

#### 示例

```
tools = [
  {
    "name": "lookup_account",
    "description": "Retrieve a customer account using either an email or phone number to enable verification and account-specific actions.

Preamble sample phrases:
- For security, I'll pull up your account using the email on file.
- Let me look up your account by {email} now.
- I'm fetching the account linked to {phone} to verify access.
- One moment—I'm opening your account details."
    "parameters": {
      "..."
    }
  },
  {
    "name": "check_outage",
    "description": "Check for network outages affecting a given service address and return status and ETA if applicable.

Preamble sample phrases:
- I'll check for any outages at {service_address} right now.
- Let me look up network status for your area.
- I'm checking whether there's an active outage impacting your address.
- One sec—verifying service status and any posted ETA.",
    "parameters": {
      "..."
    }
  }
]
```

### 无需确认的工具调用

有时模型可能在工具调用前请求确认。对于某些用例，这可能导致糟糕的最终用户体验，因为模型不够主动。

*   **何时使用**：代理在明显的工具调用前请求许可。
*   **作用**：移除不必要的确认循环。

#### 示例

```
# Tools
- When calling a tool, do not ask for any user confirmation. Be proactive
```

以下是使用 `gpt-realtime-1.5` 应用指令**之后**的回复。

![tool no confirm]( https://cdn.openai.com/API/docs/cookbook/assets/images/tool_no_confirm.png)

在示例中，你会注意到实时模型没有产生任何回复音频；它直接调用了相应的工具。

_提示：如果你注意到模型跳得太快去调用工具，试着软化措辞。例如，将 "proactive" 等较强的术语换成更温和的词可以帮助引导模型采取更平静、不那么急切的方式。_

### 工具调用性能

随着用例变得更复杂和可用工具数量增加，明确指导模型何时使用每个工具以及同样重要的何时不使用变得至关重要。清晰的使用规则不仅提高工具调用准确性，还帮助模型在正确的时间选择正确的工具。

*   **何时使用**：模型在工具调用性能上有困难，需要明确的指令来减少误用。
*   **作用**：添加每个工具何时"使用/避免"的指令。你还可以添加工具调用序列的指令（在工具调用 A 之后，你可以调用工具调用 B 或 C）。

#### 示例

```
# Tools
- When you call any tools, you must output at the same time a response letting the user know that you are calling the tool.

## lookup_account(email_or_phone)
Use when: verifying identity or viewing plan/outage flags.
Do NOT use when: the user is clearly anonymous and only asks general questions.


## check_outage(address)
Use when: user reports connectivity issues or slow speeds.
Do NOT use when: question is billing-only.


## refund_credit(account_id, minutes)
Use when: confirmed outage > 240 minutes in the past 7 days.
Do NOT use when: outage is unconfirmed; route to Diagnose → check_outage first.


## schedule_technician(account_id, window)
Use when: repeated failures after reboot and outage status = false.
Do NOT use when: outage status = true (send status + ETA instead).


## escalate_to_human(account_id, reason)
Use when: user seems very frustrated, abuse/harassment, repeated failures, billing disputes >$50, or user requests escalation.
```

_提示：如果工具调用可能不可预测地失败，添加清晰的失败处理指令，使模型能优雅地回应。_

### 工具级别行为

你可以为特定工具微调模型的行为，而不是应用一个全局规则。例如，你可能希望 READ 工具被主动调用，而 WRITE 工具需要明确确认。

*   **何时使用**：全局的主动性、确认或前导语指令不适合每个工具。
*   **作用**：添加每个工具的行为规则，定义模型是否应立即调用工具、先确认或在调用前说前导语。

#### 示例

```
# TOOLS
- For the tools marked PROACTIVE: do not ask for confirmation from the user and do not output a preamble.
- For the tools marked as CONFIRMATION FIRST: always ask for confirmation to the user.
- For the tools marked as PREAMBLES: Before any tool call, say one short line like "I'm checking that now." Then call the tool immediately.


## lookup_account(email_or_phone) — PROACTIVE
Use when: verifying identity or accessing billing.
Do NOT use when: caller refuses to identify after second request.


## check_outage(address) — PREAMBLES
Use when: caller reports failed connection or speed lower than 10 Mbps.
Do NOT use when: purely billing OR when internet speed is above 10 Mbps.
If either condition applies, inform the customer you cannot assist and hang up.


## refund_credit(account_id, minutes) — CONFIRMATION FIRST
Use when: confirmed outage > 240 minutes in the past 7 days (credit 60 minutes).
Do NOT use when: outage unconfirmed.
Confirmation phrase: "I can issue a credit for this outage—would you like me to go ahead?"


## schedule_technician(account_id, window) — CONFIRMATION FIRST
Use when: reboot + line checks fail AND outage=false.
Windows: "10am–12pm ET" or "2pm–4pm ET".
Confirmation phrase: "I can schedule a technician to visit—should I book that for you?"


## escalate_to_human(account_id, reason) — PREAMBLES
Use when: harassment, threats, self-harm, repeated failure, billing disputes > $50, caller is frustrated, or caller requests escalation.
Preamble: "Let me connect you to a senior agent who can assist further."
```

### 工具输出格式化

某些工具输出，特别是必须逐字重复的长字符串，对模型来说可能是分布外的。在训练期间，工具输出通常看起来像带有命名字段的 JSON 对象。如果你的工具返回原始字符串并单独要求模型"精确重复"，模型可能更容易改述、截断或混入自己的前导语。

一个实用的修复方法是使工具输出看起来像正常的工具结果，并使逐字要求在机器层面明确。

*   **何时使用：** 工具返回**长或复杂的结构化内容**（多句指令、交接包、ID/链接、策略摘要、多步骤程序等），你观察到**截断、改述、丢失字段、重新排序或模型混入自己的前导语/评论**。
    
*   **作用：** 将工具输出包装在**小的、明确的 JSON 信封**中（如 `response_text` 加上 `require_repeat_verbatim`、`format` 或 `content_type` 等标志），使响应看起来更**符合分布**，预期的实现行为在**机器层面清晰**。
    
*   **如何适应：** 保持 schema **最小且稳定**。在你的 **Tools 指令**和**工具定义**旁边清楚记录预期的工具输出形状（如 "如果 `require_repeat_verbatim` 为 true，精确输出 `response_text` 且不添加其他内容"，或 "按原样渲染 `response_text`；不要从工具输出中添加、省略或重新排序字段。"）。
    

#### 示例

#### 示例：原始字符串（更容易出错）

工具返回：

```
I just sent you an email with the verification link. Please open it and click "Confirm".
```

模型有时会说：

*   "I've emailed you a verification link…"（改述）
    
*   丢掉最后一句（截断）
    
*   添加额外评论（"Can I help with anything else?"）
    

#### 示例：包装的 JSON（更符合分布，更可靠）

工具返回：

```
{
  "response_text": "I just sent you an email with the verification link. Please open it and click "Confirm".",
  "require_repeat_verbatim": true
}
```

因为这看起来像典型的工具结果（JSON 对象），模型通常更容易：

*   识别什么是"权威"内容（response\_text）
    
*   理解实现约束（require\_repeat\_verbatim）
    
*   干净地复制工具输出，不截断或添加额外评论
    

### 改述监督工具（响应者-思考者架构）

在许多语音设置中，实时模型充当响应者（对用户说话），而更强的文本模型充当思考者（做规划、策略查询、SOP 完成）。文本回复不会自动适合语音，因此响应者必须在生成音频之前将思考者的文本改述为适合音频的回复。

*   **何时使用**：当响应者在收到思考者回复后的口语输出听起来机械、太长或尴尬时。
*   **作用**：添加清晰的指令，引导响应者将思考者的文本改述为简短、自然、语音优先的回复。
*   **如何适应**：调整措辞风格、开头语和简洁度限制以匹配你的用例期望。

#### 示例

```
# Tools
## Supervisor Tool
Name: getNextResponseFromSupervisor(relevantContextFromLastUserMessage: string)


When to call:
- Any request outside the allow list.
- Any factual, policy, account, or process question.
- Any action that might require internal lookups or system changes.


When not to call:
- Simple greetings and basic chitchat.
- Requests to repeat or clarify.
- Collecting parameters for later Supervisor use:
  - phone_number for account help (getUserAccountInfo)
  - zip_code for store lookup (findNearestStore)
  - topic or keyword for policy lookup (lookupPolicyDocument)


Usage rules and preamble:
1) Say a neutral filler phrase to the user, then immediately call the tool. Approved fillers: "One moment.", "Let me check.", "Just a second.", "Give me a moment.", "Let me see.", "Let me look into that." Fillers must not imply success or failure.
2) Do not mention the "Supervisor" when responding with filler phrase.
3) relevantContextFromLastUserMessage is a one-line summary of the latest user message; use an empty string if nothing salient.
4) After the tool returns, apply Rephrase Supervisor and send your reply.


### Rephrase Supervisor
- Start with a brief conversational opener using active language, then flow into the answer (for example: "Thanks for waiting—", "Just finished checking that.", "I've got that pulled up now.").
- Keep it short: no more than 2 sentences.
- Use this template: opener + one-sentence gist + up to 3 key details + a quick confirmation or choice (for example: "Does that match what you expected?", "Want me to review options?").
- Read numbers for speech: money naturally ("$45.20" → "forty-five dollars and twenty cents"), phone numbers 3-3-4, addresses with individual digits, dates/times plainly ("August twelfth", "three-thirty p.m.").
```

以下是没有改述指令的示例：

> Assistant: Your current credit card balance is positive at 32,323,232 AUD.

以下是有改述指令的相同示例：

> Assistant: Just finished checking that—your credit card balance is thirty-two million three hundred twenty-three thousand two hundred thirty-two dollars in your favor. Your last payment was processed on August first. Does that match what you expected?

### 常用工具

`gpt-realtime-1.5` 已被训练为有效使用以下常用工具。如果你的用例需要类似行为，保持名称、签名和描述接近这些以最大化可靠性并更符合分布。

以下是模型已被训练的一些重要常用工具：

#### 示例

```
# answer(question: string)
Description: Call this when the customer asks a question that you don't have an answer to or asks to perform an action.


# escalate_to_human()
Description: Call this when a customer asks for escalation, or to talk to someone else, or expresses dissatisfaction with the call.


# finish_session()
Description: Call this when a customer says they're done with the session or doesn't want to continue. If it's ambiguous, confirm with the customer before calling.
```

## 对话流

此章节介绍如何将对话结构化为清晰的、目标驱动的阶段，使模型确切知道在每一步该做什么。它定义了每个阶段的目的、通过它的指令以及过渡到下一阶段的具体"退出条件"。这防止模型停滞、跳过步骤或提前跳转，并确保对话从问候到解决保持有序。

同样，通过将提示词组织为各种对话状态，更容易识别错误模式并更有效地迭代。

*   **何时使用**：如果对话感觉无序、在达到目标前停滞，或模型难以有效完成目标。
*   **作用**：将交互分解为具有清晰目标、指令和退出条件的阶段。
*   **如何适应**：重命名阶段以匹配你的工作流；修改每个阶段的指令以遵循你的预期行为；保持"退出条件"具体且最小化。

#### 示例

```
# Conversation Flow
## 1) Greeting
Goal: Set tone and invite the reason for calling.
How to respond:
- Identify as NorthLoop Internet Support.
- Keep the opener brief and invite the caller's goal.
- Confirm that customer is a Northloop customer
Exit to Discovery: Caller states they are a Northloop customer and mentions an initial goal or symptom.


## 2) Discover
Goal: Classify the issue and capture minimal details.
How to respond:
- Determine billing vs connectivity with one targeted question.
- For connectivity: collect the service address.
- For billing/account: collect email or phone used on the account.
Exit when: Intent and address (for connectivity) or email/phone (for billing) are known.


## 3) Verify
Goal: Confirm identity and retrieve the account.
How to respond:
- Once you have email or phone, call lookup_account(email_or_phone).
- If lookup fails, try the alternate identifier once; otherwise proceed with general guidance or offer escalation if account actions are required.
Exit when: Account ID is returned.


## 4) Diagnose
Goal: Decide outage vs local issue.
How to respond:
- For connectivity, call check_outage(address).
- If outage=true, skip local steps; move to Resolve with outage context.
- If outage=false, guide a short reboot/cabling check; confirm each step's result before continuing.
Exit when: Root cause known.


## 5) Resolve
Goal: Apply fix, credit, or appointment.
How to respond:
- If confirmed outage > 240 minutes in the last 7 days, call refund_credit(account_id, 60).
- If outage=false and issue persists after basic checks, offer "10am–12pm ET" or "2pm–4pm ET" and call schedule_technician(account_id, chosen window).
- If the local fix worked, state the result and next steps briefly.
Exit when: A fix/credit/appointment has been applied and acknowledged by the caller.


## 6) Confirm/Close
Goal: Confirm outcome and end cleanly.
How to respond:
- Restate the result and any next step (e.g., stabilization window or tech ETA).
- Invite final questions; close politely if none.
Exit when: Caller declines more help.
```

### 示例短语

示例短语充当模型的"锚定示例"。它们展示你想要的风格、简洁度和语气，而不会将其锁定在一个僵硬的回复中。

*   **何时使用**：回复缺乏你的品牌风格或不一致。
*   **作用**：提供模型可以变化的示例短语以保持自然和简洁。
*   **如何适应**：将示例替换为适合品牌的内容；保留"不要总是使用"的警告。

#### 示例

```
# Sample Phrases
- Below are sample examples that you should use for inspiration. DO NOT ALWAYS USE THESE EXAMPLES, VARY YOUR RESPONSES.

Acknowledgements: "On it." "One moment." "Good question."
Clarifiers: "Do you want A or B?" "What's the deadline?"
Bridges: "Here's the quick plan." "Let's keep it simple."
Empathy (brief): "That's frustrating—let's fix it."
Closers: "Anything else before we wrap?" "Happy to help next time."
```

_注意：如果你的语音系统最终始终只重复示例短语，导致更机械化的语音体验，试着添加多样性约束。我们已经看到这能修复该问题。_

### 对话流 + 示例短语

在不同的对话流状态中添加示例短语是一个有用的模式，可以教模型什么是好的回复：

#### 示例

```
# Conversation Flow
## 1) Greeting
Goal: Set tone and invite the reason for calling.
How to respond:
- Identify as NorthLoop Internet Support.
- Keep the opener brief and invite the caller's goal.
Sample phrases (do not always repeat the same phrases, vary your responses):
- "Thanks for calling NorthLoop Internet—how can I help today?"
- "You've reached NorthLoop Support. What's going on with your service?"
- "Hi there—tell me what you'd like help with."
Exit when: Caller states an initial goal or symptom.


## 2) Discover
Goal: Classify the issue and capture minimal details.
How to respond:
- Determine billing vs connectivity with one targeted question.
- For connectivity: collect the service address.
- For billing/account: collect email or phone used on the account.
Sample phrases (do not always repeat the same phrases, vary your responses):
- "Is this about your bill or your internet speed?"
- "What address are you using for the connection?"
- "What's the email or phone number on the account?"
Exit when: Intent and address (for connectivity) or email/phone (for billing) are known.


## 3) Verify
Goal: Confirm identity and retrieve the account.
How to respond:
- Once you have email or phone, call lookup_account(email_or_phone).
- If lookup fails, try the alternate identifier once; otherwise proceed with general guidance or offer escalation if account actions are required.
Sample phrases:
- "Thanks—looking up your account now."
- "If that doesn't pull up, what's the other contact—email or phone?"
- "Found your account. I'll take care of this."
Exit when: Account ID is returned.


## 4) Diagnose
Goal: Decide outage vs local issue.
How to respond:
- For connectivity, call check_outage(address).
- If outage=true, skip local steps; move to Resolve with outage context.
- If outage=false, guide a short reboot/cabling check; confirm each step's result before continuing.
Sample phrases (do not always repeat the same phrases, vary your responses):
- "I'm running a quick outage check for your area."
- "No outage reported—let's try a fast modem reboot."
- "Please confirm the modem lights: is the internet light solid or blinking?"
Exit when: Root cause known.


## 5) Resolve
Goal: Apply fix, credit, or appointment.
How to respond:
- If confirmed outage > 240 minutes in the last 7 days, call refund_credit(account_id, 60).
- If outage=false and issue persists after basic checks, offer "10am–12pm ET" or "2pm–4pm ET" and call schedule_technician(account_id, chosen window).
- If the local fix worked, state the result and next steps briefly.
Sample phrases (do not always repeat the same phrases, vary your responses):
- "There's been an extended outage—adding a 60-minute bill credit now."
- "No outage—let's book a technician. I can do 10am–12pm ET or 2pm–4pm ET."
- "Credit applied—you'll see it on your next bill."
Exit when: A fix/credit/appointment has been applied and acknowledged by the caller.


## 6) Confirm/Close
Goal: Confirm outcome and end cleanly.
How to respond:
- Restate the result and any next step (e.g., stabilization window or tech ETA).
- Invite final questions; close politely if none.
Sample phrases (do not always repeat the same phrases, vary your responses):
- "We're all set: [credit applied / appointment booked / service restored]."
- "You should see stable speeds within a few minutes."
- "Your technician window is 10am–12pm ET."
Exit when: Caller declines more help.
```

### 高级对话流

随着用例变得更复杂，你需要一个可扩展的结构，同时保持模型有效。关键是平衡可维护性和简单性：太多僵硬的状态可能使模型过载，损害性能并使对话感觉机械化。

更好的方法是设计减少模型感知复杂度的流程。通过以结构化但灵活的方式管理状态，你使模型更容易保持专注和响应，从而改善用户体验。

管理复杂场景的两种常见模式是：

1.  对话流作为状态机
2.  通过 session.updates 的动态对话流

#### 对话流作为状态机

将你的对话定义为编码状态和转换的 JSON 结构。这使得推理覆盖范围、识别边缘情况和跟踪变化变得容易。由于它存储为代码，你可以对其进行版本控制、差异比较和扩展。状态机还让你对对话何时以及如何从一个状态移动到另一个状态有细粒度的控制。

#### 示例

```
# Conversation States
[
  {
    "id": "1_greeting",
    "description": "Begin each conversation with a warm, friendly greeting, identifying the service and offering help.",
    "instructions": [
        "Use the company name 'Snowy Peak Boards' and provide a warm welcome.",
        "Let them know upfront that for any account-specific assistance, you'll need some verification details."
    ],
    "examples": [
      "Hello, this is Snowy Peak Boards. Thanks for reaching out! How can I help you today?"
    ],
    "transitions": [{
      "next_step": "2_get_first_name",
      "condition": "Once greeting is complete."
    }, {
      "next_step": "3_get_and_verify_phone",
      "condition": "If the user provides their first name."
    }]
  },
  {
    "id": "2_get_first_name",
    "description": "Ask for the user's name (first name only).",
    "instructions": [
      "Politely ask, 'Who do I have the pleasure of speaking with?'",
      "Do NOT verify or spell back the name; just accept it."
    ],
    "examples": [
      "Who do I have the pleasure of speaking with?"
    ],
    "transitions": [{
      "next_step": "3_get_and_verify_phone",
      "condition": "Once name is obtained, OR name is already provided."
    }]
  },
  {
    "id": "3_get_and_verify_phone",
    "description": "Request phone number and verify by repeating it back.",
    "instructions": [
      "Politely request the user's phone number.",
      "Once provided, confirm it by repeating each digit and ask if it's correct.",
      "If the user corrects you, confirm AGAIN to make sure you understand.",
    ],
    "examples": [
      "I'll need some more information to access your account if that's okay. May I have your phone number, please?",
      "You said 0-2-1-5-5-5-1-2-3-4, correct?",
      "You said 4-5-6-7-8-9-0-1-2-3, correct?"
    ],
    "transitions": [{
      "next_step": "4_authentication_DOB",
      "condition": "Once phone number is confirmed"
    }]
  },
...
```

#### 动态对话流

在此模式中，对话通过根据当前状态更新系统提示词和工具列表来实时适应。你不是一次性向模型暴露所有可能的规则和工具，而是只提供与对话当前阶段相关的内容。

当状态的结束条件满足时，你使用 session.update 进行转换，用下一阶段所需的提示词和工具替换当前的。

这种方法减少了模型的认知负荷，使其更容易处理复杂任务而不被不必要的上下文分散注意力。

#### 示例

```python
from typing import Dict, List, Literal

State = Literal["verify", "resolve"]

# Allowed transitions
TRANSITIONS: Dict[State, List[State]] = {
    "verify": ["resolve"],
    "resolve": []  # terminal
}

def build_state_change_tool(current: State) -> dict:
    allowed = TRANSITIONS[current]
    readable = ", ".join(allowed) if allowed else "no further states (terminal)"
    return {
        "type": "function",
        "name": "set_conversation_state",
        "description": (
            f"Switch the conversation phase. Current: '{current}'. "
            f"You may switch only to: {readable}. "
            "Call this AFTER exit criteria are satisfied."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "next_state": {"type": "string", "enum": allowed}
            },
            "required": ["next_state"]
        }
    }

# Minimal business tools per state
TOOLS_BY_STATE: Dict[State, List[dict]] = {
    "verify": [{
        "type": "function",
        "name": "lookup_account",
        "description": "Fetch account by email or phone.",
        "parameters": {
            "type": "object",
            "properties": {"email_or_phone": {"type": "string"}},
            "required": ["email_or_phone"]
        }
    }],
    "resolve": [{
        "type": "function",
        "name": "schedule_technician",
        "description": "Book a technician visit.",
        "parameters": {
            "type": "object",
            "properties": {
                "account_id": {"type": "string"},
                "window": {"type": "string", "enum": ["10-12 ET", "14-16 ET"]}
            },
            "required": ["account_id", "window"]
        }
    }]
}

# Short, phase-specific instructions
INSTRUCTIONS_BY_STATE: Dict[State, str] = {
    "verify": (
        "# Role & Objective\n"
        "Verify identity to access the account.\n\n"
        "# Conversation (Verify)\n"
        "- Ask for the email or phone on the account.\n"
        "- Read back digits one-by-one (e.g., '4-1-5… Is that correct?').\n"
        "Exit when: Account ID is returned.\n"
        "When exit is satisfied: call set_conversation_state(next_state=\"resolve\")."
    ),
    "resolve": (
        "# Role & Objective\n"
        "Apply a fix by booking a technician.\n\n"
        "# Conversation (Resolve)\n"
        "- Offer two windows: '10–12 ET' or '2–4 ET'.\n"
        "- Book the chosen window.\n"
        "Exit when: Appointment is confirmed.\n"
        "When exit is satisfied: end the call politely."
    )
}

def build_session_update(state: State) -> dict:
    """Return the JSON payload for a Realtime `session.update` event."""
    return {
        "type": "session.update",
        "session": {
            "instructions": INSTRUCTIONS_BY_STATE[state],
            "tools": TOOLS_BY_STATE[state] + [build_state_change_tool(state)]
        }
    }
```

## 安全与升级

对于实时语音代理，拥有可靠的升级到人工的方式通常很重要。在此章节中，你应该根据用例修改何时升级的指令。

*   **何时使用**：模型难以确定何时正确升级到人工或回退系统。
*   **作用**：定义快速、可靠的升级以及要说什么。
*   **如何适应**：插入你自己的阈值和模型必须说的内容。

#### 示例

```
# Safety & Escalation
When to escalate (no extra troubleshooting):
- Safety risk (self-harm, threats, harassment)
- User explicitly asks for a human
- Severe dissatisfaction (e.g., "extremely frustrated," repeated complaints, profanity)
- **2** failed tool attempts on the same task **or** **3** consecutive no-match/no-input events
- Out-of-scope or restricted (e.g., real-time news, financial/legal/medical advice)

What to say at the same time as calling the escalate_to_human tool (MANDATORY):
- "Thanks for your patience—I'm connecting you with a specialist now."
- Then call the tool: `escalate_to_human`

Examples that would require escalation:
- "This is the third time the reset didn't work. Just get me a person."
- "I am extremely frustrated!"
```

第一个示例展示了使用该指令的 `gpt-4o-realtime-preview-2025-06-03` 的对话回复。

![escalate 06]( https://cdn.openai.com/API/docs/cookbook/assets/images/escalate_06.png)

第二个示例展示了使用该指令的 `gpt-realtime-1.5` 的对话回复。

![escalate 07]( https://cdn.openai.com/API/docs/cookbook/assets/images/escalate_07.png)

`gpt-realtime-1.5` 能够遵循指令并更可靠地升级到人工。

## 后续步骤

*   查看早期的 [Realtime 提示词指南]( https://cdn.openai.com/API/docs/cookbook/examples/realtime_prompting_guide) 获取更多 `gpt-realtime-1.5` 示例。
*   查看 [Realtime 评估指南]( https://cdn.openai.com/API/docs/cookbook/examples/realtime_eval_guide) 来测试代表性的语音代理行为。
*   了解如何通过 [WebRTC](/guides/realtime-webrtc)、[WebSocket](/guides/realtime-websocket) 或 [SIP](/guides/realtime-sip) 连接。
*   了解 [Realtime 对话生命周期](/guides/realtime-conversations)。
*   查看 [Realtime 成本](/guides/realtime-costs)。
