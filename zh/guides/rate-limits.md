
速率限制是我们的 API 对用户或客户端在指定时间段内访问我们服务的次数施加的限制。

## 为什么我们有速率限制？

速率限制是 API 的常见做法，设置速率限制有以下几个原因：

*   **它们有助于防止 API 被滥用或误用。** 例如，恶意行为者可能会向 API 发送大量请求，试图使其过载或导致服务中断。通过设置速率限制，OpenAI 可以防止此类活动。
*   **速率限制有助于确保每个人都能公平地访问 API。** 如果一个人或组织发出过多的请求，可能会拖慢其他所有人的 API 速度。通过限制单个用户可以发出的请求数量，OpenAI 确保尽可能多的人有机会使用 API 而不会遇到速度变慢的问题。
*   **速率限制可以帮助 OpenAI 管理其基础设施的总体负载。** 如果对 API 的请求急剧增加，可能会给服务器带来压力并导致性能问题。通过设置速率限制，OpenAI 可以帮助为所有用户维持流畅一致的体验。

请完整阅读本文档，以更好地了解 OpenAI 的速率限制系统如何工作。我们提供了代码示例和处理常见问题的可能解决方案。我们还在下面的使用层级部分详细说明了您的速率限制如何自动提升。

## 这些速率限制如何工作？

速率限制使用以下指标：**RPM**（每分钟请求数）、**RPD**（每天请求数）、**TPM**（每分钟令牌数）、**TPD**（每天令牌数）、**IPM**（每分钟图片数），以及某些流式音频模型的每分钟音频分钟数。速率限制可能会在任何一个选项上被触发，取决于哪个先达到。例如，您可能向 ChatCompletions 端点发送了 20 个请求，每个请求只有 100 个令牌，这就会达到您的限制（如果您的 RPM 为 20），即使您在这 20 个请求中没有发送 150k 个令牌（如果您的 TPM 限制为 150k）。

