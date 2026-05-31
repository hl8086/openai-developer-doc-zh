<!-- Source: https://developers.openai.com/api/docs/guides/evaluation-getting-started -->

评估（通常称为 **evals**）用于测试模型输出，以确保它们满足您指定的风格和内容标准。编写评估是构建可靠应用程序的重要组成部分。[Datasets](https://platform.openai.com/evaluation/datasets) 是 OpenAI 平台的一项功能，提供了一种快速入门评估和测试提示词的方式。

如果您需要高级功能，例如针对外部模型进行评估、希望通过 API 与评估运行交互，或者希望大规模运行评估，请考虑使用 [Evals](/api/docs/guides/evals)。

## 创建数据集

首先，在仪表板中创建一个数据集。

1.  在[评估页面](https://platform.openai.com/evaluation)上，导航到 **Datasets** 选项卡。
2.  点击右上角的 **Create** 按钮开始。
3.  在输入字段中为数据集添加名称。在本指南中，我们将数据集命名为"Investment memo generation"。
4.  添加数据。要从头开始构建数据集，请点击 **Create** 并通过我们的可视化界面开始添加数据。如果您已经有保存的提示词或包含数据的 CSV 文件，请上传它。

Your browser does not support the video tag.

我们建议将数据集作为一个动态空间使用，随着时间的推移不断扩展您的评估数据集。当您发现需要监控的边缘案例或盲点时，使用仪表板界面添加它们。

### 上传 CSV

我们有一个简单的 CSV 文件，包含公司名称及其过去几个季度的实际收入值。

Your browser does not support the video tag.

CSV 中的列可供您的提示词和评分器访问。例如，我们的 CSV 包含输入列（`company`）和真实值列（`correct_revenue`、`correct_income`），供评分器用作参考。

### 使用可视化数据界面

打开数据集后，您可以在 **Data** 选项卡中操作数据。点击单元格编辑其内容。添加行以添加更多数据。您还可以在每行右侧的溢出菜单中删除或复制行。

要保存更改，请点击右上角的 **Save** 按钮。

## 构建提示词

数据集仪表板中的选项卡允许多个提示词与相同的数据交互。

1.  要添加新的提示词，请点击 **Add prompt**。
    
    数据集设计为与您的 OpenAI [prompts](/api/docs/guides/prompt-engineering#reusable-prompts) 配合使用。如果您已在 OpenAI 平台上保存了提示词，您可以从下拉菜单中选择它并在此界面中进行更改。要保存提示词更改，请点击 **Save**。
    
    我们的提示词使用版本控制系统，因此您可以安全地进行更新。点击 **Save** 会创建提示词的新版本，您可以在 OpenAI 平台的任何地方引用或使用它。
    
2.  在提示词面板中，使用提供的字段和设置来控制推理调用：
    

*   点击右上角的滑块图标来控制模型的 [`temperature`](/api/docs/api-reference/responses/create#responses-create-temperature) 和 [`top_p`](/api/docs/api-reference/responses/create#responses-create-top_p)。
*   添加工具，使您的推理调用能够访问网络、使用 MCP 或完成其他工具调用操作。
*   添加变量。提示词和您的[评分器](#adding-graders)都可以引用这些变量。
*   直接输入系统消息，或点击铅笔图标让模型根据您提供的基本说明帮助生成提示词。

在我们的示例中，我们将添加 [web search](/api/docs/guides/tools-web-search) 工具，以便模型调用可以从互联网获取财务数据。在变量列表中，我们将添加 `company`，以便提示词可以引用数据集中的公司列。对于提示词，我们将通过告诉模型"generate a financial report"来生成一个。

## 生成和标注输出

设置好数据和提示词后，您就可以生成输出了。模型的输出让您了解模型如何使用您提供的提示词和工具执行任务。然后您将标注输出，以便模型随着时间的推移改善其性能。

Your browser does not support the video tag.

1.  在右上角，点击 **Generate output**。
    
    您将看到数据集中出现一个新的特殊 **output** 列，开始填充结果。此列包含在数据集中每一行上运行提示词的结果。
    
2.  生成的输出准备好后，对其进行标注。通过点击 **output**、**rating** 或 **output\_feedback** 列打开标注视图。
    
    您可以根据需要标注多少就标注多少。数据集设计为适用于任何程度和类型的标注，但您提供的信息质量越高，结果就越好。
    

### 标注的作用

标注是评估和改进模型输出的关键部分。好的标注：

*   作为期望模型行为的真实值，即使对于高度特定的案例——包括主观元素，如风格和语气
*   提供信息密集的上下文，支持自动提示词改进（通过我们的提示词优化器）
*   能够诊断提示词的不足之处，特别是在细微或不常见的情况下
*   帮助确保评分器与您的意图一致

您可以选择标注多少就标注多少。数据集设计为适用于任何程度和类型的标注，但您提供的信息质量越高，结果就越好。此外，如果您不是数据集内容方面的专家，我们建议由领域专家执行标注——这是将他们的专业知识纳入优化过程的最有价值的方式。探索[我们的 cookbook](/cookbook/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel) 了解更多关于我们发现的使用评估来提高提示词韧性的最有效方法。

### 标注起点

以下是一些可以用来入门的标注类型：

*   好/坏评级，表示您对输出的判断
*   在 **output\_feedback** 部分的文本评论
*   您在右上角 **Columns** 下拉菜单中添加的自定义标注类别

### 纳入专家标注

如果您不是数据集内容方面的专家，请让领域专家执行标注。这是将专业知识纳入优化过程的最佳方式。探索[我们的 cookbook](/cookbook/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel) 了解更多。

## 添加评分器

虽然标注是将人类反馈纳入评估过程的最有效方式，但评分器让您能够大规模运行评估。评分器是自动化评估，可以根据其类型产生各种输入。

| **类型** | **详情** | **用例** |
| --- | --- | --- |
| **String check** | 使用精确字符串匹配将模型输出与参考进行比较 | 检查您的响应是否与真实值列完全匹配 |
| **Text similarity** | 使用嵌入计算模型输出与参考之间的语义相似度 | 当不需要精确匹配时，检查您的响应与真实值参考的接近程度 |
| **Score model grader** | 使用 LLM 分配数值分数 | 在数值量表上衡量主观属性，如友好程度 |
| **Label model grader** | 使用 LLM 选择分类标签 | 根据固定标签对响应进行分类，如"简洁"或"冗长" |
| **Python code execution** | 运行自定义 Python 代码以编程方式计算结果 | 检查输出是否少于 50 个词 |

Your browser does not support the video tag.

1.  在右上角，导航到 Grade > **New grader**。
2.  从下拉菜单中选择评分器类型，并填写表单来组合您的评分器。
3.  引用数据集中的列来与真实值进行对比检查。
4.  创建评分器。
5.  添加至少一个评分器后，使用 **Grade** 下拉菜单在数据集上运行特定评分器或所有评分器。运行完成后，您将在数据集中看到每个评分器的专用列中的通过/失败评级。

保存数据集后，评分器会在您更改数据集和提示词时持续存在，使其成为快速评估提示词或模型参数更改是否带来改进，或者添加边缘案例是否揭示提示词不足的好方法。数据集仪表板支持多个选项卡，用于同时跟踪多个提示词变体的自动评分器结果。

了解更多关于我们的[评分器](/api/docs/guides/graders)。

## 后续步骤

数据集非常适合快速迭代。当您准备好跟踪长期性能或大规模运行时，将数据集导出到 [Eval](/api/docs/guides/evals)。Evals 异步运行，支持更大的数据量，并让您跨版本监控性能。

如需更多灵感，请访问 [OpenAI Cookbook](/cookbook/topic/evals)，其中包含示例代码和第三方资源链接，或了解更多关于我们的评估工具：

[Cookbook: Building resilient prompts with evals - 使用评估操作持续改进的飞轮。](https://cookbook.openai.com/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel)

[Working with evals - 针对外部模型进行评估、通过 API 与评估交互等。](/api/docs/guides/evals)

[Prompt optimizer - 使用您的数据集自动改进提示词。](/api/docs/guides/prompt-optimizer)

[Graders - 构建复杂的评分器以提高评估的有效性。](/api/docs/guides/graders)
