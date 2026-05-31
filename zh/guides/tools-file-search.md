<!-- Source: https://developers.openai.com/api/docs/guides/tools-file-search -->

文件搜索是 [Responses API](/api/docs/api-reference/responses) 中可用的一个工具。它使模型能够通过语义搜索和关键词搜索从先前上传的文件知识库中检索信息。通过创建向量存储并将文件上传到其中，您可以通过让模型访问这些知识库或 `vector_stores` 来增强模型的固有知识。

要了解更多关于向量存储和语义搜索的工作原理，请参阅我们的[检索指南](/api/docs/guides/retrieval)。

这是一个由 OpenAI 管理的托管工具，这意味着您无需在自己的端实现代码来处理其执行。当模型决定使用它时，它会自动调用该工具，从您的文件中检索信息，并返回输出。

## 使用方法

在将文件搜索与 Responses API 一起使用之前，您需要在向量存储中设置知识库并将文件上传到其中。

创建向量存储并上传文件

按照以下步骤创建向量存储并将文件上传到其中。您可以使用[此示例文件](https://cdn.openai.com/API/docs/deep_research_blog.pdf)或上传您自己的文件。

#### 将文件上传到 File API

**上传文件**

```python
import requests
from io import BytesIO
from openai import OpenAI

client = OpenAI()

def create_file(client, file_path):
    if file_path.startswith("http://") or file_path.startswith("https://"):
        # Download the file content from the URL
        response = requests.get(file_path)
        file_content = BytesIO(response.content)
        file_name = file_path.split("/")[-1]
        file_tuple = (file_name, file_content)
        result = client.files.create(
            file=file_tuple,
            purpose="assistants"
        )
    else:
        # Handle local file path
        with open(file_path, "rb") as file_content:
            result = client.files.create(
                file=file_content,
                purpose="assistants"
            )
    print(result.id)
    return result.id

# Replace with your own file path or URL
file_id = create_file(client, "https://cdn.openai.com/API/docs/deep_research_blog.pdf")
```
```javascript
import fs from "fs";
import OpenAI from "openai";
const openai = new OpenAI();

async function createFile(filePath) {
  let result;
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    // Download the file content from the URL
    const res = await fetch(filePath);
    const buffer = await res.arrayBuffer();
    const urlParts = filePath.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const file = new File([buffer], fileName);
    result = await openai.files.create({
      file: file,
      purpose: "assistants",
    });
  } else {
    // Handle local file path
    const fileContent = fs.createReadStream(filePath);
    result = await openai.files.create({
      file: fileContent,
      purpose: "assistants",
    });
  }
  return result.id;
}

// Replace with your own file path or URL
const fileId = await createFile(
  "https://cdn.openai.com/API/docs/deep_research_blog.pdf"
);

console.log(fileId);
```

#### 创建向量存储

**创建向量存储**

```python
vector_store = client.vector_stores.create(
    name="knowledge_base"
)
print(vector_store.id)
```
```javascript
const vectorStore = await openai.vectorStores.create({
    name: "knowledge_base",
});
console.log(vectorStore.id);
```

#### 将文件添加到向量存储

**将文件添加到向量存储**

```python
result = client.vector_stores.files.create(
    vector_store_id=vector_store.id,
    file_id=file_id
)
print(result)
```
```javascript
await openai.vectorStores.files.create(
    vectorStore.id,
    {
        file_id: fileId,
    }
});
```

#### 检查状态

运行此代码直到文件准备就绪可以使用（即状态为 `completed` 时）。

**检查状态**

```python
result = client.vector_stores.files.list(
    vector_store_id=vector_store.id
)
print(result)
```
```javascript
const result = await openai.vectorStores.files.list({
    vector_store_id: vectorStore.id,
});
console.log(result);
```

一旦您的知识库设置完成，您可以在模型可用的工具列表中包含 `file_search` 工具，以及要搜索的向量存储列表。

**文件搜索工具**

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input="What is deep research by OpenAI?",
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["<vector_store_id>"]
    }]
)
print(response)
```
```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-5.5",
    input: "What is deep research by OpenAI?",
    tools: [
        {
            type: "file_search",
            vector_store_ids: ["<vector_store_id>"],
        },
    ],
});
console.log(response);
```
```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

ResponseCreationOptions options = new();
options.Tools.Add(ResponseTool.CreateFileSearchTool(["<vector_store_id>"]));

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("What is deep research by OpenAI?"),
    ]),
], options);

