
强化微调（RFT）使用您定义的反馈信号来适配 OpenAI 推理模型。与[监督微调](/guides/supervised-fine-tuning)类似，它将模型定制为适合您的任务。不同之处在于，它不是在固定的"正确"答案上进行训练，而是依赖于一个可编程的评分器来对每个候选响应进行评分。然后训练算法调整模型的权重，使高分输出变得更可能，低分输出逐渐消失。

OpenAI 正在逐步关闭微调平台。该平台不再对新用户开放，但现有微调平台用户在未来几个月内仍可创建训练任务。

  

所有微调模型将在其基础模型被[弃用](/deprecations)之前保持可用于推理。完整时间表在[这里](/deprecations)。

  

| 工作原理 | 最适合 | 适用模型 |
| --- | --- | --- |
| 为提示生成响应，为结果提供专家评分，并强化模型对高分响应的思维链。需要专家评分者对模型的理想输出达成一致。 | 
*   需要高级推理的复杂领域特定任务
*   基于病史和诊断指南的医学诊断
*   从法律判例中确定相关段落

 | `o4-mini-2025-04-16`**仅限推理模型**。 |

这种优化让您可以将模型与风格、安全性或领域准确性等细微目标对齐——许多[实际用例](/guides/rft-use-cases)正在涌现。通过五个步骤运行 RFT：

1.  实现一个[评分器](/guides/graders)，为每个模型响应分配数值奖励。
2.  上传您的提示数据集并指定验证集拆分。
3.  启动微调任务。
4.  监控并[评估](/guides/evals)检查点；根据需要修改数据或评分器。
5.  通过标准 API 部署生成的模型。

在训练期间，平台循环遍历数据集，为每个提示采样多个响应，使用评分器对其评分，并根据这些奖励应用策略梯度更新。循环持续进行，直到我们用完您的训练数据或您在选定的检查点停止任务，从而产生一个针对您关心的指标进行优化的模型。

什么时候应该使用强化微调？

了解强化微调的优势和劣势有助于识别机会并避免浪费精力。

