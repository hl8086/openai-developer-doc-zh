
OpenAI 模型可以接受文件作为 `input_file` 项。在 Responses API 中，你可以以 Base64 编码数据、Files API (`/v1/files`) 返回的文件 ID 或外部 URL 的形式发送文件。

## 工作原理

`input_file` 的处理取决于文件类型：

*   **PDF 文件**：在具有视觉能力的模型上（如 `gpt-4o` 及更新的模型），API 会提取文本和页面图像，并将两者都发送给模型。
*   **非 PDF 文档和文本文件**（例如 `.docx`、`.pptx`、`.txt` 和代码文件）：API 仅提取文本。
*   **电子表格文件**（例如 `.xlsx`、`.csv`、`.tsv`）：API 运行电子表格专用的增强流程（如下所述）。

当以下相关工具更适合你的任务时，请使用它们：

*   使用 [File Search](/guides/tools-file-search) 对大文件进行检索，而不是直接将其作为 `input_file` 传递。
*   使用 [Hosted Shell](/guides/tools-shell#hosted-shell-quickstart) 处理需要详细分析的电子表格密集型任务，例如聚合、连接、图表或自定义计算。

## 非 PDF 图像和图表的限制

对于非 PDF 文件，API 不会将嵌入的图像或图表提取到模型上下文中。

为了保持图表和图示的保真度，请先将文件转换为 PDF，然后将 PDF 作为 `input_file` 发送。

## 电子表格增强的工作原理

对于类似电子表格的文件（如 `.xlsx`、`.xls`、`.csv`、`.tsv` 和 `.iif`），`input_file` 使用电子表格专用的增强流程。

API 不会将整个工作表传递给模型，而是解析每个工作表的前 1,000 行，并添加模型生成的摘要和表头元数据，以便模型可以从更小的结构化数据视图中工作。

## 接受的文件类型

下表列出了 `input_file` 中接受的常见文件类型。完整的扩展名和 MIME 类型列表在本页后面。

| 类别 | 常见扩展名 |
| --- | --- |
| PDF 文件 | `.pdf` |
| 文本和代码 | `.txt`、`.md`、`.json`、`.html`、`.xml`、代码文件 |
| 富文档 | `.doc`、`.docx`、`.rtf`、`.odt` |
| 演示文稿 | `.ppt`、`.pptx` |
| 电子表格 | `.csv`、`.xls`、`.xlsx` |

## 文件 URL

你可以通过链接外部 URL 来提供文件输入。

**使用外部文件 URL**

::: code-group
```curl
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5.5",
        "input": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": "Analyze the letter and provide a summary of the key points."
                    },
                    {
                        "type": "input_file",
                        "file_url": "https://www.berkshirehathaway.com/letters/2024ltr.pdf"
                    }
                ]
            }
        ]
    }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5.5",
    input: [
        {
            role: "user",
            content: [
                {
                    type: "input_text",
                    text: "Analyze the letter and provide a summary of the key points.",
                },
                {
                    type: "input_file",
                    file_url: "https://www.berkshirehathaway.com/letters/2024ltr.pdf",
                },
            ],
        },
    ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input=[
        {
            "role": "user",
            "content": [
                {
                    "type": "input_text",
                    "text": "Analyze the letter and provide a summary of the key points.",
                },
                {
                    "type": "input_file",
                    "file_url": "https://www.berkshirehathaway.com/letters/2024ltr.pdf",
                },
            ],
        },
    ]
)

print(response.output_text)
```

```csharp
using OpenAI.Files;
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

using HttpClient http = new();
using Stream stream = await http.GetStreamAsync("https://www.berkshirehathaway.com/letters/2024ltr.pdf");
OpenAIFileClient files = new(key);
OpenAIFile file = files.UploadFile(stream, "2024ltr.pdf", FileUploadPurpose.UserData);

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("Analyze the letter and provide a summary of the key points."),
        ResponseContentPart.CreateInputFilePart(file.Id),
    ]),
]);

Console.WriteLine(response.GetOutputText());
```

:::



Chat Completions 不支持文件 URL。请使用 [Responses API](/guides/file-inputs?api-mode=responses#file-urls) 来实现此选项。

## 上传文件

以下示例使用 [Files API]( https://developers.openai.com/api/reference/files) 上传文件，然后在发送给模型的请求中引用其文件 ID。

**上传文件**

::: code-group
```curl
curl https://api.openai.com/v1/files \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -F purpose="user_data" \
    -F file="@draconomicon.pdf"

curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5.5",
        "input": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_file",
                        "file_id": "file-6F2ksmvXxt4VdoqmHRw6kL"
                    },
                    {
                        "type": "input_text",
                        "text": "What is the first dragon in the book?"
                    }
                ]
            }
        ]
    }'
```

```javascript
import fs from "fs";
import OpenAI from "openai";
const client = new OpenAI();

const file = await client.files.create({
    file: fs.createReadStream("draconomicon.pdf"),
    purpose: "user_data",
});

const response = await client.responses.create({
    model: "gpt-5.5",
    input: [
        {
            role: "user",
            content: [
                {
                    type: "input_file",
                    file_id: file.id,
                },
                {
                    type: "input_text",
                    text: "What is the first dragon in the book?",
                },
            ],
        },
    ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

file = client.files.create(
    file=open("draconomicon.pdf", "rb"),
    purpose="user_data"
)

response = client.responses.create(
    model="gpt-5.5",
    input=[
        {
            "role": "user",
            "content": [
                {
                    "type": "input_file",
                    "file_id": file.id,
                },
                {
                    "type": "input_text",
                    "text": "What is the first dragon in the book?",
                },
            ]
        }
    ]
)

print(response.output_text)
```

```csharp
using OpenAI.Files;
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5.5", apiKey: key);

OpenAIFileClient files = new(key);
OpenAIFile file = files.UploadFile("draconomicon.pdf", FileUploadPurpose.UserData);

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputFilePart(file.Id),
        ResponseContentPart.CreateInputTextPart("What is the first dragon in the book?"),
    ]),
]);

Console.WriteLine(response.GetOutputText());
```

:::



**上传文件**

::: code-group
```curl
curl https://api.openai.com/v1/files \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -F purpose="user_data" \
    -F file="@draconomicon.pdf"

curl "https://api.openai.com/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "file",
                        "file": {
                            "file_id": "file-6F2ksmvXxt4VdoqmHRw6kL"
                        }
                    },
                    {
                        "type": "text",
                        "text": "What is the first dragon in the book?"
                    }
                ]
            }
        ]
    }'
```

```javascript
import fs from "fs";
import OpenAI from "openai";
const client = new OpenAI();

const file = await client.files.create({
    file: fs.createReadStream("draconomicon.pdf"),
    purpose: "user_data",
});

const completion = await client.chat.completions.create({
    model: "gpt-5",
    messages: [
        {
            role: "user",
            content: [
                {
                    type: "file",
                    file: {
                        file_id: file.id,
                    }
                },
                {
                    type: "text",
                    text: "What is the first dragon in the book?",
                },
            ],
        },
    ],
});

console.log(completion.choices[0].message.content);
```

```python
from openai import OpenAI
client = OpenAI()

file = client.files.create(
    file=open("draconomicon.pdf", "rb"),
    purpose="user_data"
)

completion = client.chat.completions.create(
    model="gpt-5",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "file",
                    "file": {
                        "file_id": file.id,
                    }
                },
                {
                    "type": "text",
                    "text": "What is the first dragon in the book?",
                },
            ]
        }
    ]
)

print(completion.choices[0].message.content)
```

:::





## Base64 编码文件

你也可以以 Base64 编码文件数据的形式发送文件输入。

**发送 Base64 编码文件**

::: code-group
```curl
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5",
        "input": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_file",
                        "filename": "draconomicon.pdf",
                        "file_data": "...base64 encoded PDF bytes here..."
                    },
                    {
                        "type": "input_text",
                        "text": "What is the first dragon in the book?"
                    }
                ]
            }
        ]
    }'
```

```javascript
import fs from "fs";
import OpenAI from "openai";
const client = new OpenAI();

const data = fs.readFileSync("draconomicon.pdf");
const base64String = data.toString("base64");

const response = await client.responses.create({
    model: "gpt-5",
    input: [
        {
            role: "user",
            content: [
                {
                    type: "input_file",
                    filename: "draconomicon.pdf",
                    file_data: `data:application/pdf;base64,${base64String}`,
                },
                {
                    type: "input_text",
                    text: "What is the first dragon in the book?",
                },
            ],
        },
    ],
});

console.log(response.output_text);
```

```python
import base64
from openai import OpenAI
client = OpenAI()

with open("draconomicon.pdf", "rb") as f:
    data = f.read()

base64_string = base64.b64encode(data).decode("utf-8")

response = client.responses.create(
    model="gpt-5",
    input=[
        {
            "role": "user",
            "content": [
                {
                    "type": "input_file",
                    "filename": "draconomicon.pdf",
                    "file_data": f"data:application/pdf;base64,{base64_string}",
                },
                {
                    "type": "input_text",
                    "text": "What is the first dragon in the book?",
                },
            ],
        },
    ]
)

print(response.output_text)
```

:::





**发送 Base64 编码文件**

::: code-group
```curl
curl "https://api.openai.com/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "file",
                        "file": {
                            "filename": "draconomicon.pdf",
                            "file_data": "...base64 encoded bytes here..."
                        }
                    },
                    {
                        "type": "text",
                        "text": "What is the first dragon in the book?"
                    }
                ]
            }
        ]
    }'
```

```javascript
import fs from "fs";
import OpenAI from "openai";
const client = new OpenAI();

const data = fs.readFileSync("draconomicon.pdf");
const base64String = data.toString("base64");

const completion = await client.chat.completions.create({
    model: "gpt-5",
    messages: [
        {
            role: "user",
            content: [
                {
                    type: "file",
                    file: {
                        filename: "draconomicon.pdf",
                        file_data: `data:application/pdf;base64,${base64String}`
                    }
                },
                {
                    type: "text",
                    text: "What is the first dragon in the book?",
                },
            ],
        },
    ],
});

console.log(completion.choices[0].message.content);
```

```python
import base64
from openai import OpenAI
client = OpenAI()

with open("draconomicon.pdf", "rb") as f:
    data = f.read()

base64_string = base64.b64encode(data).decode("utf-8")

completion = client.chat.completions.create(
    model="gpt-5",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "file",
                    "file": {
                        "filename": "draconomicon.pdf",
                        "file_data": f"data:application/pdf;base64,{base64_string}",
                    }
                },
                {
                    "type": "text",
                    "text": "What is the first dragon in the book?",
                }
            ],
        },
    ],
)

print(completion.choices[0].message.content)
```

:::





## 使用注意事项

使用文件输入时请注意以下限制：

*   **Token 用量：** PDF 解析会将提取的文本和页面图像都包含在上下文中，这可能会增加 token 用量。在大规模部署之前，请查看定价和 token 影响。[更多定价信息](/pricing)。
*   **文件大小限制：** 单个请求可以包含多个文件，但每个文件必须小于 50 MB。请求中所有文件的总大小限制为 50 MB。
*   **支持的模型：** 包含文本和页面图像的 PDF 解析需要具有视觉能力的模型，如 `gpt-4o` 及更新的模型。
*   **文件上传用途：** 你可以使用任何支持的 [purpose]( https://developers.openai.com/api/reference/files/create#files-create-purpose) 上传文件，但对于计划作为模型输入传递的文件，请使用 `user_data`。

## 接受的文件类型完整列表

| 类别 | 扩展名 | MIME 类型 |
| --- | --- | --- |
| PDF 文件 | PDF 文件 (`.pdf`) | `application/pdf` |
| 电子表格 | Excel 表格 (`.xla`、`.xlb`、`.xlc`、`.xlm`、`.xls`、`.xlsx`、`.xlt`、`.xlw`) | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`、`application/vnd.ms-excel` |
| 电子表格 | CSV / TSV / IIF (`.csv`、`.tsv`、`.iif`)、Google Sheets | `text/csv`、`application/csv`、`text/tsv`、`text/x-iif`、`application/x-iif`、`application/vnd.google-apps.spreadsheet` |
| 富文档 | Word/ODT/RTF 文档 (`.doc`、`.docx`、`.dot`、`.odt`、`.rtf`)、Pages、Google Docs | `application/vnd.openxmlformats-officedocument.wordprocessingml.document`、`application/msword`、`application/rtf`、`text/rtf`、`application/vnd.oasis.opendocument.text`、`application/vnd.apple.pages`、`application/vnd.google-apps.document`、`application/vnd.apple.iwork` |
| 演示文稿 | PowerPoint 幻灯片 (`.pot`、`.ppa`、`.pps`、`.ppt`、`.pptx`、`.pwz`、`.wiz`)、Keynote、Google Slides | `application/vnd.openxmlformats-officedocument.presentationml.presentation`、`application/vnd.ms-powerpoint`、`application/vnd.apple.keynote`、`application/vnd.google-apps.presentation`、`application/vnd.apple.iwork` |
| 文本和代码 | 文本/代码格式 (`.asm`、`.bat`、`.c`、`.cc`、`.conf`、`.cpp`、`.css`、`.cxx`、`.def`、`.dic`、`.eml`、`.h`、`.hh`、`.htm`、`.html`、`.ics`、`.ifb`、`.in`、`.js`、`.json`、`.ksh`、`.list`、`.log`、`.markdown`、`.md`、`.mht`、`.mhtml`、`.mime`、`.mjs`、`.nws`、`.pl`、`.py`、`.rst`、`.s`、`.sql`、`.srt`、`.text`、`.txt`、`.vcf`、`.vtt`、`.xml`) | `application/javascript`、`application/typescript`、`text/xml`、`text/x-shellscript`、`text/x-rst`、`text/x-makefile`、`text/x-lisp`、`text/x-asm`、`text/vbscript`、`text/css`、`message/rfc822`、`application/x-sql`、`application/x-scala`、`application/x-rust`、`application/x-powershell`、`text/x-diff`、`text/x-patch`、`application/x-patch`、`text/plain`、`text/markdown`、`text/x-java`、`text/x-script.python`、`text/x-python`、`text/x-c`、`text/x-c++`、`text/x-golang`、`text/html`、`text/x-php`、`application/x-php`、`application/x-httpd-php`、`application/x-httpd-php-source`、`text/x-ruby`、`text/x-sh`、`text/x-bash`、`application/x-bash`、`text/x-zsh`、`text/x-tex`、`text/x-csharp`、`application/json`、`text/x-typescript`、`text/javascript`、`text/x-go`、`text/x-rust`、`text/x-scala`、`text/x-kotlin`、`text/x-swift`、`text/x-lua`、`text/x-r`、`text/x-R`、`text/x-julia`、`text/x-perl`、`text/x-objectivec`、`text/x-objectivec++`、`text/x-erlang`、`text/x-elixir`、`text/x-haskell`、`text/x-clojure`、`text/x-groovy`、`text/x-dart`、`text/x-awk`、`application/x-awk`、`text/jsx`、`text/tsx`、`text/x-handlebars`、`text/x-mustache`、`text/x-ejs`、`text/x-jinja2`、`text/x-liquid`、`text/x-erb`、`text/x-twig`、`text/x-pug`、`text/x-jade`、`text/x-tmpl`、`text/x-cmake`、`text/x-dockerfile`、`text/x-gradle`、`text/x-ini`、`text/x-properties`、`text/x-protobuf`、`application/x-protobuf`、`text/x-sql`、`text/x-sass`、`text/x-scss`、`text/x-less`、`text/x-hcl`、`text/x-terraform`、`application/x-terraform`、`text/x-toml`、`application/x-toml`、`application/graphql`、`application/x-graphql`、`text/x-graphql`、`application/x-ndjson`、`application/json5`、`application/x-json5`、`text/x-yaml`、`application/toml`、`application/x-yaml`、`application/yaml`、`text/x-astro`、`text/srt`、`application/x-subrip`、`text/x-subrip`、`text/vtt`、`text/x-vcard`、`text/calendar` |

## 后续步骤

接下来，你可能想探索以下资源之一：

[在 Playground 中试验文件输入 - 使用 Playground 开发和迭代带有文件输入的提示词。](https://platform.openai.com/chat/edit)

[完整 API 参考 - 查看 API 参考以了解更多选项。]( https://developers.openai.com/api/reference/responses)

[使用 File Search 处理大型语料库 - 当你需要可扩展的搜索而不是在单个上下文窗口中发送整个文件时，使用对分块文件的检索。](/guides/tools-file-search)

[使用 Hosted Shell 进行深度电子表格分析 - 使用 Hosted Shell 处理高级电子表格工作流，如连接、聚合和图表。](/guides/tools-shell#hosted-shell-quickstart)