Console.WriteLine(response.GetOutputText());
```

当模型调用此工具时，您将收到包含多个输出的响应：

1.  一个 `file_search_call` 输出项，包含文件搜索调用的 id。
2.  一个 `message` 输出项，包含模型的响应以及文件引用。

**文件搜索响应**

```json
{
  "output": [
    {
      "type": "file_search_call",
      "id": "fs_67c09ccea8c48191ade9367e3ba71515",
      "status": "completed",
      "queries": ["What is deep research?"],
      "search_results": null
    },
    {
      "id": "msg_67c09cd3091c819185af2be5d13d87de",
      "type": "message",
      "role": "assistant",
      "content": [
        {
          "type": "output_text",
          "text": "Deep research is a sophisticated capability that allows for extensive inquiry and synthesis of information across various domains. It is designed to conduct multi-step research tasks, gather data from multiple online sources, and provide comprehensive reports similar to what a research analyst would produce. This functionality is particularly useful in fields requiring detailed and accurate information...",
          "annotations": [
            {
              "type": "file_citation",
              "index": 992,
              "file_id": "file-2dtbBZdjtDKS8eqWxqbgDi",
              "filename": "deep_research_blog.pdf"
            },
            {
              "type": "file_citation",
              "index": 992,
              "file_id": "file-2dtbBZdjtDKS8eqWxqbgDi",
              "filename": "deep_research_blog.pdf"
            },
            {
              "type": "file_citation",
              "index": 1176,
              "file_id": "file-2dtbBZdjtDKS8eqWxqbgDi",
              "filename": "deep_research_blog.pdf"
            },
            {
              "type": "file_citation",
              "index": 1176,
              "file_id": "file-2dtbBZdjtDKS8eqWxqbgDi",
              "filename": "deep_research_blog.pdf"
            }
          ]
        }
      ]
    }
  ]
}
```

## 检索自定义

### 限制结果数量

使用 Responses API 的文件搜索工具时，您可以自定义从向量存储中检索的结果数量。这可以帮助减少 token 使用量和延迟，但可能会降低回答质量。

**限制结果数量**

```python
response = client.responses.create(
    model="gpt-4.1",
    input="What is deep research by OpenAI?",
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["<vector_store_id>"],
        // highlight-start
        "max_num_results": 2
        // highlight-end
    }]
)
print(response)
```
```javascript
const response = await openai.responses.create({
    model: "gpt-4.1",
    input: "What is deep research by OpenAI?",
    tools: [{
        type: "file_search",
        vector_store_ids: ["<vector_store_id>"],
        // highlight-start
        max_num_results: 2,
        // highlight-end
    }],
});
console.log(response);
```

### 在响应中包含搜索结果

虽然您可以在输出文本中看到注释（对文件的引用），但文件搜索调用默认不会返回搜索结果。

要在响应中包含搜索结果，您可以在创建响应时使用 `include` 参数。

**包含搜索结果**

```python
response = client.responses.create(
    model="gpt-4.1",
    input="What is deep research by OpenAI?",
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["<vector_store_id>"]
    }],
    // highlight-start
    include=["file_search_call.results"]
    // highlight-end
)
print(response)
```
```javascript
const response = await openai.responses.create({
    model: "gpt-4.1",
    input: "What is deep research by OpenAI?",
    tools: [{
        type: "file_search",
        vector_store_ids: ["<vector_store_id>"],
    }],
    // highlight-start
    include: ["file_search_call.results"],
    // highlight-end
});
console.log(response);
```

### 元数据过滤

您可以根据文件的元数据过滤搜索结果。有关更多详细信息，请参阅我们的[检索指南](/api/docs/guides/retrieval)，其中涵盖：

*   如何[在向量存储文件上设置属性](/api/docs/guides/retrieval#attributes)
*   如何[定义过滤器](/api/docs/guides/retrieval#attribute-filtering)

**元数据过滤**

```python
response = client.responses.create(
    model="gpt-4.1",
    input="What is deep research by OpenAI?",
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["<vector_store_id>"],
        // highlight-start
        "filters": {
            "type": "in",
            "key": "category",
            "value": ["blog", "announcement"]
        }
        // highlight-end
    }]
)
print(response)
```
```javascript
const response = await openai.responses.create({
    model: "gpt-4.1",
    input: "What is deep research by OpenAI?",
    tools: [{
        type: "file_search",
        vector_store_ids: ["<vector_store_id>"],
        // highlight-start
        filters: {
            type: "in",
            key: "category",
            value: ["blog", "announcement"]
        }
        // highlight-end
    }]
});
console.log(response);
```

## 支持的文件

_对于 `text/` MIME 类型，编码必须是 `utf-8`、`utf-16` 或 `ascii` 之一。_

| 文件格式 | MIME 类型 |
| --- | --- |
| `.c` | `text/x-c` |
| `.cpp` | `text/x-c++` |
| `.cs` | `text/x-csharp` |
| `.css` | `text/css` |
| `.doc` | `application/msword` |
| `.docx` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| `.go` | `text/x-golang` |
| `.html` | `text/html` |
| `.java` | `text/x-java` |
| `.js` | `text/javascript` |
| `.json` | `application/json` |
| `.md` | `text/markdown` |
| `.pdf` | `application/pdf` |
| `.php` | `text/x-php` |
| `.pptx` | `application/vnd.openxmlformats-officedocument.presentationml.presentation` |
| `.py` | `text/x-python` |
| `.py` | `text/x-script.python` |
| `.rb` | `text/x-ruby` |
| `.sh` | `application/x-sh` |
| `.tex` | `text/x-tex` |
| `.ts` | `application/typescript` |
| `.txt` | `text/plain` |

## 使用说明

| API 可用性 | 速率限制 | 备注 |
| --- | --- | --- |
| [Responses](/api/docs/api-reference/responses)[Chat Completions](/api/docs/api-reference/chat)[Assistants](/api/docs/api-reference/assistants) | **Tier 1**  
100 RPM**Tier 2 和 3**  
500 RPM**Tier 4 和 5**  
1000 RPM | [定价](/api/docs/pricing#built-in-tools)  
[ZDR 和数据驻留](/api/docs/guides/your-data) |
