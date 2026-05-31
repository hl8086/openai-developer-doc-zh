
Code Interpreter 工具允许模型在沙盒环境中编写和运行 Python 代码，以解决数据分析、编程和数学等领域的复杂问题。用途包括：

*   处理具有多种数据和格式的文件
*   生成包含数据和图表图像的文件
*   迭代编写和运行代码来解决问题——例如，模型编写的代码运行失败时，可以不断重写并运行该代码直到成功
*   增强我们最新推理模型（如 [o3](/models/o3) 和 [o4-mini](/models/o4-mini)）的视觉智能。模型可以使用此工具裁剪、缩放、旋转以及以其他方式处理和变换图像。

以下是使用 Code Interpreter 工具调用 [Responses API]( https://developers.openai.com/api/reference/responses) 的示例：

**使用 Responses API 配合 Code Interpreter**

::: code-group
```curl
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4.1",
    "tools": [{
      "type": "code_interpreter",
      "container": { "type": "auto", "memory_limit": "4g" }
    }],
    "instructions": "You are a personal math tutor. When asked a math question, write and run code using the python tool to answer the question.",
    "input": "I need to solve the equation 3x + 11 = 14. Can you help me?"
  }'
```

::: code-group
```javascript
import OpenAI from "openai";
const client = new OpenAI();

const instructions = `
You are a personal math tutor. When asked a math question,
write and run code using the python tool to answer the question.
`;

const resp = await client.responses.create({
  model: "gpt-4.1",
  tools: [
    {
      type: "code_interpreter",
      container: { type: "auto", memory_limit: "4g" },
    },
  ],
  instructions,
  input: "I need to solve the equation 3x + 11 = 14. Can you help me?",
});

console.log(JSON.stringify(resp.output, null, 2));
```

```python
from openai import OpenAI

client = OpenAI()

instructions = """
You are a personal math tutor. When asked a math question,
write and run code using the python tool to answer the question.
"""

resp = client.responses.create(
    model="gpt-4.1",
    tools=[
        {
            "type": "code_interpreter",
            "container": {"type": "auto", "memory_limit": "4g"}
        }
    ],
    instructions=instructions,
    input="I need to solve the equation 3x + 11 = 14. Can you help me?",
)

print(resp.output)
```

:::

:::

虽然我们将此工具称为 Code Interpreter，但模型将其识别为"python tool"。模型通常能理解引用 code interpreter 工具的提示，但最明确的调用方式是在提示中要求使用"the python tool"。

## 容器

Code Interpreter 工具需要一个[容器对象]( https://developers.openai.com/api/reference/containers/object)。容器是一个完全沙盒化的虚拟机，模型可以在其中运行 Python 代码。该容器可以包含您上传的文件或模型生成的文件。

创建容器有两种方式：

1.  自动模式：如上面的示例所示，您可以在创建新 Response 对象时，在工具配置中传递 `"container": { "type": "auto", "memory_limit": "4g", "file_ids": ["file-1", "file-2"] }` 属性。这会自动创建一个新容器，或复用模型上下文中先前 `code_interpreter_call` 项使用的活跃容器。省略 `memory_limit` 将保持容器的默认 1 GB 层级。查看此 API 请求输出中的 `code_interpreter_call` 项，可以找到生成或使用的 `container_id`。
2.  显式模式：在此模式下，您使用 `v1/containers` 端点显式[创建容器]( https://developers.openai.com/api/reference/containers/createContainers)，包括所需的 `memory_limit`（例如 `"memory_limit": "4g"`），然后将其 `id` 作为 Response 对象中工具配置的 `container` 值。例如：

**使用显式容器创建**

::: code-group
```curl
curl https://api.openai.com/v1/containers \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "name": "My Container",
        "memory_limit": "4g"
      }'

# Use the returned container id in the next call:
curl https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4.1",
    "tools": [{
      "type": "code_interpreter",
      "container": "cntr_abc123"
    }],
    "tool_choice": "required",
    "input": "use the python tool to calculate what is 4 * 3.82. and then find its square root and then find the square root of that result"
  }'
```

::: code-group
```python
from openai import OpenAI
client = OpenAI()

container = client.containers.create(name="test-container", memory_limit="4g")

response = client.responses.create(
    model="gpt-4.1",
    tools=[{
        "type": "code_interpreter",
        "container": container.id
    }],
    tool_choice="required",
    input="use the python tool to calculate what is 4 * 3.82. and then find its square root and then find the square root of that result"
)

print(response.output_text)
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const container = await client.containers.create({ name: "test-container", memory_limit: "4g" });

const resp = await client.responses.create({
    model: "gpt-4.1",
    tools: [
      {
        type: "code_interpreter",
        container: container.id
      }
    ],
    tool_choice: "required",
    input: "use the python tool to calculate what is 4 * 3.82. and then find its square root and then find the square root of that result"
});

console.log(resp.output_text);
```

:::

:::

您可以从 `1g`（默认）、`4g`、`16g` 或 `64g` 中选择。更高的层级为会话提供更多 RAM，并按 Code Interpreter 的[内置工具费率](/pricing#built-in-tools)计费。所选的 `memory_limit` 在容器的整个生命周期内有效，无论是自动创建还是通过容器 API 创建。

请注意，使用自动模式创建的容器也可以通过 [`/v1/containers`]( https://developers.openai.com/api/reference/containers) 端点访问。

### 过期

我们强烈建议您将容器视为临时性的，并将与此工具使用相关的所有数据存储在您自己的系统上。过期详情：

*   容器在 20 分钟未使用后会过期。发生这种情况时，在 `v1/responses` 中使用该容器将失败。您仍然可以看到容器过期时的元数据快照，但与容器关联的所有数据将从我们的系统中丢弃且不可恢复。您应该在容器活跃时下载所需的任何文件。
*   您无法将容器从过期状态恢复为活跃状态。相反，请创建一个新容器并重新上传文件。请注意，旧容器内存中的任何状态（如 Python 对象）都将丢失。
*   任何容器操作（如检索容器、向容器添加或删除文件）都会自动刷新容器的 `last_active_at` 时间。

## 处理文件

运行 Code Interpreter 时，模型可以创建自己的文件。例如，如果您要求它构建一个图表或创建一个 CSV 文件，它会直接在您的容器上创建这些图像。当它这样做时，会在下一条消息的 `annotations` 中引用这些文件。以下是一个示例：

```
{
  "id": "msg_682d514e268c8191a89c38ea318446200f2610a7ec781a4f",
  "content": [
    {
      "annotations": [
        {
          "file_id": "cfile_682d514b2e00819184b9b07e13557f82",
          "index": null,
          "type": "container_file_citation",
          "container_id": "cntr_682d513bb0c48191b10bd4f8b0b3312200e64562acc2e0af",
          "end_index": 0,
          "filename": "cfile_682d514b2e00819184b9b07e13557f82.png",
          "start_index": 0
        }
      ],
      "text": "Here is the histogram of the RGB channels for the uploaded image. Each curve represents the distribution of pixel intensities for the red, green, and blue channels. Peaks toward the high end of the intensity scale (right-hand side) suggest a lot of brightness and strong warm tones, matching the orange and light background in the image. If you want a different style of histogram (e.g., overall intensity, or quantized color groups), let me know!",
      "type": "output_text",
      "logprobs": []
    }
  ],
  "role": "assistant",
  "status": "completed",
  "type": "message"
}
```

您可以通过调用[获取容器文件内容]( https://developers.openai.com/api/reference/container-files/retrieveContainerFileContent)方法来下载这些生成的文件。

[模型输入中的文件](/guides/file-inputs)会自动上传到容器。您无需显式将其上传到容器。

### 上传和下载文件

使用[创建容器文件]( https://developers.openai.com/api/reference/container-files/createContainerFile)向容器添加新文件。此端点接受多部分上传或包含 `file_id` 的 JSON 正文。使用[列出容器文件]( https://developers.openai.com/api/reference/container-files/listContainerFiles)列出现有容器文件，使用[检索容器文件内容]( https://developers.openai.com/api/reference/container-files/retrieveContainerFileContent)下载字节数据。

### 处理引用

模型生成的文件和图像作为助手消息的注释返回。`container_file_citation` 注释指向在容器中创建的文件。它们包含 `container_id`、`file_id` 和 `filename`。您可以解析这些注释以显示下载链接或以其他方式处理文件。

### 支持的文件

| 文件格式 | MIME 类型 |
| --- | --- |
| `.c` | `text/x-c` |
| `.cs` | `text/x-csharp` |
| `.cpp` | `text/x-c++` |
| `.csv` | `text/csv` |
| `.doc` | `application/msword` |
| `.docx` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| `.html` | `text/html` |
| `.java` | `text/x-java` |
| `.json` | `application/json` |
| `.md` | `text/markdown` |
| `.pdf` | `application/pdf` |
| `.php` | `text/x-php` |
| `.pptx` | `application/vnd.openxmlformats-officedocument.presentationml.presentation` |
| `.py` | `text/x-python` |
| `.py` | `text/x-script.python` |
| `.rb` | `text/x-ruby` |
| `.tex` | `text/x-tex` |
| `.txt` | `text/plain` |
| `.css` | `text/css` |
| `.js` | `text/javascript` |
| `.sh` | `application/x-sh` |
| `.ts` | `application/typescript` |
| `.csv` | `application/csv` |
| `.jpeg` | `image/jpeg` |
| `.jpg` | `image/jpeg` |
| `.gif` | `image/gif` |
| `.pkl` | `application/octet-stream` |
| `.png` | `image/png` |
| `.tar` | `application/x-tar` |
| `.xlsx` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| `.xml` | `application/xml or "text/xml"` |
| `.zip` | `application/zip` |

## 使用说明

| API 可用性 | 速率限制 | 备注 |
| --- | --- | --- |
| [Responses]( https://developers.openai.com/api/reference/responses)[Chat Completions]( https://developers.openai.com/api/reference/chat)[Assistants]( https://developers.openai.com/api/reference/assistants) | 每个组织 100 RPM | [定价](/pricing#built-in-tools)  
[ZDR 和数据驻留](/guides/your-data) |
