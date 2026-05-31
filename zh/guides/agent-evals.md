
OpenAI 平台提供了一套评估工具，帮助你确保智能体（Agent）表现一致且准确。

使用本页面作为决策参考，了解哪些评估方式对智能体工作流最为重要。

## 在调试行为阶段先从 Trace 开始

Trace 评分是识别工作流级别问题的最快方式。一个 Trace 捕获了单次运行中模型调用、工具调用、护栏和交接的端到端记录。评分器（Grader）允许你使用结构化标准对这些 Trace 进行评分，从而大规模发现回归和故障模式。

当你想回答以下问题时，使用 Trace 评分：

*   智能体是否选择了正确的工具？
*   交接是否在应该发生时发生了？
*   工作流是否违反了指令或安全策略？
*   提示词或路由变更是否改善了端到端行为？

### Trace 评分工作流

1.  在仪表板中打开 **Logs** > **Traces**。
2.  检查来自 Agent Builder 或启用了 Tracing 的 SDK 应用的代表性工作流 Trace。
3.  创建评分器并针对选定的 Trace 运行。
4.  使用结果来优化提示词、工具接口、路由逻辑或护栏。

对于代码优先的 SDK 工作流，请先参阅[集成与可观测性](/guides/agents/integrations-observability#tracing)以获取高信号 Trace，然后再正式定义评分器。

## 当需要可重复性时转向数据集和评估运行

一旦你知道"好"是什么样子，就从单个 Trace 转向可重复的数据集和评估运行。当你想要对变更进行基准测试、比较提示词或随时间进行更大规模的评估时，这是正确的步骤。

如果你需要高级功能，例如针对外部模型的评估、评估 API 或更大规模的批量评估，请将 [Evals](/guides/evals) 与数据集结合使用。

## 相关评估资源

[评估入门：数据集 - 使用评估构建持续改进的飞轮。](/guides/evaluation-getting-started)

[使用 Evals - 针对外部模型进行评估、通过 API 与 Evals 交互等。](/guides/evals)

[提示词优化器 - 使用你的数据集自动改进提示词。](/guides/prompt-optimizer)

[Cookbook：使用评估构建弹性提示词 - 使用评估构建持续改进的飞轮。](https://cookbook.openai.com/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel)