[Batch API]( https://developers.openai.com/api/reference/batch/create) 队列限制是根据给定模型排队的输入令牌总数计算的。待处理批量作业中的令牌会计入您的队列限制。一旦批量作业完成，其令牌将不再计入该模型的限制。

其他值得注意的重要事项：

*   速率限制是在[组织级别](/guides/production-best-practices)和项目级别定义的，而不是用户级别。
*   速率限制因使用的[模型](/models)而异。
*   对于像 GPT-4.1 这样的长上下文模型，长上下文请求有单独的速率限制。您可以在[开发者控制台](https://platform.openai.com/settings/organization/limits)中查看这些速率限制。
*   还对组织每月在 API 上的总支出设置了限制。这些也称为"使用限制"。
*   某些模型系列具有共享速率限制。在您的[组织限制页面](https://platform.openai.com/settings/organization/limits)中"共享限制"下列出的所有模型共享一个速率限制。例如，如果列出的共享 TPM 为 3.5M，则对给定"共享限制"列表中任何模型的所有调用都将计入该 3.5M。
*   向量存储的摄取也按向量存储 ID 进行速率限制。`/vector_stores/{vector_store_id}/files` 和 `/vector_stores/{vector_store_id}/file_batches` 对每个向量存储共享每分钟 300 个请求的限制。对于较大的摄取，建议使用 `/vector_stores/{vector_store_id}/file_batches`。

## 使用层级

您可以在账户设置的[限制](https://platform.openai.com/settings/organization/limits)部分查看您组织的速率和使用限制。随着您在我们 API 上的支出增加，我们会自动将您升级到下一个使用层级。这通常会导致大多数模型的速率限制增加。

| 层级 | 资格条件 | 使用限制 |
| --- | --- | --- |
| Free | 用户必须在[允许的地理区域](/supported-countries)内 | $100 / 月 |
| Tier 1 | 已支付 $5 | $100 / 月 |
| Tier 2 | 已支付 $50 | $500 / 月 |
| Tier 3 | 已支付 $100 | $1,000 / 月 |
| Tier 4 | 已支付 $250 | $5,000 / 月 |
| Tier 5 | 已支付 $1,000 | $200,000 / 月 |

要查看每个模型的速率限制高级摘要，请访问[模型页面](/models)。

### 响应头中的速率限制

除了在[账户页面](https://platform.openai.com/settings/organization/limits)上查看您的速率限制外，您还可以在 HTTP 响应的头部中查看有关速率限制的重要信息，例如剩余请求数、令牌数和其他元数据。

您可以看到以下头部字段：

| 字段 | 示例值 | 描述 |
| --- | --- | --- |
| x-ratelimit-limit-requests | 60 | 在耗尽速率限制之前允许的最大请求数。 |
| x-ratelimit-limit-tokens | 150000 | 在耗尽速率限制之前允许的最大令牌数。 |
| x-ratelimit-remaining-requests | 59 | 在耗尽速率限制之前剩余的允许请求数。 |
| x-ratelimit-remaining-tokens | 149984 | 在耗尽速率限制之前剩余的允许令牌数。 |
| x-ratelimit-reset-requests | 1s | 速率限制（基于请求）重置到初始状态的时间。 |
| x-ratelimit-reset-tokens | 6m0s | 速率限制（基于令牌）重置到初始状态的时间。 |

### 微调速率限制

您组织的微调速率限制也可以[在仪表板中找到](https://platform.openai.com/settings/organization/limits)，也可以通过 API 获取：

```
curl https://api.openai.com/v1/fine_tuning/model_limits \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

## 错误缓解

### 我可以采取哪些步骤来缓解这个问题？

OpenAI Cookbook 有一个 [Python notebook]( https://cdn.openai.com/API/docs/cookbook/examples/how_to_handle_rate_limits)，解释了如何避免速率限制错误，以及一个示例 [Python 脚本](https://github.com/openai/openai-cookbook/blob/main/examples/api_request_parallel_processor.py)，用于在批量处理 API 请求时保持在速率限制之下。

您还应该在提供程序化访问、批量处理功能和自动社交媒体发布时谨慎行事——考虑仅为受信任的客户启用这些功能。

为了防止自动化和大量滥用，请为单个用户在指定时间范围内（每天、每周或每月）设置使用限制。考虑为超出限制的用户实施硬性上限或手动审核流程。

#### 使用指数退避重试

避免速率限制错误的一种简单方法是使用随机指数退避自动重试请求。使用指数退避重试意味着在遇到速率限制错误时执行短暂的休眠，然后重试未成功的请求。如果请求仍然不成功，则增加休眠时间并重复该过程。这将持续进行，直到请求成功或达到最大重试次数。这种方法有很多好处：

*   自动重试意味着您可以从速率限制错误中恢复，而不会崩溃或丢失数据
*   指数退避意味着您的前几次重试可以快速尝试，同时如果前几次重试失败，仍然可以受益于更长的延迟
*   在延迟中添加随机抖动有助于避免所有重试同时发生。

请注意，不成功的请求会计入您的每分钟限制，因此持续重新发送请求是行不通的。

以下是一些使用指数退避的 **Python** 示例解决方案。

示例 1：使用 Tenacity 库

Tenacity 是一个 Apache 2.0 许可的通用重试库，用 Python 编写，旨在简化为几乎任何事物添加重试行为的任务。要为您的请求添加指数退避，您可以使用 `tenacity.retry` 装饰器。下面的示例使用 `tenacity.wait_random_exponential` 函数为请求添加随机指数退避。

**使用 Tenacity 库**

```python
from openai import OpenAI
client = OpenAI()

from tenacity import (
retry,
stop_after_attempt,
wait_random_exponential,
) # for exponential backoff

@retry(wait=wait_random_exponential(min=1, max=60), stop=stop_after_attempt(6))
def completion_with_backoff(**kwargs):
return client.completions.create(**kwargs)

completion_with_backoff(model="gpt-4o-mini", prompt="Once upon a time,")
```

请注意，Tenacity 库是第三方工具，OpenAI 不对其可靠性或安全性做任何保证。

示例 2：使用 backoff 库

另一个提供退避和重试函数装饰器的 Python 库是 [backoff](https://pypi.org/project/backoff/)：

**使用 backoff 库**

```python
import backoff
import openai
from openai import OpenAI
client = OpenAI()

@backoff.on_exception(backoff.expo, openai.RateLimitError)
def completions_with_backoff(**kwargs):
return client.completions.create(**kwargs)

completions_with_backoff(model="gpt-4o-mini", prompt="Once upon a time,")
```

与 Tenacity 一样，backoff 库是第三方工具，OpenAI 不对其可靠性或安全性做任何保证。

示例 3：手动退避实现

如果您不想使用第三方库，可以按照以下示例实现自己的退避逻辑：

**使用手动退避实现**

```python
# imports
import random
import time

import openai
from openai import OpenAI
client = OpenAI()

# define a retry decorator

def retry_with_exponential_backoff(
func,
initial_delay: float = 1,
exponential_base: float = 2,
jitter: bool = True,
max_retries: int = 10,
errors: tuple = (openai.RateLimitError,),
):
"""Retry a function with exponential backoff."""

    def wrapper(*args, **kwargs):
        # Initialize variables
        num_retries = 0
        delay = initial_delay

        # Loop until a successful response or max_retries is hit or an exception is raised
        while True:
            try:
                return func(*args, **kwargs)

            # Retry on specific errors
            except errors as e:
                # Increment retries
                num_retries += 1

                # Check if max retries has been reached
                if num_retries > max_retries:
                    raise Exception(
                        f"Maximum number of retries ({max_retries}) exceeded."
                    )

                # Increment the delay
                delay *= exponential_base * (1 + jitter * random.random())

                # Sleep for the delay
                time.sleep(delay)

            # Raise exceptions for any errors not specified
            except Exception as e:
                raise e

    return wrapper

@retry_with_exponential_backoff
def completions_with_backoff(**kwargs):
return client.completions.create(**kwargs)
```

同样，OpenAI 不对此解决方案的安全性或效率做任何保证，但它可以作为您自己解决方案的良好起点。

#### 减少 `max_tokens` 以匹配您的补全大小

您的速率限制是根据 `max_tokens` 的最大值和基于请求字符数估算的令牌数来计算的。尝试将 `max_tokens` 值设置为尽可能接近您预期的响应大小。

#### 批量请求

如果您的用例不需要即时响应，您可以使用 [Batch API](/guides/batch) 更轻松地提交和执行大量请求集合，而不会影响您的同步请求速率限制。

对于_确实_需要同步响应的用例，OpenAI API 对**每分钟请求数**和**每分钟令牌数**有单独的限制。

如果您达到了每分钟请求数的限制，但每分钟令牌数仍有可用容量，您可以通过将多个任务批量放入每个请求中来增加吞吐量。这将允许您每分钟处理更多令牌，特别是对于我们较小的模型。

发送一批提示的工作方式与普通 API 调用完全相同，只是您将字符串列表传递给 prompt 参数，而不是单个字符串。[在 Batch API 指南中了解更多](/guides/batch)。
