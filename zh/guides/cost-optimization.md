# Overview

使用 OpenAI 模型时有多种降低成本的方法。成本和延迟通常是相互关联的；减少 token 和请求数量通常会带来更快的处理速度。OpenAI 的 Batch API 和 flex processing 是额外的降低成本方式。

## 成本与延迟

要降低延迟和成本，请考虑以下策略：

*   **减少请求**：限制完成任务所需的请求数量。
*   **最小化 token**：减少输入 token 数量并优化模型输出使其更简短。
*   **选择较小的模型**：使用在降低成本和延迟的同时保持准确性的模型。

要深入了解这些内容，请参阅我们的[延迟优化](/guides/latency-optimization)指南。

## Batch API

异步处理任务。Batch API 提供了一组简单的端点，允许你将一组请求收集到单个文件中，启动批处理作业来执行这些请求，在底层请求执行时查询该批次的状态，并在批处理完成后最终检索收集的结果。

[开始使用 Batch API →](/guides/batch)

## Flex processing

以较慢的响应时间和偶尔的资源不可用为代价，获得显著更低的 Chat Completions 或 Responses 请求成本。适用于非生产环境或较低优先级的任务，如模型评估、数据丰富化或异步工作负载。

[开始使用 flex processing →](/guides/flex-processing)