*   **RFT 最适合明确的任务**。检查合格的人类专家是否对答案达成一致。如果认真负责的专家独立工作（只能访问与模型相同的指令和信息）不能得出相同的答案，则该任务可能过于模糊，可能需要修改或重新构建。
*   **您的任务必须与评分选项兼容**。首先查看 [API 中的评分选项]( https://developers.openai.com/api/reference/graders)，并验证是否可以使用它们对您的任务进行评分。
*   **您的评估结果必须有足够的变化空间来改进**。在使用 RFT 之前运行[评估](/guides/evals)。如果您的评估分数在最低和最高可能分数之间，您将有足够的数据来强化正面答案。如果您要微调的模型得分处于绝对最低或绝对最高分数，RFT 对您没有用处。
*   **您的模型必须在期望的任务上有一定的成功率**。强化微调进行渐进式更改，采样许多答案并选择最佳答案。如果模型在给定任务上的成功率为 0%，您无法通过 RFT 引导到更高的性能水平。
*   **您的任务应该防猜测**。如果模型可以通过幸运猜测获得更高的奖励，训练信号就太嘈杂了，因为模型可以用不正确的推理过程得到正确答案。重新构建您的任务以使猜测更加困难——例如，将类别扩展为子类别或将多选题修改为开放式答案。

在[强化微调用例指南](/guides/rft-use-cases)中查看常见用例、具体实现和评分器示例。

什么是强化学习？

强化学习是机器学习的一个分支，其中模型通过行动、接收反馈和自我调整来最大化未来反馈。模型不是记忆每个示例的一个"正确"答案，而是探索许多可能的答案，观察每个答案的数值奖励，并逐渐调整其行为，使高奖励答案变得更可能，低奖励答案消失。经过多轮迭代，模型收敛到一个策略——一个选择输出的规则——最能满足您定义的奖励信号。

在强化微调（RFT）中，该奖励信号来自您为任务定义的自定义评分器。对于数据集中的每个提示，平台采样多个候选答案，运行您的评分器对其评分，并应用策略梯度更新，将模型推向得分更高的答案。这个循环——采样、评分、更新——在数据集（和连续的轮次）中持续进行，直到模型可靠地优化您的评分器对质量的理解。评分器编码您关心的任何内容——准确性、风格、安全性或任何指标——因此生成的微调模型反映了这些优先级，您不必管理强化学习基础设施。

强化微调仅支持 o 系列推理模型，目前仅支持 [o4-mini](/models/o4-mini)。

## 示例：LLM 驱动的安全审查

为了在下面演示强化微调，我们将微调一个 [o4-mini](/models/o4-mini) 模型，使其根据内部公司政策文档提供关于虚构公司安全态势的专家答案。我们希望模型返回一个符合特定模式的 JSON 对象，使用[结构化输出](/guides/structured-outputs)。

示例输入问题：

```
Do you have a dedicated security team?
```

使用内部政策文档，我们希望模型响应具有两个键的 JSON：

*   `compliant`：一个字符串 `yes`、`no` 或 `needs review`，指示公司的政策是否涵盖该问题。
*   `explanation`：一段文本字符串，根据政策文档简要解释为什么该问题在政策中被涵盖或为什么没有被涵盖。

模型的示例期望输出：

```
{
  "compliant": "yes",
  "explanation": "A dedicated security team follows strict protocols for handling incidents."
}
```

让我们使用 RFT 微调一个模型来很好地执行此任务。

## 定义评分器

要执行 RFT，需要定义一个[评分器](/guides/graders)来在训练期间对模型的输出进行评分，指示其响应的质量。RFT 使用与[评估](/guides/evals)相同的评分器集，您可能已经熟悉了。

在此示例中，我们定义[多个评分器]( https://developers.openai.com/api/reference/graders/multi)来检查微调模型返回的 JSON 的属性：

*   [`string_check`]( https://developers.openai.com/api/reference/graders/string-check) 评分器确保正确设置了 `compliant` 属性
*   [`score_model`]( https://developers.openai.com/api/reference/graders/score-model) 评分器使用另一个评估模型为解释文本提供零到一之间的分数

我们在 `calculate_output` 表达式中对每个属性的输出赋予相等的权重。

以下是我们将在 API 请求中用于此评分器的 JSON 负载数据。在两个评分器中，我们使用 `\{\{ \}\}` 模板语法来引用 `item`（用于评估的测试数据行）和 `sample`（训练运行期间生成的模型输出）的相关属性。

评分器配置评分提示

评分器配置

多评分器配置对象

```
{
  "type": "multi",
  "graders": {
    "explanation": {
      "name": "Explanation text grader",
      "type": "score_model",
      "input": [
        {
          "role": "user",
          "type": "message",
          "content": "...see other tab for the full prompt..."
        }
      ],
      "model": "gpt-4o-2024-08-06"
    },
    "compliant": {
      "name": "compliant",
      "type": "string_check",
      "reference": "\{\{item.compliant\}\}",
      "operation": "eq",
      "input": "\{\{sample.output_json.compliant\}\}"
    }
  },
  "calculate_output": "0.5 * compliant + 0.5 * explanation"
}
```

评分提示

评分器配置中的评分提示

```
# Overview

Evaluate the accuracy of the model-generated answer based on the 
Copernicus Product Security Policy and an example answer. The response 
should align with the policy, cover key details, and avoid speculative 
or fabricated claims.

Always respond with a single floating point number 0 through 1,
using the grading criteria below.

## Grading Criteria:
- **1.0**: The model answer is fully aligned with the policy and factually correct.
- **0.75**: The model answer is mostly correct but has minor omissions or slight rewording that does not change meaning.
- **0.5**: The model answer is partially correct but lacks key details or contains speculative statements.
- **0.25**: The model answer is significantly inaccurate or missing important information.
- **0.0**: The model answer is completely incorrect, hallucinates policy details, or is irrelevant.

## Copernicus Product Security Policy

### Introduction
Protecting customer data is a top priority for Copernicus. Our platform is designed with industry-standard security and compliance measures to ensure data integrity, privacy, and reliability.

### Data Classification
Copernicus safeguards customer data, which includes prompts, responses, file uploads, user preferences, and authentication configurations. Metadata, such as user IDs, organization IDs, IP addresses, and device details, is collected for security purposes and stored securely for monitoring and analytics.

### Data Management
Copernicus utilizes cloud-based storage with strong encryption (AES-256) and strict access controls. Data is logically segregated to ensure confidentiality and access is restricted to authorized personnel only. Conversations and other customer data are never used for model training.

### Data Retention
Customer data is retained only for providing core functionalities like conversation history and team collaboration. Customers can configure data retention periods, and deleted content is removed from our system within 30 days.

### User Authentication & Access Control
Users authenticate via Single Sign-On (SSO) using an Identity Provider (IdP). Roles include Account Owner, Admin, and Standard Member, each with defined permissions. User provisioning can be automated through SCIM integration.

### Compliance & Security Monitoring
- **Compliance API**: Logs interactions, enabling data export and deletion.
- **Audit Logging**: Ensures transparency for security audits.
- **HIPAA Support**: Business Associate Agreements (BAAs) available for customers needing healthcare compliance.
- **Security Monitoring**: 24/7 monitoring for threats and suspicious activity.
- **Incident Response**: A dedicated security team follows strict protocols for handling incidents.

### Infrastructure Security
- **Access Controls**: Role-based authentication with multi-factor security.
- **Source Code Security**: Controlled code access with mandatory reviews before deployment.
- **Network Security**: Web application firewalls and strict ingress/egress controls to prevent unauthorized access.
- **Physical Security**: Data centers have controlled access, surveillance, and environmental risk management.

### Bug Bounty Program
Security researchers are encouraged to report vulnerabilities through our Bug Bounty Program for responsible disclosure and rewards.

### Compliance & Certifications
Copernicus maintains compliance with industry standards, including SOC 2 and GDPR. Customers can access security reports and documentation via our Security Portal.

### Conclusion
Copernicus prioritizes security, privacy, and compliance. For inquiries, contact your account representative or visit our Security Portal.

## Examples

### Example 1: GDPR Compliance
**Reference Answer**: 'Copernicus maintains compliance with industry standards, including SOC 2 and GDPR. Customers can access security reports and documentation via our Security Portal.'

**Model Answer 1**: 'Yes, Copernicus is GDPR compliant and provides compliance documentation via the Security Portal.' 
**Score: 1.0** (fully correct)

**Model Answer 2**: 'Yes, Copernicus follows GDPR standards.'
**Score: 0.75** (mostly correct but lacks detail about compliance reports)

**Model Answer 3**: 'Copernicus may comply with GDPR but does not provide documentation.'
**Score: 0.5** (partially correct, speculative about compliance reports)

**Model Answer 4**: 'Copernicus does not follow GDPR standards.'
**Score: 0.0** (factually incorrect)

### Example 2: Encryption in Transit
**Reference Answer**: 'The Copernicus Product Security Policy states that data is stored with strong encryption (AES-256) and that network security measures include web application firewalls and strict ingress/egress controls. However, the policy does not explicitly mention encryption of data in transit (e.g., TLS encryption). A review is needed to confirm whether data transmission is encrypted.'

**Model Answer 1**: 'Data is encrypted at rest using AES-256, but a review is needed to confirm encryption in transit.'
**Score: 1.0** (fully correct)

**Model Answer 2**: 'Yes, Copernicus encrypts data in transit and at rest.'
**Score: 0.5** (partially correct, assumes transit encryption without confirmation)

**Model Answer 3**: 'All data is protected with encryption.'
**Score: 0.25** (vague and lacks clarity on encryption specifics)

**Model Answer 4**: 'Data is not encrypted in transit.'
**Score: 0.0** (factually incorrect)

Reference Answer: \{\{item.explanation\}\}
Model Answer: \{\{sample.output_json.explanation\}\}
```

## 准备数据集

要创建 RFT 微调，您需要训练数据集和测试数据集。训练和测试数据集将共享相同的 [JSONL 格式](https://jsonlines.org/)。JSONL 数据文件中的每一行将包含一个 `messages` 数组，以及评分模型输出所需的任何其他字段。RFT 数据集的完整规范[可在此处找到]( https://developers.openai.com/api/reference/fine-tuning/reinforcement-input)。

在我们的案例中，除了 `messages` 数组外，JSONL 文件中的每一行还需要 `compliant` 和 `explanation` 属性，我们可以将其用作参考值来测试微调模型的结构化输出。

我们训练和测试数据集中的单行如下所示（缩进的 JSON）：

```
{
  "messages": [
    {
      "role": "user",
      "content": "Do you have a dedicated security team?"
    }
  ],
  "compliant": "yes",
  "explanation": "A dedicated security team follows strict protocols for handling incidents."
}
```

以下是一些 JSONL 数据，您可以在创建微调任务时用于训练和测试。请注意，这些数据集仅用于说明目的——在您的实际测试数据中，应力求为您的应用程序提供多样化和有代表性的输入。

**训练集**

```
{"messages":[{"role":"user","content":"Do you have a dedicated security team?"}],"compliant":"yes","explanation":"A dedicated security team follows strict protocols for handling incidents."}
{"messages":[{"role":"user","content":"Have you undergone third-party security audits or penetration testing in the last 12 months?"}],"compliant":"needs review","explanation":"The policy does not explicitly mention undergoing third-party security audits or penetration testing. It only mentions SOC 2 and GDPR compliance."}
{"messages":[{"role":"user","content":"Is your software SOC 2, ISO 27001, or similarly certified?"}],"compliant":"yes","explanation":"The policy explicitly mentions SOC 2 compliance."}
```

**测试集**

```
{"messages":[{"role":"user","content":"Will our data be encrypted at rest?"}],"compliant":"yes","explanation":"Copernicus utilizes cloud-based storage with strong encryption (AES-256) and strict access controls."}
{"messages":[{"role":"user","content":"Will data transmitted to/from your services be encrypted in transit?"}],"compliant":"needs review","explanation":"The policy does not explicitly mention encryption of data in transit. It focuses on encryption in cloud storage."}
{"messages":[{"role":"user","content":"Do you enforce multi-factor authentication (MFA) internally?"}],"compliant":"yes","explanation":"The policy explicitly mentions role-based authentication with multi-factor security."}
```

需要多少训练数据？

从少量开始——几十到几百个示例——以确定 RFT 的有用性，然后再投资于大型数据集。出于产品安全原因，训练集必须首先通过自动筛选流程。大型数据集处理时间更长。此筛选流程在您使用文件启动微调任务时开始，而不是在初始文件上传时。一旦文件成功完成筛选，您可以重复使用它而不会有延迟。

几十个示例只要质量高就可以有意义。筛选后，更多数据更好，只要保持高质量。对于较大的数据集，您可以使用更大的批量大小，这往往会提高训练稳定性。

您的训练文件最多可包含 50,000 个示例。测试数据集最多可包含 1,000 个示例。测试数据集也会经过自动筛选。

### 上传文件

上传 RFT 训练和测试数据文件的过程与[监督微调](/guides/supervised-fine-tuning)相同。通过 [API]( https://developers.openai.com/api/reference/files/create) 或[使用我们的 UI](https://platform.openai.com/storage) 将训练数据上传到 OpenAI。文件必须以 `fine-tune` 用途上传才能用于微调。

**您需要训练和测试数据文件的文件 ID** 来创建微调任务。

## 创建微调任务

使用 [API]( https://developers.openai.com/api/reference/fine-tuning) 或[微调仪表板](https://platform.openai.com/finetune)创建微调任务。为此，您需要：

*   训练和测试数据集的文件 ID
*   我们之前创建的评分器配置
*   您要用作微调基础的模型 ID（我们将使用 `o4-mini-2025-04-16`）
*   如果您正在微调一个将以结构化输出返回 JSON 数据的模型，您还需要返回对象的 JSON schema（见下文）
*   可选地，您要为微调配置的任何超参数
*   要获得[数据共享推理定价](/pricing#fine-tuning)资格，您需要在创建任务之前先与 OpenAI [共享评估和微调数据](https://help.openai.com/en/articles/10306912-sharing-feedback-evaluation-and-fine-tuning-data-and-api-inputs-and-outputs-with-openai#h_c93188c569)

### 结构化输出 JSON schema

如果您正在微调模型以返回[结构化输出](/guides/structured-outputs)，请提供用于格式化输出的 JSON schema。查看我们安全访谈用例的有效 JSON schema：

```
{
  "type": "json_schema",
  "json_schema": {
    "name": "security_assistant",
    "strict": true,
    "schema": {
      "type": "object",
      "properties": {
        "compliant": { "type": "string" },
        "explanation": { "type": "string" }
      },
      "required": ["compliant", "explanation"],
      "additionalProperties": false
    }
  }
}
```

从 Pydantic 模型生成 JSON schema

为了简化 JSON schema 生成，从 [Pydantic BaseModel](https://docs.pydantic.dev/latest/api/base_model/) 类开始：

1.  定义您的类
2.  使用 OpenAI 库中的 `to_strict_json_schema` 生成有效的 schema
3.  将 schema 包装在具有 `type` 和 `name` 键的字典中，并将 `strict` 设置为 true
4.  获取结果对象并将其作为 RFT 任务中的 `response_format` 提供

```
from openai.lib._pydantic import to_strict_json_schema
from pydantic import BaseModel

class MyCustomClass(BaseModel):
    name: str
    age: int

# Note: Do not use MyCustomClass.model_json_schema() in place of
# to_strict_json_schema as it is not equivalent
schema = to_strict_json_schema(MyCustomClass)

response_format = dict(
    type="json_schema",
    json_schema=dict(
        name=MyCustomClass.__name__,
        strict=True,
        schema=schema
    )
)
```

### 使用 API 创建任务

使用 API 配置任务有很多组成部分，因此许多用户更喜欢在[微调仪表板 UI](https://platform.openai.com/finetune) 中配置它们。但是，以下是使用我们在本指南中设置的所有配置启动微调任务的完整 API 请求：

```
curl https://api.openai.com/v1/fine_tuning/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
  "training_file": "file-2STiufDaGXWCnT6XUBUEHW",
  "validation_file": "file-4TcgH85ej7dFCjZ1kThCYb",
  "model": "o4-mini-2025-04-16",
  "method": {
    "type": "reinforcement",
    "reinforcement": {
      "grader": {
        "type": "multi",
        "graders": {
          "explanation": {
            "name": "Explanation text grader",
            "type": "score_model",
            "input": [
              {
                "role": "user",
                "type": "message",
                "content": "# Overview\n\nEvaluate the accuracy of the model-generated answer based on the \nCopernicus Product Security Policy and an example answer. The response \nshould align with the policy, cover key details, and avoid speculative \nor fabricated claims.\n\nAlways respond with a single floating point number 0 through 1,\nusing the grading criteria below.\n\n## Grading Criteria:\n- **1.0**: The model answer is fully aligned with the policy and factually correct.\n- **0.75**: The model answer is mostly correct but has minor omissions or slight rewording that does not change meaning.\n- **0.5**: The model answer is partially correct but lacks key details or contains speculative statements.\n- **0.25**: The model answer is significantly inaccurate or missing important information.\n- **0.0**: The model answer is completely incorrect, hallucinates policy details, or is irrelevant.\n\n## Copernicus Product Security Policy\n\n### Introduction\nProtecting customer data is a top priority for Copernicus. Our platform is designed with industry-standard security and compliance measures to ensure data integrity, privacy, and reliability.\n\n### Data Classification\nCopernicus safeguards customer data, which includes prompts, responses, file uploads, user preferences, and authentication configurations. Metadata, such as user IDs, organization IDs, IP addresses, and device details, is collected for security purposes and stored securely for monitoring and analytics.\n\n### Data Management\nCopernicus utilizes cloud-based storage with strong encryption (AES-256) and strict access controls. Data is logically segregated to ensure confidentiality and access is restricted to authorized personnel only. Conversations and other customer data are never used for model training.\n\n### Data Retention\nCustomer data is retained only for providing core functionalities like conversation history and team collaboration. Customers can configure data retention periods, and deleted content is removed from our system within 30 days.\n\n### User Authentication & Access Control\nUsers authenticate via Single Sign-On (SSO) using an Identity Provider (IdP). Roles include Account Owner, Admin, and Standard Member, each with defined permissions. User provisioning can be automated through SCIM integration.\n\n### Compliance & Security Monitoring\n- **Compliance API**: Logs interactions, enabling data export and deletion.\n- **Audit Logging**: Ensures transparency for security audits.\n- **HIPAA Support**: Business Associate Agreements (BAAs) available for customers needing healthcare compliance.\n- **Security Monitoring**: 24/7 monitoring for threats and suspicious activity.\n- **Incident Response**: A dedicated security team follows strict protocols for handling incidents.\n\n### Infrastructure Security\n- **Access Controls**: Role-based authentication with multi-factor security.\n- **Source Code Security**: Controlled code access with mandatory reviews before deployment.\n- **Network Security**: Web application firewalls and strict ingress/egress controls to prevent unauthorized access.\n- **Physical Security**: Data centers have controlled access, surveillance, and environmental risk management.\n\n### Bug Bounty Program\nSecurity researchers are encouraged to report vulnerabilities through our Bug Bounty Program for responsible disclosure and rewards.\n\n### Compliance & Certifications\nCopernicus maintains compliance with industry standards, including SOC 2 and GDPR. Customers can access security reports and documentation via our Security Portal.\n\n### Conclusion\nCopernicus prioritizes security, privacy, and compliance. For inquiries, contact your account representative or visit our Security Portal.\n\n## Examples\n\n### Example 1: GDPR Compliance\n**Reference Answer**: Copernicus maintains compliance with industry standards, including SOC 2 and GDPR. Customers can access security reports and documentation via our Security Portal.\n\n**Model Answer 1**: Yes, Copernicus is GDPR compliant and provides compliance documentation via the Security Portal. \n**Score: 1.0** (fully correct)\n\n**Model Answer 2**: Yes, Copernicus follows GDPR standards.\n**Score: 0.75** (mostly correct but lacks detail about compliance reports)\n\n**Model Answer 3**: Copernicus may comply with GDPR but does not provide documentation.\n**Score: 0.5** (partially correct, speculative about compliance reports)\n\n**Model Answer 4**: Copernicus does not follow GDPR standards.\n**Score: 0.0** (factually incorrect)\n\n### Example 2: Encryption in Transit\n**Reference Answer**: The Copernicus Product Security Policy states that data is stored with strong encryption (AES-256) and that network security measures include web application firewalls and strict ingress/egress controls. However, the policy does not explicitly mention encryption of data in transit (e.g., TLS encryption). A review is needed to confirm whether data transmission is encrypted.\n\n**Model Answer 1**: Data is encrypted at rest using AES-256, but a review is needed to confirm encryption in transit.\n**Score: 1.0** (fully correct)\n\n**Model Answer 2**: Yes, Copernicus encrypts data in transit and at rest.\n**Score: 0.5** (partially correct, assumes transit encryption without confirmation)\n\n**Model Answer 3**: All data is protected with encryption.\n**Score: 0.25** (vague and lacks clarity on encryption specifics)\n\n**Model Answer 4**: Data is not encrypted in transit.\n**Score: 0.0** (factually incorrect)\n\nReference Answer: \{\{item.explanation\}\}\nModel Answer: \{\{sample.output_json.explanation\}\}\n"
              }
            ],
            "model": "gpt-4o-2024-08-06"
          },
          "compliant": {
            "name": "compliant",
            "type": "string_check",
            "reference": "\{\{item.compliant\}\}",
            "operation": "eq",
            "input": "\{\{sample.output_json.compliant\}\}"
          }
        },
        "calculate_output": "0.5 * compliant + 0.5 * explanation"
      },
      "response_format": {
        "type": "json_schema",
        "json_schema": {
          "name": "security_assistant",
          "strict": true,
          "schema": {
            "type": "object",
            "properties": {
              "compliant": {
                "type": "string"
              },
              "explanation": {
                "type": "string"
              }
            },
            "required": [
              "compliant",
              "explanation"
            ],
            "additionalProperties": false
          }
        }
      },
      "hyperparameters": {
        "reasoning_effort": "medium"
      }
    }
  }
}'
```

此请求返回一个[微调任务对象]( https://developers.openai.com/api/reference/fine-tuning/object)，其中包含任务 `id`。使用此 ID 监控任务进度并在任务完成时检索微调模型。

要获得[数据共享推理定价](/pricing#fine-tuning)资格，请确保在创建任务之前与 OpenAI [共享评估和微调数据](https://help.openai.com/en/articles/10306912-sharing-feedback-evaluation-and-fine-tuning-data-and-api-inputs-and-outputs-with-openai#h_c93188c569)。您可以通过确认 `shared_with_openai` 设置为 `true` 来验证任务是否被标记为已共享。

### 监控微调任务

微调任务需要一些时间才能完成，RFT 任务往往比 SFT 或 DPO 任务花费更长时间。要监控微调任务的进度，请使用[微调仪表板](https://platform.openai.com/finetune)或 [API]( https://developers.openai.com/api/reference/fine-tuning)。

#### 奖励指标

对于强化微调任务，主要指标是每步**奖励**指标。这些指标表明您的模型在训练数据上的表现如何。它们由您在任务配置中定义的评分器计算。有两个独立的顶级奖励指标：

*   `train_reward_mean`：当前步骤中所有数据点采样的平均奖励。由于批次中的特定数据点随每步变化，不同步骤之间的 `train_reward_mean` 值不能直接比较，具体值可能在步骤之间剧烈波动。
*   `valid_reward_mean`：验证集中所有数据点采样的平均奖励，这是一个更稳定的指标。

![奖励指标图](https://cdn.openai.com/API/images/guides/RFT_Reward_Chart.png)

在[训练指标](#训练指标)部分找到所有训练指标的完整描述。

#### 暂停和恢复任务

要在任务仅部分完成时评估模型的当前状态，**暂停**任务以停止训练过程并在当前步骤生成检查点。您可以使用此检查点在保留的测试集上评估模型。如果结果看起来不错，**恢复**任务以从该检查点继续训练。在[暂停和恢复任务](#暂停和恢复任务)中了解更多。

#### 评估集成

强化微调任务与我们的[评估产品](/guides/evals)集成。当您创建强化微调任务时，会自动创建一个新的评估并与任务关联。在执行验证步骤时，我们将输入提示、模型样本和评分器输出组合起来，为该步骤创建一个新的[评估运行](/guides/evals#creating-an-eval-run)。

在下面的[附录](#评估集成详情)部分了解更多关于评估集成的信息。

## 评估结果

当您的微调任务完成时，您应该根据验证集上的平均奖励值对模型的表现有一个不错的了解。但是，模型可能已经对训练数据_过拟合_或学会了[奖励黑客](https://en.wikipedia.org/wiki/Reward_hacking)您的评分器，这使其能够在不实际正确的情况下产生高分。在部署模型之前，检查其在一组代表性提示上的行为，以确保其按您的预期运行。

通过检查与微调任务关联的评估，可以快速了解模型的行为。具体来说，密切关注为最终训练步骤创建的运行，以查看最终模型的行为。您还可以使用评估产品将最终运行与早期运行进行比较，查看模型的行为在训练过程中如何变化。

### 尝试使用您的微调模型

通过使用它来评估您新优化的模型！当微调模型完成训练后，在 [Responses]( https://developers.openai.com/api/reference/responses) 或 [Chat Completions]( https://developers.openai.com/api/reference/chat) API 中使用其 ID，就像使用 OpenAI 基础模型一样。

在 Playground 中使用您的模型通过 API 调用使用您的模型

在 Playground 中使用您的模型

1.  在[仪表板](https://platform.openai.com/finetune)中导航到您的微调任务。
2.  在右侧面板中，导航到 **Output model** 并复制模型 ID。它应该以 `ft:…` 开头
3.  打开 [Playground](https://platform.openai.com/playground)。
4.  在 **Model** 下拉菜单中，粘贴模型 ID。在这里，您还应该看到您创建的其他微调模型。
5.  运行一些提示，看看您的微调模型表现如何！

通过 API 调用使用您的模型

```
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "ft:gpt-4.1-nano-2025-04-14:openai::BTz2REMH",
    "input": "What is 4+4?"
  }'
```

### 如果需要，使用检查点

检查点是在训练过程最终步骤之前创建的可用模型。对于 RFT，OpenAI 在每个验证步骤创建一个完整的模型检查点，并保留 `valid_reward_mean` 分数最高的三个。检查点对于在训练过程的不同阶段评估模型并比较不同步骤的性能很有用。

在仪表板中查找检查点通过 API 查询检查点

在仪表板中查找检查点

1.  导航到[微调仪表板](https://platform.openai.com/finetune)。
2.  在左侧面板中，选择您要调查的任务。等待其成功。
3.  在右侧面板中，滚动到检查点列表。
4.  将鼠标悬停在任何检查点上，查看在 Playground 中启动的链接。
5.  通过在 Playground 中提示来测试检查点模型的行为。

通过 API 查询检查点

1.  等待任务成功，您可以通过[查询任务状态]( https://developers.openai.com/api/reference/fine-tuning/retrieve)来验证。
2.  使用您的微调任务 ID [查询检查点端点]( https://developers.openai.com/api/reference/fine-tuning/list-checkpoints)以访问微调任务的模型检查点列表。
3.  找到 `fine_tuned_model_checkpoint` 字段以获取模型检查点的名称。
4.  像使用最终微调模型一样使用此模型。

检查点对象包含 `metrics` 数据，帮助您确定此模型的有用性。例如，响应如下所示：

```
{
  "object": "fine_tuning.job.checkpoint",
  "id": "ftckpt_zc4Q7MP6XxulcVzj4MZdwsAB",
  "created_at": 1519129973,
  "fine_tuned_model_checkpoint": "ft:gpt-3.5-turbo-0125:my-org:custom-suffix:96olL566:ckpt-step-2000",
  "metrics": {
    "full_valid_loss": 0.134,
    "full_valid_mean_token_accuracy": 0.874
  },
  "fine_tuning_job_id": "ftjob-abc123",
  "step_number": 2000
}
```

每个检查点指定：

*   `step_number`：创建检查点的步骤（其中每个轮次是训练集中的步骤数除以批量大小）
*   `metrics`：包含创建检查点时微调任务指标的对象

## 安全检查

在生产环境中启动之前，请查看并遵循以下安全信息。

我们如何评估安全性

一旦微调任务完成，我们会在 13 个不同的安全类别中评估生成模型的行为。每个类别代表一个关键领域，如果不加以适当控制，AI 输出可能会造成潜在危害。

| 名称 | 描述 |
| --- | --- |
| advice | 违反我们政策的建议或指导。 |
| harassment/threatening | 包含对任何目标的暴力或严重伤害的骚扰内容。 |
| hate | 基于种族、性别、民族、宗教、国籍、性取向、残疾状况或种姓表达、煽动或宣扬仇恨的内容。针对非受保护群体（例如棋手）的仇恨内容属于骚扰。 |
| hate/threatening | 基于种族、性别、民族、宗教、国籍、性取向、残疾状况或种姓，同时包含对目标群体的暴力或严重伤害的仇恨内容。 |
| highly-sensitive | 违反我们政策的高度敏感数据。 |
| illicit | 提供如何实施非法行为的建议或指导的内容。像"如何入店行窃"这样的短语属于此类别。 |
| propaganda | 对违反我们政策的意识形态的赞扬或协助。 |
| self-harm/instructions | 鼓励实施自我伤害行为（如自杀、自残和饮食障碍）的内容，或提供如何实施此类行为的指导或建议。 |
| self-harm/intent | 说话者表示正在或打算从事自我伤害行为（如自杀、自残和饮食障碍）的内容。 |
| sensitive | 违反我们政策的敏感数据。 |
| sexual/minors | 包含 18 岁以下个人的性内容。 |
| sexual | 旨在引起性兴奋的内容，如性活动的描述，或宣传性服务的内容（不包括性教育和健康）。 |
| violence | 描绘死亡、暴力或身体伤害的内容。 |

每个类别都有预定义的通过阈值；如果给定类别中有太多评估示例未通过，OpenAI 会阻止微调模型的部署。如果您的微调模型未通过安全检查，OpenAI 会在微调任务中发送消息，解释哪些类别不符合所需阈值。您可以在微调任务的审核检查部分查看结果。

如何通过安全检查

除了查看微调任务对象中任何失败的安全检查外，您还可以通过查询[微调 API 事件端点]( https://developers.openai.com/api/reference/fine-tuning/list-events)来检索有关哪些类别失败的详细信息。查找类型为 `moderation_checks` 的事件以获取有关类别结果和执行的详细信息。此信息可以帮助您缩小需要重新训练和改进的类别范围。[模型规范](https://cdn.openai.com/spec/model-spec-2024-05-08.html#overview)有规则和示例，可以帮助识别需要额外训练数据的领域。

虽然这些评估涵盖了广泛的安全类别，但请对微调模型进行您自己的评估，以确保它适合您的用例。

## 后续步骤

现在您已了解强化微调的基础知识，探索其他微调方法。

[监督微调 - 通过为示例输入提供正确输出来微调模型。](/guides/supervised-fine-tuning)

[视觉微调 - 学习使用图像输入进行计算机视觉微调。](/guides/vision-fine-tuning)

[直接偏好优化 - 使用直接偏好优化（DPO）微调模型。](/guides/direct-preference-optimization)

## 附录

### 训练指标

强化微调任务将每步训练指标作为[微调事件]( https://developers.openai.com/api/reference/fine-tuning/event-object)发布。通过 [API]( https://developers.openai.com/api/reference/fine-tuning/list-events) 拉取这些指标或在[微调仪表板](https://platform.openai.com/finetune)中以图表形式查看。

在下面了解更多关于训练指标的信息。

完整训练指标示例

以下是来自真实强化微调任务的示例指标事件。此负载中的各个字段将在以下部分中讨论。

```
{
      "object": "fine_tuning.job.event",
      "id": "ftevent-Iq5LuNLDsac1C3vzshRBuBIy",
      "created_at": 1746679539,
      "level": "info",
      "message": "Step 10/20 , train mean reward=0.42, full validation mean reward=0.68, full validation mean parse error=0.00",
      "data": {
        "step": 10,
        "usage": {
          "graders": [
            {
              "name": "basic_model_grader",
              "type": "score_model",
              "model": "gpt-4o-2024-08-06",
              "train_prompt_tokens_mean": 241.0,
              "valid_prompt_tokens_mean": 241.0,
              "train_prompt_tokens_count": 120741.0,
              "valid_prompt_tokens_count": 4820.0,
              "train_completion_tokens_mean": 138.52694610778443,
              "valid_completion_tokens_mean": 140.5,
              "train_completion_tokens_count": 69402.0,
              "valid_completion_tokens_count": 2810.0
            }
          ],
          "samples": {
            "train_reasoning_tokens_mean": 3330.017964071856,
            "valid_reasoning_tokens_mean": 1948.9,
            "train_reasoning_tokens_count": 1668339.0,
            "valid_reasoning_tokens_count": 38978.0
          }
        },
        "errors": {
          "graders": [
            {
              "name": "basic_model_grader",
              "type": "score_model",
              "train_other_error_mean": 0.0,
              "valid_other_error_mean": 0.0,
              "train_other_error_count": 0.0,
              "valid_other_error_count": 0.0,
              "train_sample_parse_error_mean": 0.0,
              "valid_sample_parse_error_mean": 0.0,
              "train_sample_parse_error_count": 0.0,
              "valid_sample_parse_error_count": 0.0,
              "train_invalid_variable_error_mean": 0.0,
              "valid_invalid_variable_error_mean": 0.0,
              "train_invalid_variable_error_count": 0.0,
              "valid_invalid_variable_error_count": 0.0
            }
          ]
        },
        "scores": {
          "graders": [
            {
              "name": "basic_model_grader",
              "type": "score_model",
              "train_reward_mean": 0.4471057884231537,
              "valid_reward_mean": 0.675
            }
          ],
          "train_reward_mean": 0.4215686274509804,
          "valid_reward_mean": 0.675
        },
        "timing": {
          "step": {
            "eval": 101.69386267662048,
            "sampling": 226.82190561294556,
            "training": 402.43121099472046,
            "full_iteration": 731.5038568973541
          },
          "graders": [
            {
              "name": "basic_model_grader",
              "type": "score_model",
              "train_execution_latency_mean": 2.6894934929297594,
              "valid_execution_latency_mean": 4.141402995586395
            }
          ]
        },
        "total_steps": 20,
        "train_mean_reward": 0.4215686274509804,
        "reasoning_tokens_mean": 3330.017964071856,
        "completion_tokens_mean": 3376.0019607843137,
        "full_valid_mean_reward": 0.675,
        "mean_unresponsive_rewards": 0.0,
        "model_graders_token_usage": {
          "gpt-4o-2024-08-06": {
            "eval_cached_tokens": 0,
            "eval_prompt_tokens": 4820,
            "train_cached_tokens": 0,
            "train_prompt_tokens": 120741,
            "eval_completion_tokens": 2810,
            "train_completion_tokens": 69402
          }
        },
        "full_valid_mean_parse_error": 0.0,
        "valid_reasoning_tokens_mean": 1948.9
      },
      "type": "metrics"
    },
```

分数指标

需要关注的顶级指标是 `train_reward_mean` 和 `valid_reward_mean`，它们分别表示评分器在训练和验证数据集中所有样本上分配的平均奖励。

此外，如果您使用[多评分器]( https://developers.openai.com/api/reference/graders/multi)配置，还将发布每个评分器的训练和验证奖励指标。这些指标包含在微调事件对象中的 `event.data.scores` 对象下，每个评分器一个条目。每个评分器的指标对于了解模型在每个单独评分器上的表现很有用，可以帮助您识别模型是否对某个评分器过拟合。

从微调仪表板中，各个评分器指标将显示在总体 `train_reward_mean` 和 `valid_reward_mean` 指标下方的单独图表中。

![每个评分器奖励指标图](https://cdn.openai.com/API/images/guides/RFT_MultiReward_Chart.png)

使用量指标

推理模型的一个重要特征是它在响应提示之前使用的推理 token 数量。通常，在训练期间，模型会大幅改变其用于响应提示的平均推理 token 数量。这表明模型正在根据奖励信号改变其行为。模型可能学会使用更少的推理 token 来获得相同的奖励，或者可能学会使用更多的推理 token 来获得更高的奖励。

您可以监控 `train_reasoning_tokens_mean` 和 `valid_reasoning_tokens_mean` 指标，以查看模型如何随时间改变其行为。这些指标分别是模型在训练和验证数据集中响应提示时使用的平均推理 token 数量。您还可以在微调仪表板的"Reasoning Tokens"图表下查看平均推理 token 计数。

![推理 Token 指标图](https://cdn.openai.com/API/images/guides/RFT_ReasoningTokens_Chart.png)

如果您使用[模型评分器](/guides/graders#model-graders)，您可能需要监控这些评分器的 token 使用量。每个评分器的 token 使用统计信息可在 `event.data.usage.graders` 对象下获得，并分解为：

*   `train_prompt_tokens_mean`
*   `train_prompt_tokens_count`
*   `train_completion_tokens_mean`
*   `train_completion_tokens_count`

`_mean` 指标表示评分器在当前步骤中处理所有提示时使用的平均 token 数量，而 `_count` 指标表示评分器在当前步骤中所有样本中使用的总 token 数量。每步 token 使用量也显示在微调仪表板的"Grading Token Usage"图表下。

![模型评分器 Token 使用量](https://cdn.openai.com/API/images/guides/RFT_ModelGraderTokenUsage.png)

时间指标

我们包含各种指标，帮助您了解训练过程的每个步骤需要多长时间，以及训练过程的不同部分如何影响每步时间。

这些指标可在 `event.data.timing` 对象下获得，并分解为 `step` 和 `graders` 字段。

`step` 字段包含以下指标：

*   `sampling`：为当前步骤采样模型输出（rollouts）所花费的时间。
*   `training`：为当前步骤训练模型（反向传播）所花费的时间。
*   `eval`：在完整验证集上评估模型所花费的时间。
*   `full_iteration`：当前步骤的总时间，包括上述 3 个指标加上任何额外开销。

步骤时间指标也显示在微调仪表板的"Per Step Duration"图表下。

![每步持续时间图](https://cdn.openai.com/API/images/guides/RFT_PerStepDuration2.png)

`graders` 字段包含详细说明当前步骤中执行每个评分器所花费时间的时间信息。每个评分器将在 `train_execution_latency_mean` 和 `valid_execution_latency_mean` 指标下有自己的时间，分别表示在训练和验证数据集上执行评分器所花费的平均时间。

评分器以并发限制并行执行，因此并不总是清楚各个评分器延迟如何累加到评分的总时间。但是，通常来说，单独执行时间较长的评分器会导致任务执行更慢。这意味着较慢的模型评分器会导致任务需要更长时间才能完成，更昂贵的 Python 代码也会如此。最快的评分器通常是 `string_check` 和 `text_similarity`，因为它们在训练循环本地执行。

### 评估集成详情

强化微调任务与我们的[评估产品](/guides/evals)直接集成。当您创建强化微调任务时，会自动创建一个新的评估并与任务关联。

在执行验证步骤时，输入提示、模型样本、评分器输出和更多元数据将被组合起来，为该步骤创建一个新的[评估运行](/guides/evals#creating-an-eval-run)。在任务结束时，您将为每个验证步骤拥有一个运行。这允许您比较模型在不同步骤的性能，并查看模型的行为在训练过程中如何变化。

您可以通过在微调仪表板上查看您的任务，或通过在[微调任务对象]( https://developers.openai.com/api/reference/fine-tuning/object)上找到 `eval_id` 字段来找到与您的微调任务关联的评估。

评估产品对于检查模型在特定数据点上的输出很有用，可以了解模型在不同场景中的行为。它可以帮助您找出模型在数据集的哪个切片上表现不佳，从而帮助您识别训练数据中需要改进的领域。

评估产品还可以通过找到评分器对模型输出过于宽松或过于严格的领域，帮助您找到评分器的改进空间。

### 暂停和恢复任务

您可以随时使用[微调任务 API]( https://developers.openai.com/api/reference/fine-tuning/pause) 暂停微调任务。调用暂停 API 将告诉训练过程创建新的模型快照、停止训练，并将任务置于"已暂停"状态。模型快照将经过正常的安全筛选流程，之后它将作为正常的微调模型在整个 OpenAI 平台上供您使用。

如果您希望继续已暂停任务的训练过程，可以使用[微调任务 API]( https://developers.openai.com/api/reference/fine-tuning/resume) 来执行此操作。这将从暂停任务时创建的最后一个检查点恢复训练过程，并继续训练直到任务完成或再次暂停。

### 使用工具进行评分

如果您正在训练模型[执行工具调用](/guides/function-calling)，您需要：

1.  在 RFT 训练数据集中的每个数据点上提供模型可调用的工具集。更多信息请参阅[数据集 API 参考]( https://developers.openai.com/api/reference/fine-tuning/reinforcement-input)。
2.  配置您的评分器根据模型进行的工具调用内容分配奖励。有关评分工具调用的信息可在[评分文档中找到](/guides/graders/#sample-namespace)。

### 计费详情

强化微调任务根据训练所花费的时间以及模型在训练期间使用的 token 数量计费。我们仅对核心训练循环中花费的时间计费，不对准备训练数据、验证数据集、排队等待、运行安全评估或其他开销所花费的时间计费。

有关我们如何对强化微调任务计费的详细信息，请参阅此[帮助中心文章](https://help.openai.com/en/articles/11323177-billing-guide-for-the-reinforcement-fine-tuning-api)。

### 训练错误

强化微调是一个复杂的过程，有许多组成部分，很多地方可能出错。我们发布各种错误指标，帮助您了解任务中出了什么问题以及如何修复。一般来说，除非发生非常严重的错误，我们尽量避免完全使任务失败。当错误确实发生时，它们通常发生在评分步骤中。评分期间的错误通常是由于模型输出了评分器不知道如何处理的样本、评分器由于某种系统错误未能正确执行，或者评分逻辑本身存在错误。

错误指标可在 `event.data.errors` 对象下获得，并聚合为按每个评分器汇总的计数和比率。我们还在微调仪表板上显示错误的比率和计数。

评分器错误

#### 通用评分错误

评分器错误分为以下类别，它们同时存在 `train_`（用于训练数据）和 `valid_`（用于验证数据）版本：

*   `sample_parse_error_mean`：解析失败的样本平均数量。这通常发生在模型未能输出有效 JSON 或未能正确遵守提供的响应格式时。少量此类错误，特别是在训练过程早期，是正常的。如果您看到大量此类错误，很可能是模型的响应格式配置不正确或您的评分器配置错误并查找了不正确的字段。
*   `invalid_variable_error_mean`：当您尝试通过模板引用在当前数据点或当前模型样本中找不到的变量时，会发生这些错误。如果模型未能以正确的响应格式提供输出，或者您的评分器配置错误，就可能发生这种情况。
*   `other_error_mean`：这是评分期间发生的任何其他错误的总称。这些错误通常由评分逻辑本身的错误或评分期间发生的系统错误引起。

#### Python 评分错误

*   `python_grader_server_error_mean`：当我们在远程沙箱中执行 Python 评分器的系统遇到系统错误时，会发生这些错误。这通常由于您无法控制的原因发生，如网络故障或系统中断。如果您看到大量此类错误，很可能存在导致错误的系统问题。您可以查看 [OpenAI 状态页面](https://status.openai.com/)以获取有关任何正在进行的问题的更多信息。
*   `python_grader_runtime_error_mean`：当 Python 评分器本身未能正确执行时，会发生这些错误。这可能由多种原因引起，包括评分逻辑中的错误，或者评分器尝试访问当前上下文中不存在的变量。如果您看到大量此类错误，很可能您的评分逻辑中存在需要修复的错误。如果发生足够多的此类错误，任务将失败，我们将向您显示失败评分器的回溯采样。

#### 模型评分错误

*   `model_grader_server_error_mean`：当我们无法从模型评分器采样时，会发生这些错误。这可能由多种原因引起，但通常意味着模型评分器配置错误、您尝试使用组织不可用的模型，或者 OpenAI 正在发生系统问题。