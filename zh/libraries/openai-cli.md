<!-- Source: https://developers.openai.com/api/docs/libraries/openai-cli -->

通过 `openai` 命令行工具，直接在终端中与 OpenAI API 交互。

## 安装

使用 Homebrew 安装 CLI：

```
brew install openai/tools/openai
```

或使用 Go 1.25 及以上版本安装：

```
go install 'github.com/openai/openai-cli/cmd/openai@latest'
```

旧版本的 Python SDK 也会安装一个旧版 `openai` 命令。如果你之前已经安装了该包，且看到的命令与本指南不符，可能是你的 shell 仍在解析旧的二进制文件。全新安装的 CLI 不受影响。

## 认证

CLI 从 `OPENAI_API_KEY` 读取你的 API 密钥：

命令：

```
export OPENAI_API_KEY="sk-..."
```

如果你还没有 API 密钥，请[在控制台中创建一个](https://platform.openai.com/api-keys)。

对于 Admin API 端点，请改为设置 `OPENAI_ADMIN_KEY`。SDK 层会根据调用的端点自动选择管理员密钥或默认 API 密钥。

要指向不同的 API 主机，请设置 `OPENAI_BASE_URL`。

## 使用场景

当工作自然属于终端时，使用 CLI：

*   生成本地产物，如图像或语音。
*   将结构化数据提取为 JSONL，供后续 shell 步骤使用。
*   在云端使用 Responses 处理文件、计算机使用和当前 Web 上下文。
*   使用 Admin API 创建项目和 API 密钥。

直接用于一次性终端请求，或在代理需要对文件和生成产物进行可重复批量工作时从脚本中使用。

## CLI 与 Codex 子代理的对比

当你需要可检查和重新运行的可重复 API 工作时使用 CLI，例如批量提取、文件转换、产物生成或精确的模型选择。当工作仍需要判断时使用子代理，例如探索代码、比较假设、调试或审查变更。

## 全局标志

这些选项适用于所有命令：

| 标志 | 用途 |
| --- | --- |
| `--format` | 以 `auto`、`json`、`jsonl`、`pretty`、`raw`、`yaml` 或 `explore` 格式打印响应。 |
| `--transform` | 在打印前使用 GJSON 路径提取或重塑响应数据。 |
| `--debug` | 将请求和响应详情打印到 stderr。授权信息会被脱敏；分享日志前请检查头信息。 |

本指南重点介绍 CLI 模式。有关任何 API 系列的最新参数和响应格式，请使用在线 [API 参考](/api/reference)。

当你需要将 CLI 指向另一个兼容端点时，也可以更改基础 URL，例如支持不同模型集或仅支持部分 API 接口的部署。

## Responses

使用 Responses 进行文本生成、结构化提取、网络搜索、文件理解以及可重复的 Codex 编写的批处理脚本。

### 发送你的第一个请求

命令：

```
openai responses create \
--model gpt-5.5 \
--input "Say hello in one sentence."
```

输出：

```
{
  "id": "resp_...",
  "object": "response",
  "status": "completed",
  "model": "gpt-5.5-...",
  "output": [
    {
      "type": "message",
      "role": "assistant",
      "content": [
        {
          "type": "output_text",
          "text": "Hello!"
        }
      ]
    }
  ],
  "usage": {
    "input_tokens": 12,
    "output_tokens": 6,
    "total_tokens": 18
  },
  "...": "additional response fields omitted"
}
```

CLI 默认打印完整的 API 响应对象。本页示例保留了代表性字段如 `id`、`status`、`model`、`output` 和 `usage`，其余省略。

Responses 输出可能在助手消息之前包含非消息项，例如推理项。当你需要助手文本时，请按类型选择消息项，而不是假设它总是 `output[0]`：

```
--transform 'output.#(type=="message").content.0.text'
```

### 将本地文件添加到提示中

对于简单的本地文件，使用命令替换内联构建提示：

```
openai responses create \
--model gpt-5.5 \
--input "Summarize this note in one sentence.

<note>
$(cat ./note.md)
</note>" \
--format yaml \
--transform 'output.#(type=="message").content.0.text'
```

输出：

```
The note says the launch checklist is ready except for final support ownership.
```

### 传递请求体

对于简短的标量输入使用标志。对于多行提示、工具、文件或嵌套请求体使用 YAML heredoc。heredoc 可以包含与标志相同的请求字段。

注意看起来像 YAML 的字符串值，特别是包含 `:` 或 `{}` 的提示。在标志上，生成的解析器可能会将这些值解释为结构化 YAML 而非纯文本。如果提示开始看起来像配置，请将其放在 YAML 体中的 `input: |` 下：

命令：

```
openai responses create \
  --format yaml \
  --transform 'output.#(type=="message").content.0.text' <<'YAML'
model: gpt-5.5
instructions: Return exactly one sentence.
max_output_tokens: 120
input: |
  Summarize this release note in one sentence.

  <release_note>
  Fixed the image generation example and added CLI installation guidance.
  </release_note>
YAML
```

输出：

```
The release note updates the CLI docs with corrected image generation and installation guidance.
```

当提示本身需要 shell 组装时，构建 YAML 体并通过管道传入命令：

```
{
printf 'input: |\n'
printf '  Summarize this note in one sentence.\n\n'
printf '  <note>\n'
sed 's/^/  /' ./note.md
printf '  </note>\n'
} | openai responses create \
--model gpt-5.5 \
--format yaml \
--transform 'output.#(type=="message").content.0.text'
```

### 将结构化数据写入 JSON

当下游脚本需要稳定的 JSON 时，使用结构化输出。将可复用的 schema 保存到磁盘：

保存为 `schema.json`：

```
{
  "type": "json_schema",
  "name": "fact",
  "strict": true,
  "schema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "person": { "type": "string" },
      "topic": { "type": "string" }
    },
    "required": ["person", "topic"]
  }
}
```

命令：

```
openai responses create \
--model gpt-5.5 \
--instructions "Extract the person and topic from the input." \
--input "Ada Lovelace wrote notes about the Analytical Engine." \
--text.format "$(cat ./schema.json)" \
--format yaml \
--transform 'output.#(type=="message").content.0.text'
```

输出：

```
{ "person": "Ada Lovelace", "topic": "notes about the Analytical Engine" }
```

### 将结构化记录写入 JSONL

当一个输入可能产生多条记录时，让模型返回数组并将其展平为 JSONL，以便后续 shell 步骤可以逐行处理一条记录：

保存为 `records-schema.json`：

```
{
  "type": "json_schema",
  "name": "items",
  "strict": true,
  "schema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "items": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "title": { "type": "string" },
            "summary": { "type": "string" },
            "evidence": { "type": "string" }
          },
          "required": ["title", "summary", "evidence"]
        }
      }
    },
    "required": ["items"]
  }
}
```

命令：

```
: > records.jsonl

for file in notes/*.md; do
  extracted="$(
    openai responses create \
      --model gpt-5.5 \
      --text.format "$(cat ./records-schema.json)" \
      --raw-output \
      --transform 'output.#(type=="message").content.0.text' <<YAML
input: |
  <note path="$file">
$(sed 's/^/  /' "$file")
  </note>
YAML
  )"

  jq -r --arg source "$file" \
    '.items[]? + {source: $source} | @json' \
    <<<"$extracted" >> records.jsonl
done
```

这保持了模型响应的结构化，同时为后续 shell 步骤生成每行一个 JSON 对象。

### 网络搜索

Responses 可以从同一个 YAML 请求体中调用托管工具：

命令：

```
openai responses create \
--model gpt-5.5 \
--format yaml \
--transform 'output.#(type=="message").content.0.text' <<'YAML'
tools:
- type: web_search
input: |
Research the latest material news for AAPL.
Return three concise bullets and cite sources in the text.
YAML
```

输出：

```
- Apple announced ...
- Analysts highlighted ...
- The company said ...
```

### 文件输入

对于上传的文件（如 PDF），先创建文件，获取其 ID，然后将其作为 `input_file.file_id` 传递：

命令：

```
FILE_ID=$(
  openai files create \
    --file ./brief.pdf \
    --purpose user_data \
    --format yaml \
    --transform id
)

openai responses create \
  --model gpt-5.5 \
  --format yaml \
  --transform 'output.#(type=="message").content.0.text' <<YAML
input:
  - role: user
    content:
      - type: input_text
        text: Summarize this brief and list three risks.
      - type: input_file
        file_id: ${FILE_ID}
YAML
```

输出：

```
- The brief proposes ...
- Risks: migration timing, unclear rollback criteria, and unresolved support ownership.
```

最近生成的构建版本会将本地文件标志作为带有文件名和内容类型元数据的 multipart 文件部分发送。如果本地上传命令因 `UploadFile` 类型错误而失败，请更新 CLI 并重试。

## 图像

### 生成图像

生成图像，提取 base64 负载，并将其解码为普通资源文件：

命令：

```
openai images generate \
  --model gpt-image-2 \
  --prompt "A simple product-style render of a translucent green cube on a neutral background." \
  --format yaml \
  --transform 'data.0.b64_json' | base64 --decode > hero.png
printf 'wrote hero.png\n'
```

输出：

```
wrote hero.png
```

当前限制：图像命令尚不支持原生 `--output`，因此图像生成仍需要自行提取 `b64_json` 并解码。

对于 `gpt-image-2`，省略 `--input-fidelity`；图像输入始终以高保真度处理。不要对 `gpt-image-2` 使用 `--background transparent`。该模型还支持比早期 GPT Image 模型更广泛的 `--size` 值，只要请求的分辨率满足 Image API 的尺寸约束。

### 编辑图像

图像编辑在编辑请求成功后使用相同的 base64 提取模式：

命令：

```
openai images edit \
  --model gpt-image-2 \
  --image ./hero.png \
  --prompt "Turn the cube bright green." \
  --format yaml \
  --transform 'data.0.b64_json' | base64 --decode > hero-edited.png
printf 'wrote hero-edited.png\n'
```

输出：

```
wrote hero-edited.png
```

如果本地图像编辑上传因 `UploadFile` 类型错误而失败，请更新 CLI 并重试。

## 语音

使用语音 API 在本地创建 MP3：

命令：

```
openai audio:speech create \
  --model gpt-4o-mini-tts \
  --voice marin \
  --input "The OpenAI CLI can call the API from ordinary shell scripts." \
  --output speech.mp3
```

输出：

```
Wrote output to: speech.mp3
```

使用你机器上可用的任何本地音频工具播放。在 macOS 上：

```
afplay speech.mp3
```

使用 `--instructions` 来塑造表达方式，使用 `--input` 来指定要朗读的文字。指令适用于节奏、活力、温暖度、正式程度、重点或受众等提示：

```
openai audio:speech create \
  --model gpt-4o-mini-tts \
  --voice marin \
  --instructions "Whisper very quickly, like a hurried stage cue, while staying clear and intelligible." \
  --input "The launch checklist is ready. Please send final feedback by Friday at noon." \
  --output reminder.mp3
```

## 转录

为 shell 管道打印纯文本转录：

命令：

```
openai audio:transcriptions create \
  --model gpt-4o-transcribe \
  --file ./speech.mp3 \
  --transform text \
  --raw-output
```

输出：

```
The OpenAI CLI can call the API from ordinary shell scripts.
```

使用与你需要的产物匹配的响应格式：

| 需求 | 命令形式 |
| --- | --- |
| 纯文本转录 | `--model gpt-4o-transcribe --transform text --raw-output` |
| 字幕文件 | `--model whisper-1 --response-format srt` 或 `--response-format vtt` |
| 片段或词级时间戳 | `--model whisper-1 --response-format verbose_json` |
| 带说话人标签的分段 | `--model gpt-4o-transcribe-diarize --response-format diarized_json` |

对于词级时间信息，请求详细转录格式：

命令：

```
openai audio:transcriptions create \
  --model whisper-1 \
  --file ./speech.mp3 \
  --response-format verbose_json \
  --timestamp-granularity word \
  --format json
```

输出：

```
{
  "task": "transcribe",
  "language": "english",
  "duration": 6,
  "text": "The OpenAI CLI can call the API from ordinary shell scripts.",
  "words": [
    { "word": "The", "start": 0, "end": 0.42 },
    { "word": "OpenAI", "start": 0.42, "end": 1.22 }
  ],
  "...": "additional response fields omitted"
}
```

对于带说话人标签的输出，使用分段模型并请求 `diarized_json`：

命令：

```
openai audio:transcriptions create \
  --model gpt-4o-transcribe-diarize \
  --file ./speech.mp3 \
  --response-format diarized_json \
  --format json
```

输出：

```
{
  "text": "The OpenAI CLI can call the API from ordinary shell scripts.",
  "segments": [
    {
      "type": "transcript.text.segment",
      "id": "seg_0",
      "start": 0.05,
      "end": 5.25,
      "text": " The OpenAI CLI can call the API from ordinary shell scripts.",
      "speaker": "A"
    }
  ],
  "...": "additional response fields omitted"
}
```

`whisper-1` 支持 `json`、`text`、`srt`、`verbose_json` 和 `vtt`。`diarized_json` 是携带 `segments[].speaker` 的格式；使用相同的分段模型和普通 `json` 时，响应包含转录文本但不包含说话人标签。

## Admin API

使用 Admin API 进行组织管理、凭证配置、合规性和使用量监控工作流。设置 `OPENAI_ADMIN_KEY`，然后调用生成的 `admin:organization:*` 命令。

要配置新的机器凭证，[创建一个项目](/api/reference/resources/admin/subresources/organization/subresources/projects/methods/create)，在该项目中[创建一个服务账户](/api/reference/resources/admin/subresources/organization/subresources/projects/subresources/service_accounts/methods/create)，然后使用返回的 API 密钥。

### 创建项目、服务账户和 API 密钥

在该项目中创建服务账户会返回该服务账户的未脱敏 API 密钥。

命令：

```
# Create the project that will own this app or agent and save the response.
openai admin:organization:projects create \
  --name "automation project" \
  --format json > project.json
PROJECT_ID="$(jq -r '.id' project.json)"

# Create a service account inside the project and save the full response.
openai admin:organization:projects:service-accounts create \
  --project-id "$PROJECT_ID" \
  --name "automation bot" \
  --format json > service-account.json

# Extract the returned API key into an env file for the workload to use.
jq -r '.api_key.value | "OPENAI_API_KEY=\(.)"' \
  service-account.json > .env
```

输出：

```
{
  "object": "organization.project.service_account",
  "id": "svc_acct_...",
  "name": "automation bot",
  "role": "member",
  "api_key": {
    "id": "key_...",
    "value": "sk-..."
  }
}
```

这会将项目响应写入 `project.json`，将其 ID 解析到下一个命令中，将服务账户响应写入 `service-account.json`，并将返回的凭证以 `OPENAI_API_KEY=...` 的形式写入 `.env`。将这两个 JSON 文件视为机密，并在仓库中使用此模式之前将 `project.json`、`service-account.json` 和 `.env` 添加到 `.gitignore`。

有关其余接口，请参阅 [Admin API 指南](/api/docs/guides/admin-apis)和当前的 [Administration API 参考](/api/reference/administration/overview)。请谨慎授予未经审查的参与者对管理员密钥的访问权限。
