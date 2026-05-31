# Sending files

> 了解如何通过 Actions 发送和接收文件。

## 发送文件

POST 请求最多可以包含对话中的十个文件（包括 DALL-E 生成的图片）。它们将以 URL 形式发送，有效期为五分钟。

要将文件包含在 POST 请求中，参数必须命名为 `openaiFileIdRefs`，描述应向模型说明你的 API 期望接收的文件类型和数量。

`openaiFileIdRefs` 参数将填充一个 JSON 对象数组。每个对象包含：

*   `name` 文件名称。由 DALL-E 创建时将自动生成名称。
*   `id` 文件的稳定标识符。
*   `mime_type` 文件的 MIME 类型。对于用户上传的文件，这基于文件扩展名确定。
*   `download_link` 用于获取文件的 URL，有效期为五分钟。

以下是包含两个元素的 `openaiFileIdRefs` 数组示例：

```
[
  {
    "name": "dalle-Lh2tg7WuosbyR9hk",
    "id": "file-XFlOqJYTPBPwMZE3IopCBv1Z",
    "mime_type": "image/webp",
    "download_link": "https://files.oaiusercontent.com/file-XFlOqJYTPBPwMZE3IopCBv1Z?se=2024-03-11T20%3A29%3A52Z&sp=r&sv=2021-08-06&sr=b&rscc=max-age%3D31536000%2C%20immutable&rscd=attachment%3B%20filename%3Da580bae6-ea30-478e-a3e2-1f6c06c3e02f.webp&sig=ZPWol5eXACxU1O9azLwRNgKVidCe%2BwgMOc/TdrPGYII%3D"
  },
  {
    "name": "2023 Benefits Booklet.pdf",
    "id": "file-s5nX7o4junn2ig0J84r8Q0Ew",
    "mime_type": "application/pdf",
    "download_link": "https://files.oaiusercontent.com/file-s5nX7o4junn2ig0J84r8Q0Ew?se=2024-03-11T20%3A29%3A52Z&sp=r&sv=2021-08-06&sr=b&rscc=max-age%3D299%2C%20immutable&rscd=attachment%3B%20filename%3D2023%2520Benefits%2520Booklet.pdf&sig=Ivhviy%2BrgoyUjxZ%2BingpwtUwsA4%2BWaRfXy8ru9AfcII%3D"
  }
]
```

Actions 可以包含用户上传的文件、DALL-E 生成的图片以及 Code Interpreter 创建的文件。

### OpenAPI 示例

```
/createWidget:
  post:
    operationId: createWidget
    summary: Creates a widget based on an image.
    description: Uploads a file reference using its file id. This file should be an image created by DALL·E or uploaded by the user. JPG, WEBP, and PNG are supported for widget creation.
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              openaiFileIdRefs:
                type: array
                items:
                  type: string
```

虽然此 schema 将 `openaiFileIdRefs` 显示为 `string` 类型的数组，但在运行时它将如前所示填充为 JSON 对象数组。

## 返回文件

请求最多可以返回 10 个文件。每个文件最大为 10 MB，且不能是图片或视频。

这些文件将成为对话的一部分，类似于用户上传的文件，这意味着它们可以提供给 code interpreter、file search 使用，也可以在后续的 action 调用中发送。在 Web 应用中，用户将看到文件已返回并可以下载它们。

要返回文件，响应体必须包含 `openaiFileResponse` 参数。此参数必须始终是数组，并且必须以以下两种方式之一填充。

### 内联方式

数组的每个元素是一个 JSON 对象，包含：

*   `name` 文件名称。用户可见。
*   `mime_type` 文件的 MIME 类型。用于确定资格以及哪些功能可以访问该文件。
*   `content` 文件内容的 base64 编码。

以下是包含两个元素的 openaiFileResponse 数组示例：

```
[
  {
    "name": "example_document.pdf",
    "mime_type": "application/pdf",
    "content": "JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PC9MZW5ndGggNiAwIFIvRmlsdGVyIC9GbGF0ZURlY29kZT4+CnN0cmVhbQpHhD93PQplbmRzdHJlYW0KZW5kb2JqCg=="
  },
  {
    "name": "sample_spreadsheet.csv",
    "mime_type": "text/csv",
    "content": "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
  }
]
```

OpenAPI 示例

```
/papers:
  get:
    operationId: findPapers
    summary: Retrieve PDFs of relevant academic papers.
    description: Provided an academic topic, up to five relevant papers will be returned as PDFs.
    parameters:
      - in: query
        name: topic
        required: true
        schema:
          type: string
        description: The topic the papers should be about.
    responses:
      "200":
        description: Zero to five academic paper PDFs
        content:
          application/json:
            schema:
              type: object
              properties:
                openaiFileResponse:
                  type: array
                  items:
                    type: object
                    properties:
                      name:
                        type: string
                        description: The name of the file.
                      mime_type:
                        type: string
                        description: The MIME type of the file.
                      content:
                        type: string
                        format: byte
                        description: The content of the file in base64 encoding.
```

### URL 方式

数组的每个元素是一个引用待下载文件的 URL。必须设置 `Content-Disposition` 和 `Content-Type` 头，以便确定文件名和 MIME 类型。文件名将对用户可见。文件的 MIME 类型决定资格以及哪些功能可以访问该文件。

获取每个文件的超时时间为 10 秒。

以下是包含两个元素的 `openaiFileResponse` 数组示例：

```
[
  "https://example.com/f/dca89f18-16d4-4a65-8ea2-ededced01646",
  "https://example.com/f/01fad6b0-635b-4803-a583-0f678b2e6153"
]
```

以下是每个 URL 所需的头信息示例：

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="example_document.pdf"
```

OpenAPI 示例

```
/papers:
  get:
    operationId: findPapers
    summary: Retrieve PDFs of relevant academic papers.
    description: Provided an academic topic, up to five relevant papers will be returned as PDFs.
    parameters:
      - in: query
        name: topic
        required: true
        schema:
          type: string
        description: The topic the papers should be about.
    responses:
      '200':
        description: Zero to five academic paper PDFs
        content:
            application/json:
              schema:
                type: object
                properties:
                  openaiFileResponse:
                    type: array
                    items:
                    type: string
                    format: uri
                    description: URLs to fetch the files.
```
