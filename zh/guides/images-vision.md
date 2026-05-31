
## 概述

[创建图像使用 GPT Image 模型生成或编辑图像。](/guides/image-generation)

[处理图像输入使用我们模型的视觉能力来分析图像。](#analyze-images)

在本指南中，您将了解如何使用 OpenAI API 构建涉及图像的应用程序。如果您已经知道想要构建什么，请在下方找到您的用例以开始使用。如果您不确定从哪里开始，请继续阅读以获取概述。

### 图像相关用例概览

最新的语言模型可以处理图像输入并进行分析——这种能力被称为**视觉**。GPT Image 模型可以使用文本和图像输入来创建新图像或编辑现有图像。

OpenAI API 提供了多个端点来处理图像输入或生成图像输出，使您能够构建强大的多模态应用程序。

| API | 支持的用例 |
| --- | --- |
| [Responses API]( https://developers.openai.com/api/reference/responses) | 分析图像并将其用作输入和/或生成图像作为输出 |
| [Images API]( https://developers.openai.com/api/reference/images) | 生成图像作为输出，可选择使用图像作为输入 |
| [Chat Completions API]( https://developers.openai.com/api/reference/chat) | 分析图像并将其用作输入以生成文本或音频 |

要了解更多关于我们模型支持的输入和输出模态，请参阅我们的[模型页面](/models)。

## 生成或编辑图像

您可以使用 Image API 或 Responses API 生成或编辑图像。

最先进的图像生成模型 `gpt-image-2` 可以理解文本和图像，并利用广泛的世界知识来生成具有强大指令遵循能力和上下文感知能力的图像。

**使用 Responses 生成图像**

::: code-group
```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: "Generate an image of gray tabby cat hugging an otter with an orange scarf",
    tools: [{type: "image_generation"}],
});

// Save the image to a file
const imageData = response.output
  .filter((output) => output.type === "image_generation_call")
  .map((output) => output.result);

if (imageData.length > 0) {
  const imageBase64 = imageData[0];
  const fs = await import("fs");
  fs.writeFileSync("cat_and_otter.png", Buffer.from(imageBase64, "base64"));
}
```

```python
from openai import OpenAI
import base64

client = OpenAI() 

response = client.responses.create(
    model="gpt-4.1-mini",
    input="Generate an image of gray tabby cat hugging an otter with an orange scarf",
    tools=[{"type": "image_generation"}],
)

// Save the image to a file
image_data = [
    output.result
    for output in response.output
    if output.type == "image_generation_call"
]

if image_data:
    image_base64 = image_data[0]
    with open("cat_and_otter.png", "wb") as f:
        f.write(base64.b64decode(image_base64))
```

```cli
openai responses create \
  --model gpt-5.5 \
  --raw-output \
  --transform 'output.#(type=="image_generation_call").result' <<'YAML' | base64 --decode > cat_and_otter.png
tools:
  - type: image_generation
input: Generate an image of a gray tabby cat hugging an otter with an orange scarf.
YAML
```

:::

您可以在我们的[图像生成](/guides/image-generation)指南中了解更多关于图像生成的信息。

### 利用世界知识进行图像生成

GPT Image 模型可以利用对世界的视觉理解来生成逼真的图像，包括无需参考即可呈现真实细节。

例如，如果您提示 GPT Image 生成一个装有最受欢迎半宝石的玻璃柜图像，模型有足够的知识来选择紫水晶、玫瑰石英、翡翠等宝石，并以逼真的方式描绘它们。

## 分析图像

**视觉**是模型"看到"并理解图像的能力。如果图像中有文本，模型也可以理解该文本。它可以理解大多数视觉元素，包括物体、形状、颜色和纹理，尽管存在一些[限制](#limitations)。

### 向模型提供图像作为输入

您可以通过提供图像文件的完整 URL 或以 Base64 编码的数据 URL 提供图像，将图像作为输入提供给生成请求。

您可以在单个请求中通过在 `content` 数组中包含多个图像来提供多个图像作为输入，但请注意[图像会计为 token](#calculating-costs) 并相应计费。

传递 URL传递 Base64 编码图像

传递 URL

**分析图像内容**

::: code-group
```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{
        role: "user",
        content: [
            { type: "text", text: "What is in this image?" },
            {
                type: "image_url",
                image_url: {
                    url: "https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg",
                },
            },
        ],
    }],
});

console.log(response.choices[0].message.content);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4.1-mini",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "What's in this image?"},
            {
                "type": "image_url",
                "image_url": {
                    "url": "https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg",
                },
            },
        ],
    }],
)

print(response.choices[0].message.content)
```

```curl
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4.1-mini",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What is in this image?"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg"
            }
          }
        ]
      }
    ],
    "max_tokens": 300
  }'
```

:::



传递 Base64 编码图像

**分析图像内容**

::: code-group
```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const imagePath = "path_to_your_image.jpg";
const base64Image = fs.readFileSync(imagePath, "base64");

const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{
        role: "user",
        content: [
            { type: "text", text: "what's in this image?" },
            {
                type: "image_url",
                image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                },
            },
        ],
    }],
});

console.log(completion.choices[0].message.content);
```

```python
import base64
from openai import OpenAI

client = OpenAI()

# Function to encode the image
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


# Path to your image
image_path = "path_to_your_image.jpg"

# Getting the Base64 string
base64_image = encode_image(image_path)

completion = client.chat.completions.create(
    model="gpt-4.1",
    messages=[
        {
            "role": "user",
            "content": [
                { "type": "text", "text": "what's in this image?" },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}",
                    },
                },
            ],
        }
    ],
)

print(completion.choices[0].message.content)
```

```curl
BASE64_IMAGE=$(base64 < path_to_your_image.jpg) && curl https://api.openai.com/v1/chat/completions   -H "Content-Type: application/json"   -H "Authorization: Bearer $OPENAI_API_KEY"   -d @- <&lt;EOF
  {
    "model": "gpt-4.1-mini",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What is in this image?"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "data:image/jpeg;base64,$BASE64_IMAGE"
            }
          }
        ]
      }
    ],
    "max_tokens": 300
  }
EOF
```

:::



您可以通过多种方式将图像作为输入提供给生成请求：

*   提供图像文件的完整 URL
*   以 Base64 编码的数据 URL 提供图像
*   提供文件 ID（通过 [Files API]( https://developers.openai.com/api/reference/files) 创建）

您可以在单个请求中通过在 `content` 数组中包含多个图像来提供多个图像作为输入，但请注意[图像会计为 token](#calculating-costs) 并相应计费。

传递 URL传递 Base64 编码图像传递文件 ID

传递 URL

**分析图像内容**

::: code-group
```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [{
        role: "user",
        content: [
            { type: "input_text", text: "what's in this image?" },
            {
                type: "input_image",
                image_url: "https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg",
            },
        ],
    }],
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-4.1-mini",
    input=[{
        "role": "user",
        "content": [
            {"type": "input_text", "text": "what's in this image?"},
            {
                "type": "input_image",
                "image_url": "https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg",
            },
        ],
    }],
)

print(response.output_text)
```

```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5", apiKey: key);

Uri imageUrl = new("https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg");

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("What is in this image?"),
        ResponseContentPart.CreateInputImagePart(imageUrl)
    ])
]);

Console.WriteLine(response.GetOutputText());
```

```curl
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4.1-mini",
    "input": [
      {
        "role": "user",
        "content": [
          {"type": "input_text", "text": "what is in this image?"},
          {
            "type": "input_image",
            "image_url": "https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg"
          }
        ]
      }
    ]
  }'
```

```cli
openai responses create \
  --model gpt-5.5 \
  --raw-output \
  --transform 'output.#(type=="message").content.0.text' <<'YAML'
input:
  - role: user
    content:
      - type: input_text
        text: What is in this image?
      - type: input_image
        image_url: https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg
YAML
```

:::


传递 Base64 编码图像

**分析图像内容**

::: code-group
```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const imagePath = "path_to_your_image.jpg";
const base64Image = fs.readFileSync(imagePath, "base64");

const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
        {
            role: "user",
            content: [
                { type: "input_text", text: "what's in this image?" },
                {
                    type: "input_image",
                    image_url: `data:image/jpeg;base64,${base64Image}`,
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

# Function to encode the image
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")


# Path to your image
image_path = "path_to_your_image.jpg"

# Getting the Base64 string
base64_image = encode_image(image_path)


response = client.responses.create(
    model="gpt-4.1",
    input=[
        {
            "role": "user",
            "content": [
                { "type": "input_text", "text": "what's in this image?" },
                {
                    "type": "input_image",
                    "image_url": f"data:image/jpeg;base64,{base64_image}",
                },
            ],
        }
    ],
)

print(response.output_text)
```

```csharp
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5", apiKey: key);

Uri imageUrl = new("https://openai-documentation.vercel.app/images/cat_and_otter.png");
using HttpClient http = new();

// Download an image as stream
using var stream = await http.GetStreamAsync(imageUrl);

OpenAIResponse response1 = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("What is in this image?"),
        ResponseContentPart.CreateInputImagePart(BinaryData.FromStream(stream), "image/png")
    ])
]);

Console.WriteLine($"From image stream: {response1.GetOutputText()}");

// Download an image as byte array
byte[] bytes = await http.GetByteArrayAsync(imageUrl);

OpenAIResponse response2 = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("What is in this image?"),
        ResponseContentPart.CreateInputImagePart(BinaryData.FromBytes(bytes), "image/png")
    ])
]);

Console.WriteLine($"From byte array: {response2.GetOutputText()}");
```

:::

传递文件 ID

**分析图像内容**

::: code-group
```javascript
import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI();

// Function to create a file with the Files API
async function createFile(filePath) {
  const fileContent = fs.createReadStream(filePath);
  const result = await openai.files.create({
    file: fileContent,
    purpose: "vision",
  });
  return result.id;
}

// Getting the file ID
const fileId = await createFile("path_to_your_image.jpg");

const response = await openai.responses.create({
  model: "gpt-4.1-mini",
  input: [
    {
      role: "user",
      content: [
        { type: "input_text", text: "what's in this image?" },
        {
          type: "input_image",
          file_id: fileId,
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

# Function to create a file with the Files API
def create_file(file_path):
  with open(file_path, "rb") as file_content:
    result = client.files.create(
        file=file_content,
        purpose="vision",
    )
    return result.id

# Getting the file ID
file_id = create_file("path_to_your_image.jpg")

response = client.responses.create(
    model="gpt-4.1-mini",
    input=[{
        "role": "user",
        "content": [
            {"type": "input_text", "text": "what's in this image?"},
            {
                "type": "input_image",
                "file_id": file_id,
            },
        ],
    }],
)

print(response.output_text)
```

```csharp
using OpenAI.Files;
using OpenAI.Responses;

string key = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
OpenAIResponseClient client = new(model: "gpt-5", apiKey: key);

string filename = "cat_and_otter.png";
Uri imageUrl = new($"https://openai-documentation.vercel.app/images/{filename}");
using var http = new HttpClient();

// Download an image as stream
using var stream = await http.GetStreamAsync(imageUrl);

OpenAIFileClient files = new(key);
OpenAIFile file = await files.UploadFileAsync(BinaryData.FromStream(stream), filename, FileUploadPurpose.Vision);

OpenAIResponse response = (OpenAIResponse)client.CreateResponse([
    ResponseItem.CreateUserMessageItem([
        ResponseContentPart.CreateInputTextPart("what's in this image?"),
        ResponseContentPart.CreateInputImagePart(file.Id)
    ])
]);

Console.WriteLine(response.GetOutputText());
```

:::

### 图像输入要求

输入图像必须满足以下要求才能在 API 中使用。

<table><tbody><tr><td>支持的文件类型</td><td><ul><li>PNG (<code>.png</code>) - JPEG (<code>.jpeg</code> 和 <code>.jpg</code>) - WEBP (<code>.webp</code>) - 非动画 GIF (<code>.gif</code>)</li></ul></td></tr><tr><td>大小限制</td><td><ul><li>每个请求最大 512 MB 总负载大小 - 每个请求最多 1500 个单独图像输入</li></ul></td></tr><tr><td>其他要求</td><td><ul><li>无水印或徽标 - 无 NSFW 内容 - 清晰度足以让人类理解</li></ul></td></tr></tbody></table>

### 选择图像细节级别

`detail` 参数告诉模型在处理和理解图像时使用什么级别的细节（`low`、`high`、`original` 或 `auto`）。如果您跳过该参数，模型将使用 `auto`。此行为在 Responses API 和 Chat Completions API 中相同。在 `gpt-5.5` 上，`auto` 和默认省略行为等同于 `original`。

```

"image_url": {
    "url": "https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg",
    "detail": "original"
},
```

```
{
    "type": "input_image",
    "image_url": "https://api.nga.gov/iiif/a2e6da57-3cd1-4235-b20e-95dcaefed6c8/full/!800,800/0/default.jpg",
    "detail": "original"
}
```

使用以下指导来选择细节级别：

| 细节级别 | 最适合 |
| --- | --- |
| `low` | 当精细视觉细节不重要时的快速、低成本理解。模型接收图像的低分辨率 512px x 512px 版本。 |
| `high` | 标准高保真图像理解。 |
| `original` | 大型、密集、空间敏感或计算机使用图像。在 `gpt-5.4` 及未来模型上可用。 |
| `auto` | 自动细节选择。在 `gpt-5.5` 上，`auto` 和省略/默认行为等同于 `original`。 |

对于 `gpt-5.4` 及未来模型上的计算机使用、定位和点击精度用例，我们建议使用 `"detail": "original"`。有关更多详情，请参阅[计算机使用指南](/guides/tools-computer-use)。

在下方的[模型缩放行为](#model-sizing-behavior)部分阅读更多关于模型如何调整图像大小的信息，以及在[计算成本](#calculating-costs)部分了解 token 成本。

### 模型缩放行为

不同模型在图像 token 化之前使用不同的缩放规则：

| 模型系列 | 支持的细节级别 | 补丁和缩放行为 |
| --- | --- | --- |
| `gpt-5.5` | `low`、`high`、`original`、`auto` | `high` 允许最多 2,500 个补丁或最大 2048 像素维度。`original` 允许最多 10,000 个补丁或最大 6000 像素维度。如果超出任一限制，我们会在保持纵横比的同时缩小图像以适应所选细节级别的两个约束中较小的那个。`auto` 和省略的 `detail` 使用与 `original` 相同的缩放行为。[完整缩放详情见下方。](#patch-based-image-tokenization) |
| `gpt-5.4` | `low`、`high`、`original`、`auto` | `high` 允许最多 2,500 个补丁或最大 2048 像素维度。`original` 允许最多 10,000 个补丁或最大 6000 像素维度。如果超出任一限制，我们会在保持纵横比的同时缩小图像以适应所选细节级别的两个约束中较小的那个。`auto` 和省略的 `detail` 使用与 `high` 相同的缩放行为。[完整缩放详情见下方。](#patch-based-image-tokenization) |
| `gpt-5.4-mini`、`gpt-5.4-nano`、`gpt-5-mini`、`gpt-5-nano`、`gpt-5.2`、`gpt-5.3-codex`、`gpt-5-codex-mini`、`gpt-5.1-codex-mini`、`gpt-5.2-codex`、`gpt-5.2-chat-latest`、`o4-mini`，以及 `gpt-4.1-mini` 和 `gpt-4.1-nano` 2025-04-14 快照变体 | `low`、`high`、`auto` | `high` 允许最多 1,536 个补丁或最大 2048 像素维度。如果超出任一限制，我们会在保持纵横比的同时缩小图像以适应两个约束中较小的那个。[完整缩放详情见下方。](#patch-based-image-tokenization) |
| `GPT-4o`、`GPT-4.1`、`GPT-4o-mini`、`computer-use-preview` 和 o 系列模型（`o4-mini` 除外） | `low`、`high`、`auto` | 使用基于瓦片的缩放行为。请参阅[下方的详细行为](#gpt-4o-gpt-41-gpt-4o-mini-cua-and-o-series-except-o4-mini) |

## 计算成本

图像输入以类似于文本输入的 token 单位计量和收费。图像如何转换为文本 token 输入因模型而异。您可以在[定价页面](https://openai.com/api/pricing/)的常见问题部分找到视觉定价计算器。

### 基于补丁的图像 token 化

一些模型通过用 32px x 32px 的补丁覆盖图像来进行 token 化。每个模型定义了最大补丁预算。图像的 token 成本按以下方式确定：

A. 计算覆盖原始图像需要多少个 32px x 32px 的补丁。补丁可能会延伸到图像边界之外。

```
original_patch_count = ceil(width/32)×ceil(height/32)
```

B. 如果原始图像超出模型的补丁预算，则按比例缩小直到适合该预算。然后调整缩放比例，使最终调整大小后的图像在转换为整数像素尺寸并计算补丁覆盖后仍在预算内。

```
shrink_factor = sqrt((32^2 * patch_budget) / (width * height))
adjusted_shrink_factor = shrink_factor * min(
  floor(width * shrink_factor / 32) / (width * shrink_factor / 32),
  floor(height * shrink_factor / 32) / (height * shrink_factor / 32)
)
```

C. 将调整后的缩放比例转换为整数像素尺寸，然后计算覆盖调整大小后图像所需的补丁数量。此调整后的补丁计数是应用模型乘数之前的图像 token 计数，并且以模型的补丁预算为上限。

```
resized_patch_count = ceil(resized_width/32)×ceil(resized_height/32)
```

D. 根据模型应用乘数以获得总 token 数：

| 模型 | 乘数 |
| --- | --- |
| `gpt-5.4-mini` | 1.62 |
| `gpt-5.4-nano` | 2.46 |
| `gpt-5-mini` | 1.62 |
| `gpt-5-nano` | 2.46 |
| `gpt-4.1-mini*` | 1.62 |
| `gpt-4.1-nano*` | 2.46 |
| `o4-mini` | 1.72 |

_对于 `gpt-4.1-mini` 和 `gpt-4.1-nano`，这适用于 2025-04-14 快照变体。_

**具有 1,536 补丁预算的模型的成本计算示例**

*   一张 1024 x 1024 的图像调整后的补丁计数为 **1024**
    *   A. `original_patch_count = ceil(1024 / 32) * ceil(1024 / 32) = 32 * 32 = 1024`
    *   B. `1024` 低于 `1,536` 补丁预算，因此无需调整大小。
    *   C. `resized_patch_count = 1024`
    *   应用模型乘数前的调整后补丁计数：`1024`
    *   乘以模型的 token 乘数以获得计费 token 单位。
*   一张 1800 x 2400 的图像调整后的补丁计数为 **1452**
    *   A. `original_patch_count = ceil(1800 / 32) * ceil(2400 / 32) = 57 * 75 = 4275`
    *   B. `4275` 超出 `1,536` 补丁预算，因此我们首先计算 `shrink_factor = sqrt((32^2 * 1536) / (1800 * 2400)) = 0.603`。
    *   然后我们调整该缩放比例，使最终整数像素尺寸在补丁计数后仍在预算内：`adjusted_shrink_factor = 0.603 * min(floor(1800 * 0.603 / 32) / (1800 * 0.603 / 32), floor(2400 * 0.603 / 32) / (2400 * 0.603 / 32)) = 0.586`。
    *   整数像素的调整后图像：`1056 x 1408`
    *   C. `resized_patch_count = ceil(1056 / 32) * ceil(1408 / 32) = 33 * 44 = 1452`
    *   应用模型乘数前的调整后补丁计数：`1452`
    *   乘以模型的 token 乘数以获得计费 token 单位。

### 基于瓦片的图像 token 化

#### GPT-4o、GPT-4.1、GPT-4o-mini、CUA 和 o 系列（o4-mini 除外）

图像的 token 成本由两个因素决定：大小和细节。

任何 `"detail": "low"` 的图像花费固定的基础 token 数量。此数量因模型而异。要计算 `"detail": "high"` 图像的成本，我们执行以下操作：

*   缩放以适应 2048px x 2048px 的正方形，保持原始纵横比
*   缩放使图像最短边为 768px 长
*   计算图像中 512px 正方形的数量。每个正方形花费固定数量的 token，如下所示。
*   将基础 token 添加到总数中

| 模型 | 基础 token | 瓦片 token |
| --- | --- | --- |
| gpt-5, gpt-5-chat-latest | 70 | 140 |
| 4o, 4.1, 4.5 | 85 | 170 |
| 4o-mini | 2833 | 5667 |
| o1, o1-pro, o3 | 75 | 150 |
| computer-use-preview | 65 | 129 |

### GPT Image 1

对于 GPT Image 1，我们以与上述相同的方式计算图像输入的成本，不同之处在于我们将图像缩小使最短边为 512px 而不是 768px。价格取决于图像的尺寸和[输入保真度](/guides/image-generation?image-generation-model=gpt-image-1#input-fidelity)。

当输入保真度设置为 low 时，基础成本为 65 个图像 token，每个瓦片花费 129 个图像 token。使用 high 输入保真度时，我们会根据图像的纵横比在上述图像 token 之外添加固定数量的 token。

*   如果您的图像是正方形的，我们会额外添加 4160 个输入图像 token。
*   如果更接近纵向或横向，我们会额外添加 6240 个 token。

要查看图像输入 token 的定价，请参阅我们的[定价页面](/pricing#latest-models)。

## 限制

虽然具有视觉能力的模型功能强大，可以在许多场景中使用，但了解这些模型的限制很重要。以下是一些已知的限制：

*   **医学图像**：该模型不适合解读 CT 扫描等专业医学图像，不应用于医疗建议。
*   **非英语**：该模型在处理包含非拉丁字母文本（如日语或韩语）的图像时可能表现不佳。
*   **小文本**：放大图像中的文本以提高可读性。如果可用，使用 `"detail": "original"` 也可以帮助提升性能。
*   **旋转**：该模型可能会误解旋转或倒置的文本和图像。
*   **视觉元素**：该模型可能难以理解颜色或样式（如实线、虚线或点线）变化的图表或文本。
*   **空间推理**：该模型在需要精确空间定位的任务上表现不佳，例如识别国际象棋位置。
*   **准确性**：该模型在某些场景中可能生成不正确的描述或标题。
*   **图像形状**：该模型在处理全景图和鱼眼图像时表现不佳。
*   **元数据和缩放**：该模型不处理原始文件名或元数据。根据图像大小和 `detail` 级别，图像可能在分析前被调整大小，影响其原始尺寸。
*   **计数**：该模型可能对图像中的物体给出近似计数。
*   **验证码**：出于安全原因，我们的系统会阻止提交验证码。

* * *

我们在 token 级别处理图像，因此我们处理的每张图像都计入您的每分钟 token 数（TPM）限制。

有关图像处理的最精确和最新估算，请使用我们的图像定价计算器，可在[此处](https://openai.com/api/pricing/)获取。
