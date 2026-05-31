<!-- Source: https://developers.openai.com/api/docs/guides/prompt-optimizer -->

[prompt optimizer](https://platform.openai.com/chat/edit?optimize=true) 是仪表板中的一个聊天界面，您可以在其中输入提示词，我们会根据当前最佳实践对其进行优化后返回给您。将 prompt optimizer 与[数据集](/api/docs/guides/evaluation-getting-started)配合使用，是自动改进提示词的强大方式。

## 准备数据

1.  设置一个包含您要优化的提示词和评估数据集的[数据集](/api/docs/guides/evaluation-getting-started)。
2.  在数据集中创建至少三行包含响应的数据。
3.  为每一行创建至少一个评分器结果或人工标注。

prompt optimizer 可以使用数据集中的以下内容来改进您的提示词：

*   标注（Good/Bad 以及您添加的其他自定义标注列）
*   在 **output\_feedback** 中编写的文本评价
*   评分器的结果

为了获得有效的结果，请添加包含 Good/Bad 评级_以及_详细、具体评价的标注。创建能够精确捕捉您期望从提示词中获得的属性的[评分器](/api/docs/guides/evaluation-getting-started#adding-graders)。

## 优化您的提示词

准备好数据集后，创建一次优化。

1.  在提示词面板底部，点击 **Optimize**。这将创建一个新标签页用于显示优化结果，并启动一个在后台运行的优化过程。
2.  当优化后的提示词准备就绪时，查看并测试新的提示词。
3.  重复此过程。虽然单次优化运行可能就能达到您期望的结果，但可以尝试在新提示词上重复优化过程——生成输出、标注输出、运行评分器，然后再次优化。

提示词优化的效果取决于评分器的质量。我们建议为您发现提示词表现不佳的每个期望输出属性构建定义精确的评分器。

在将优化后的提示词用于生产环境之前，务必进行评估和人工审查。虽然 prompt optimizer 通常能严格提升提示词的效果，但优化后的提示词在某些特定输入上可能表现不如原始提示词。

## 后续步骤

如需更多灵感，请访问 [OpenAI Cookbook](/cookbook)，其中包含示例代码和第三方资源链接，或了解更多关于评估工具的信息：

[Cookbook: Building resilient prompts with evals - 使用评估运行持续改进的飞轮。](https://cookbook.openai.com/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel)

[Working with evals - 针对外部模型进行评估、通过 API 与评估交互等。](/api/docs/guides/evals)

[Graders - 构建复杂的评分器以提高评估的效果。](/api/docs/guides/graders)

[Fine-tuning - 提升模型生成针对您用例定制的响应的能力。](/api/docs/guides/fine-tuning)
