
**Retrieval API** 允许你对数据执行[**语义搜索**](#semantic-search)，这是一种能够返回语义相似结果的技术——即使结果与查询几乎没有或完全没有共同关键词。检索本身就很有用，但与我们的模型结合使用来生成回答时尤其强大。

![Retrieval depiction](https://cdn.openai.com/API/docs/images/retrieval-depiction.png)

Retrieval API 由[**向量存储**](#vector-stores)驱动，向量存储作为数据的索引。本指南将介绍如何执行语义搜索，并详细说明向量存储的相关内容。

## 快速开始

*   **创建向量存储**并上传文件。
    

**创建带文件的向量存储**

```python
from openai import OpenAI
client = OpenAI()

vector_store = client.vector_stores.create(        # Create vector store
    name="Support FAQ",
)

client.vector_stores.files.upload_and_poll(        # Upload file
    vector_store_id=vector_store.id,
    file=open("customer_policies.txt", "rb")
)
```

```node
import OpenAI from "openai";
const client = new OpenAI();

const vector_store = await client.vectorStores.create({   // Create vector store
    name: "Support FAQ",
});

await client.vector_stores.files.upload_and_poll({         // Upload file
    vector_store_id: vector_store.id,
    file: fs.createReadStream("customer_policies.txt"),
});
```

*   **发送搜索查询**以获取相关结果。
    

**搜索查询**

```python
user_query = "What is the return policy?"

results = client.vector_stores.search(
    vector_store_id=vector_store.id,
    query=user_query,
)
```

```node
const userQuery = "What is the return policy?";

const results = await client.vectorStores.search({
    vector_store_id: vector_store.id,
    query: userQuery,
});
```


要了解如何将结果与我们的模型配合使用，请查看[生成回答](#synthesizing-responses)部分。

## 语义搜索

**语义搜索**是一种利用[向量嵌入](/guides/embeddings)来返回语义相关结果的技术。重要的是，这包括与查询几乎没有或完全没有共同关键词的结果，而传统搜索技术可能会遗漏这些结果。

例如，让我们看看 `"When did we go to the moon?"` 的潜在结果：

| 文本 | 关键词相似度 | 语义相似度 |
| --- | --- | --- |
| The first lunar landing occurred in July of 1969. | 0% | 65% |
| The first man on the moon was Neil Armstrong. | 27% | 43% |
| When I ate the moon cake, it was delicious. | 40% | 28% |

_（关键词使用 [Jaccard](https://en.wikipedia.org/wiki/Jaccard_index) 相似度，语义使用 `text-embedding-3-small` 的[余弦](https://en.wikipedia.org/wiki/Cosine_similarity)相似度。）_

注意最相关的结果不包含搜索查询中的任何词。这种灵活性使语义搜索成为查询任何规模知识库的强大技术。

语义搜索由[向量存储](#vector-stores)驱动，我们将在本指南后面详细介绍。本节将重点介绍语义搜索的机制。

### 执行语义搜索

你可以使用 `search` 函数查询向量存储，并以自然语言指定 `query`。这将返回一个结果列表，每个结果包含相关的文本块、相似度分数和来源文件。

**搜索查询**

```python
results = client.vector_stores.search(
    vector_store_id=vector_store.id,
    query="How many woodchucks are allowed per passenger?",
)
```

```node
const results = await client.vectorStores.search({
    vector_store_id: vector_store.id,
    query: "How many woodchucks are allowed per passenger?",
});
```


结果

```
{
  "object": "vector_store.search_results.page",
  "search_query": "How many woodchucks are allowed per passenger?",
  "data": [
    {
      "file_id": "file-12345",
      "filename": "woodchuck_policy.txt",
      "score": 0.85,
      "attributes": {
        "region": "North America",
        "author": "Wildlife Department"
      },
      "content": [
        {
          "type": "text",
          "text": "According to the latest regulations, each passenger is allowed to carry up to two woodchucks."
        },
        {
          "type": "text",
          "text": "Ensure that the woodchucks are properly contained during transport."
        }
      ]
    },
    {
      "file_id": "file-67890",
      "filename": "transport_guidelines.txt",
      "score": 0.75,
      "attributes": {
        "region": "North America",
        "author": "Transport Authority"
      },
      "content": [
        {
          "type": "text",
          "text": "Passengers must adhere to the guidelines set forth by the Transport Authority regarding the transport of woodchucks."
        }
      ]
    }
  ],
  "has_more": false,
  "next_page": null
}
```

默认情况下，响应最多包含 10 个结果，但你可以使用 `max_num_results` 参数设置最多 50 个。

### 查询重写

某些查询风格能产生更好的结果，因此我们提供了一个设置来自动重写查询以获得最佳性能。在执行 `search` 时设置 `rewrite_query=true` 即可启用此功能。

重写后的查询将在结果的 `search_query` 字段中可用。

| **原始查询** | **重写后** |
| --- | --- |
| I'd like to know the height of the main office building. | primary office building height |
| What are the safety regulations for transporting hazardous materials? | safety regulations for hazardous materials |
| How do I file a complaint about a service issue? | service complaint filing process |

### 属性过滤

属性过滤通过应用条件来缩小结果范围，例如将搜索限制在特定日期范围内。你可以在 `attribute_filter` 中定义和组合条件，以便在执行语义搜索之前根据文件属性定位文件。

使用**比较过滤器**将文件 `attributes` 中的特定 `key` 与给定 `value` 进行比较，使用**复合过滤器**通过 `and` 和 `or` 组合多个过滤器。

比较过滤器

```
{
  "type": "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "nin",  // comparison operators
  "key": "attributes_key",                           // attributes key
  "value": "target_value"                             // value to compare against
}
```

复合过滤器

```
{
  "type": "and" | "or",                                // logical operators
  "filters": [...]                                   
}
```

以下是一些示例过滤器。

地区日期范围文件名排除文件名复杂条件

地区

按地区过滤

```
{
  "type": "eq",
  "key": "region",
  "value": "us"
}
```

日期范围

按日期范围过滤

```
{
  "type": "and",
  "filters": [
    {
      "type": "gte",
      "key": "date",
      "value": 1704067200  // unix timestamp for 2024-01-01
    },
    {
      "type": "lte",
      "key": "date",
      "value": 1710892800  // unix timestamp for 2024-03-20
    }
  ]
}
```

文件名

匹配一组文件名中的任意一个

```
{
  "type": "in",
  "property": "filename",
  "value": ["example.txt", "example2.txt"]
}
```

排除文件名

按文件名排除草稿

```
{
  "type": "nin",
  "property": "filename",
  "value": ["draft.txt", "internal_notes.md"]
}
```

复杂条件

过滤特定名称的英文绝密项目

```
{
  "type": "or",
  "filters": [
    {
      "type": "and",
      "filters": [
        {
          "type": "or",
          "filters": [
            {
              "type": "eq",
              "key": "project_code",
              "value": "X123"
            },
            {
              "type": "eq",
              "key": "project_code",
              "value": "X999"
            }
          ]
        },
        {
          "type": "eq",
          "key": "confidentiality",
          "value": "top_secret"
        }
      ]
    },
    {
      "type": "eq",
      "key": "language",
      "value": "en"
    }
  ]
}
```

### 排名

如果你发现文件搜索结果的相关性不够，可以调整 `ranking_options` 来提高响应质量。这包括指定 `ranker`（如 `auto` 或 `default-2024-08-21`），以及设置 0.0 到 1.0 之间的 `score_threshold`。较高的 `score_threshold` 会将结果限制为更相关的文本块，但可能会排除一些潜在有用的内容。当提供 `ranking_options.hybrid_search` 时，你还可以调整 `hybrid_search.embedding_weight`（`rrf_embedding_weight`）和 `hybrid_search.text_weight`（`rrf_text_weight`）来控制倒数排名融合如何平衡语义嵌入匹配与稀疏关键词匹配。增大前者以强调语义相似性，增大后者以强调文本重叠，并确保至少有一个权重大于零。

## 向量存储

向量存储是为 Retrieval API 和[文件搜索](/guides/tools-file-search)工具提供语义搜索能力的容器。当你将文件添加到向量存储时，它会自动被分块、嵌入和索引。

向量存储包含 `vector_store_file` 对象，这些对象由 `file` 对象支持。

| 对象类型 | 描述 |
| --- | --- |
| `file` | 表示通过 [Files API]( https://developers.openai.com/api/reference/files) 上传的内容。通常与向量存储一起使用，但也用于微调和其他用例。 |
| `vector_store` | 可搜索文件的容器。 |
| `vector_store.file` | 包装类型，专门表示已被分块和嵌入并与 `vector_store` 关联的 `file`。包含用于过滤的 `attributes` 映射。 |

### 定价

你将根据所有向量存储中使用的总存储量收费，由解析后的文本块及其对应嵌入的大小决定。

| 存储 | 费用 |
| --- | --- |
| 最多 1 GB（所有存储合计） | 免费 |
| 超过 1 GB | $0.10/GB/天 |

参见[过期策略](#expiration-policies)了解最小化成本的选项。

### 向量存储操作

创建检索更新删除列表

创建

**创建向量存储**

```python
client.vector_stores.create(
    name="Support FAQ",
    file_ids=["file_123"]
)
```

```node
await client.vector_stores.create({
    name: "Support FAQ",
    file_ids: ["file_123"]
});
```


检索

**检索向量存储**

```python
client.vector_stores.retrieve(
    vector_store_id="vs_123"
)
```

```node
await client.vector_stores.retrieve({
    vector_store_id: "vs_123"
});
```


更新

**更新向量存储**

```python
client.vector_stores.update(
    vector_store_id="vs_123",
    name="Support FAQ Updated"
)
```

```node
await client.vector_stores.update({
    vector_store_id: "vs_123",
    name: "Support FAQ Updated"
});
```


删除

**删除向量存储**

```python
client.vector_stores.delete(
    vector_store_id="vs_123"
)
```

```node
await client.vector_stores.delete({
    vector_store_id: "vs_123"
});
```


列表

**列出向量存储**

```python
client.vector_stores.list()
```

```node
await client.vector_stores.list();
```


### 向量存储文件操作

某些操作（如 `vector_store.file` 的 `create`）是异步的，可能需要一些时间才能完成——使用我们的辅助函数（如 `create_and_poll`）来阻塞等待完成。否则，你可以检查状态。从向量存储中移除文件是最终一致的，搜索结果可能在短时间内仍包含已移除文件的内容。

添加文件按向量存储 ID 进行速率限制。对 [`/vector_stores/{vector_store_id}/files`]( https://developers.openai.com/api/reference/vector-stores/createFile) 和 [`/vector_stores/{vector_store_id}/file_batches`]( https://developers.openai.com/api/reference/vector-stores/createBatch) 的请求共享每个向量存储每分钟 300 次请求的限制。

创建上传检索更新删除列表

创建

**创建向量存储文件**

```python
client.vector_stores.files.create_and_poll(
    vector_store_id="vs_123",
    file_id="file_123"
)
```

```node
await client.vector_stores.files.create_and_poll({
    vector_store_id: "vs_123",
    file_id: "file_123"
});
```


上传

**上传向量存储文件**

```python
client.vector_stores.files.upload_and_poll(
    vector_store_id="vs_123",
    file=open("customer_policies.txt", "rb")
)
```

```node
await client.vector_stores.files.upload_and_poll({
    vector_store_id: "vs_123",
    file: fs.createReadStream("customer_policies.txt"),
});
```


检索

**检索向量存储文件**

```python
client.vector_stores.files.retrieve(
    vector_store_id="vs_123",
    file_id="file_123"
)
```

```node
await client.vector_stores.files.retrieve({
    vector_store_id: "vs_123",
    file_id: "file_123"
});
```


更新

**更新向量存储文件**

```python
client.vector_stores.files.update(
    vector_store_id="vs_123",
    file_id="file_123",
    attributes={"key": "value"}
)
```

```node
await client.vector_stores.files.update({
    vector_store_id: "vs_123",
    file_id: "file_123",
    attributes: { key: "value" }
});
```


删除

**删除向量存储文件**

```python
client.vector_stores.files.delete(
    vector_store_id="vs_123",
    file_id="file_123"
)
```

```node
await client.vector_stores.files.delete({
    vector_store_id: "vs_123",
    file_id: "file_123"
});
```


列表

**列出向量存储文件**

```python
client.vector_stores.files.list(
    vector_store_id="vs_123"
)
```

```node
await client.vector_stores.files.list({
    vector_store_id: "vs_123"
});
```


### 批量操作

创建检索取消列表

创建

**批量创建操作**

```python
client.vector_stores.file_batches.create_and_poll(
    vector_store_id="vs_123",
    files=[
        {
            "file_id": "file_123",
            "attributes": {"department": "finance"}
        },
        {
            "file_id": "file_456",
            "chunking_strategy": {
                "type": "static",
                "max_chunk_size_tokens": 1200,
                "chunk_overlap_tokens": 200
            }
        }
    ]
)
```

```node
await client.vector_stores.file_batches.create_and_poll({
    vector_store_id: "vs_123",
    files: [
        {
            file_id: "file_123",
            attributes: { department: "finance" }
        },
        {
            file_id: "file_456",
            chunking_strategy: {
                type: "static",
                max_chunk_size_tokens: 1200,
                chunk_overlap_tokens: 200
            }
        }
    ]
});
```


检索

**批量检索操作**

```python
client.vector_stores.file_batches.retrieve(
    vector_store_id="vs_123",
    batch_id="vsfb_123"
)
```

```node
await client.vector_stores.file_batches.retrieve({
    vector_store_id: "vs_123",
    batch_id: "vsfb_123"
});
```


取消

**批量取消操作**

```python
client.vector_stores.file_batches.cancel(
    vector_store_id="vs_123",
    batch_id="vsfb_123"
)
```

```node
await client.vector_stores.file_batches.cancel({
    vector_store_id: "vs_123",
    batch_id: "vsfb_123"
});
```


列表

**批量列表操作**

```python
client.vector_stores.file_batches.list(
    vector_store_id="vs_123"
)
```

```node
await client.vector_stores.file_batches.list({
    vector_store_id: "vs_123"
});
```


创建批量时，你可以提供 `file_ids` 并附带可选的 `attributes` 和/或 `chunking_strategy`，或者使用 `files` 数组传递包含 `file_id` 以及每个文件可选的 `attributes` 和 `chunking_strategy` 的对象。这两个选项是互斥的，这样你可以清晰地控制是所有文件共享相同设置，还是需要按文件单独覆盖。

对于向单个向量存储进行更高吞吐量的数据摄入，我们建议尽可能使用批量创建。批量可以在一个请求中包含最多 500 个文件，这通常比发送多个单文件创建请求减少竞争并改善端到端延迟。

### 属性

每个 `vector_store.file` 可以有关联的 `attributes`，这是一个值字典，可以在使用[属性过滤](#attribute-filtering)执行[语义搜索](#semantic-search)时引用。字典最多可以有 16 个键，每个键最多 256 个字符。

**创建带属性的向量存储文件**

```python
client.vector_stores.files.create(
    vector_store_id="&lt;vector_store_id>",
    file_id="file_123",
    attributes={
        "region": "US",
        "category": "Marketing",
        "date": 1672531200      # Jan 1, 2023
    }
)
```

```node
await client.vector_stores.files.create(&lt;vector_store_id>, {
    file_id: "file_123",
    attributes: {
        region: "US",
        category: "Marketing",
        date: 1672531200, // Jan 1, 2023
    },
});
```


### 过期策略

你可以使用 `expires_after` 在 `vector_store` 对象上设置过期策略。一旦向量存储过期，所有关联的 `vector_store.file` 对象将被删除，你将不再为它们付费。

**设置向量存储的过期策略**

```python
client.vector_stores.update(
    vector_store_id="vs_123",
    expires_after={
        "anchor": "last_active_at",
        "days": 7
    }
)
```

```node
await client.vector_stores.update({
    vector_store_id: "vs_123",
    expires_after: {
        anchor: "last_active_at",
        days: 7,
    },
});
```


### 限制

最大文件大小为 512 MB。每个文件应包含不超过 5,000,000 个 token（在附加文件时自动计算）。

### 分块

默认情况下，`max_chunk_size_tokens` 设置为 `800`，`chunk_overlap_tokens` 设置为 `400`，这意味着每个文件通过拆分为 800 token 的块进行索引，连续块之间有 400 token 的重叠。

你可以在将文件添加到向量存储时通过设置 [`chunking_strategy`]( https://developers.openai.com/api/reference/vector-stores-files/createFile#vector-stores-files-createfile-chunking_strategy) 来调整此设置。`chunking_strategy` 有一些限制：

*   `max_chunk_size_tokens` 必须在 100 到 4096 之间（含）。
*   `chunk_overlap_tokens` 必须为非负数，且不应超过 `max_chunk_size_tokens / 2`。

支持的文件类型

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

## 生成回答

执行查询后，你可能希望根据结果生成回答。你可以利用我们的模型来实现这一点，通过提供结果和原始查询，获得一个基于事实的回答。

**执行搜索查询获取结果**

```python
from openai import OpenAI

client = OpenAI()

user_query = "What is the return policy?"

results = client.vector_stores.search(
    vector_store_id=vector_store.id,
    query=user_query,
)
```

```node
import OpenAI from "openai";
const client = new OpenAI();

const userQuery = "What is the return policy?";

const results = await client.vectorStores.search({
    vector_store_id: vector_store.id,
    query: userQuery,
});
```


**根据结果生成回答**

```python
formatted_results = format_results(results.data)

'\n'.join('\n'.join(c.text) for c in result.content for result in results.data)

completion = client.chat.completions.create(
    model="gpt-4.1",
    messages=[
        {
            "role": "developer",
            "content": "Produce a concise answer to the query based on the provided sources."
        },
        {
            "role": "user",
            "content": f"Sources: {formatted_results}\n\nQuery: '{user_query}'"
        }
    ],
)

print(completion.choices[0].message.content)
```

```node
const formattedResults = formatResults(results.data);
// Join the text content of all results
const textSources = results.data.map(result => result.content.map(c => c.text).join('\n')).join('\n');

const completion = await client.chat.completions.create({
    model: "gpt-4.1",
    messages: [
        {
            role: "developer",
            content: "Produce a concise answer to the query based on the provided sources."
        },
        {
            role: "user",
            content: `Sources: ${formattedResults}\n\nQuery: '${userQuery}'`
        }
    ],
});

console.log(completion.choices[0].message.content);
```


```
"Our return policy allows returns within 30 days of purchase."
```

这里使用了一个示例 `format_results` 函数，其实现如下：

**示例结果格式化函数**

::: code-group
```python
def format_results(results):
    formatted_results = ''
    for result in results.data:
        formatted_result = f"&lt;result file_id='{result.file_id}' file_name='{result.file_name}'>"
        for part in result.content:
            formatted_result += f"&lt;content>{part.text}&lt;/content>"
        formatted_results += formatted_result + "&lt;/result>"
    return f"&lt;sources>{formatted_results}&lt;/sources>"
```

```node
function formatResults(results) {
    let formattedResults = '';
    for (const result of results.data) {
        let formattedResult = `&lt;result file_id='${result.file_id}' file_name='${result.file_name}'>`;
        for (const part of result.content) {
            formattedResult += `&lt;content>${part.text}&lt;/content>`;
        }
        formattedResults += formattedResult + "&lt;/result>";
    }
    return `&lt;sources>${formattedResults}&lt;/sources>`;
}
```

:::

