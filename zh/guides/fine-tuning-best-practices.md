
如果微调模型没有产生理想的结果，请考虑对流程进行以下迭代改进。

OpenAI 正在逐步关闭微调平台。该平台不再对新用户开放，但现有微调平台用户在未来几个月内仍可创建训练任务。

  

所有微调模型在其基础模型被[弃用](/deprecations)之前将继续可用于推理。完整时间线请参见[此处](/deprecations)。

### 迭代改进数据质量

以下是一些提高训练数据集质量的方法：

*   收集示例以解决剩余问题。
    *   如果模型在某些方面仍然表现不佳，请添加直接展示模型如何正确处理这些方面的训练示例。
*   仔细检查现有示例中的问题。
    *   如果模型存在语法、逻辑或风格问题，请检查您的数据是否存在相同的问题。例如，如果模型现在说"我将为您安排这次会议"（但它不应该这样说），请查看现有示例是否教导模型说它能做实际上做不到的新事情。
*   考虑数据的平衡性和多样性。
    *   如果数据中 60% 的助手回复说"我无法回答这个问题"，但在推理时只有 5% 的回复应该这样说，那么您可能会得到过多的拒绝回复。
*   确保训练示例包含回复所需的所有信息。
    *   如果我们希望模型根据用户的个人特征来称赞用户，而训练示例中包含了对前面对话中未出现的特征的称赞，模型可能会学会编造信息。
*   检查训练示例中的一致性和统一性。
    *   如果多人创建了训练数据，模型性能可能会受到人员之间一致性和统一性水平的限制。例如，在文本提取任务中，如果人们只在 70% 的提取片段上达成一致，模型可能无法做得比这更好。
*   确保所有训练示例的格式相同，与推理时预期的格式一致。

### 迭代改进数据数量

一旦您对示例的质量和分布感到满意，就可以考虑扩大训练示例的数量。这通常有助于模型更好地学习任务，特别是在可能的"边缘情况"方面。我们预计每次将训练示例数量翻倍时都会获得类似程度的改进。您可以通过以下方式粗略估计增加训练数据规模带来的预期质量提升：

*   在当前数据集上进行微调
*   在当前数据集的一半上进行微调
*   观察两者之间的质量差距

一般来说，如果您必须做出权衡，少量高质量数据通常比大量低质量数据更有效。

### 迭代改进超参数

超参数控制训练过程中模型权重的更新方式。一些常见选项包括：

*   **Epochs（训练轮次）**：一个 epoch 是模型训练期间对整个训练数据集的一次完整遍历。您通常会运行多个 epoch，以便模型可以迭代地优化其权重。
*   **Learning rate multiplier（学习率乘数）**：调整对模型学习参数所做更改的大小。较大的乘数可以加速训练，而较小的乘数可以导致更慢但更稳定的训练。
*   **Batch size（批次大小）**：模型在更新权重之前在一次前向和反向传播中处理的示例数量。较大的批次会减慢训练速度，但可能产生更稳定的结果。

我们建议最初不指定任何这些参数进行训练，让我们根据数据集大小为您选择默认值，然后在观察到以下情况时进行调整：

*   如果模型没有像预期那样遵循训练数据，请将 epoch 数增加 1 或 2。
    *   这在只有单一理想完成结果（或一小组相似的理想完成结果）的任务中更为常见。一些例子包括分类、实体提取或结构化解析。这些通常是可以根据参考答案计算最终准确率指标的任务。
*   如果模型变得不如预期那样多样化，请将 epoch 数减少 1 或 2。
    *   这在有多种可能的良好完成结果的任务中更为常见。
*   如果模型似乎没有收敛，请增加学习率乘数。

您可以按如下所示设置超参数：

**设置超参数**

::: code-group
```javascript
const fineTune = await openai.fineTuning.jobs.create({
  training_file: "file-abc123",
  model: "gpt-4o-mini-2024-07-18",
  method: {
    type: "supervised",
    supervised: {
      hyperparameters: { n_epochs: 2 },
    },
  },
});
```

```python
from openai import OpenAI
client = OpenAI()

client.fine_tuning.jobs.create(
    training_file="file-abc123",
    model="gpt-4o-mini-2024-07-18",
    method={
        "type": "supervised",
        "supervised": {
            "hyperparameters": {"n_epochs": 2},
        },
    },
)
```

:::


## 调整您的数据集

如果微调结果不理想，另一个选择是回过头来修改训练数据。以下是收集数据集示例时的一些最佳实践。

### 训练集与测试集

收集示例后，将数据集分为训练部分和测试部分。训练集用于微调任务，测试集用于[评估](/guides/evals)。

当您同时提交包含训练文件和测试文件的微调任务时，我们会在训练过程中提供两者的统计数据。这些统计数据为您提供模型改进程度的信号。尽早构建测试集有助于您通过与测试集基准进行比较来[评估训练后的模型](/guides/evals)。

### 为训练数据编写提示词

将微调前对模型效果最好的指令和提示词集合包含在每个训练示例中。这应该能让您获得最佳和最通用的结果，特别是当您的训练示例相对较少（少于 100 个）时。

您可能会想缩短每个示例中重复的指令或提示词以节省成本。如果没有重复的指令，可能需要更多的训练示例才能获得好的结果，因为模型必须完全通过示范来学习。

### 训练数据中的多轮对话

要在[多轮对话](/guides/conversation-state)上训练模型，请在训练数据每一行的 `messages` 数组中包含多个 `user` 和 `assistant` 消息。

使用可选的 `weight` 键（值设置为 0 或 1）来禁用对特定助手消息的微调。以下是在聊天格式中控制 `weight` 的一些示例：

```
{"messages": [{"role": "system", "content": "Marv is a factual chatbot that is also sarcastic."}, {"role": "user", "content": "What's the capital of France?"}, {"role": "assistant", "content": "Paris", "weight": 0}, {"role": "user", "content": "Can you be more sarcastic?"}, {"role": "assistant", "content": "Paris, as if everyone doesn't know that already.", "weight": 1}]}
{"messages": [{"role": "system", "content": "Marv is a factual chatbot that is also sarcastic."}, {"role": "user", "content": "Who wrote 'Romeo and Juliet'?"}, {"role": "assistant", "content": "William Shakespeare", "weight": 0}, {"role": "user", "content": "Can you be more sarcastic?"}, {"role": "assistant", "content": "Oh, just some guy named William Shakespeare. Ever heard of him?", "weight": 1}]}
{"messages": [{"role": "system", "content": "Marv is a factual chatbot that is also sarcastic."}, {"role": "user", "content": "How far is the Moon from Earth?"}, {"role": "assistant", "content": "384,400 kilometers", "weight": 0}, {"role": "user", "content": "Can you be more sarcastic?"}, {"role": "assistant", "content": "Around 384,400 kilometers. Give or take a few, like that really matters.", "weight": 1}]}
```

### Token 限制

Token 限制取决于模型。以下是允许的最大上下文长度概览：

| 模型 | 推理上下文长度 | 示例上下文长度 |
| --- | --- | --- |
| `gpt-4.1-2025-04-14` | 128,000 tokens | 65,536 tokens |
| `gpt-4.1-mini-2025-04-14` | 128,000 tokens | 65,536 tokens |
| `gpt-4.1-nano-2025-04-14` | 128,000 tokens | 65,536 tokens |
| `gpt-4o-2024-08-06` | 128,000 tokens | 65,536 tokens |
| `gpt-4o-mini-2024-07-18` | 128,000 tokens | 65,536 tokens |

超过默认长度的示例将被截断到最大上下文长度，从训练示例末尾移除 token。为确保整个训练示例适合上下文，请将消息内容中的总 token 数保持在限制以下。

使用 [tokenizer 工具](https://platform.openai.com/tokenizer)或通过代码计算 token 数量，如这个 [cookbook 示例]( https://cdn.openai.com/API/docs/cookbook/examples/how_to_count_tokens_with_tiktoken)所示。

在上传数据之前，您可能需要检查格式和潜在的 token 成本——如何执行此操作的示例可以在 cookbook 中找到。

[微调数据格式验证 - 了解微调数据格式](https://cookbook.openai.com/examples/chat_finetuning_data_prep)
