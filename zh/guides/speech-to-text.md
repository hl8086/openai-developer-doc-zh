
Audio API 提供两个语音转文字端点：

*   `transcriptions`
*   `translations`

从历史上看，这两个端点都由我们的开源 [Whisper 模型](https://openai.com/blog/whisper/)（`whisper-1`）支持。`transcriptions` 端点现在还支持更高质量的模型快照，但参数支持有限：

*   `gpt-4o-mini-transcribe`
*   `gpt-4o-transcribe`
*   `gpt-4o-transcribe-diarize`

所有端点都可用于：

*   将音频转录为音频所使用的语言。
*   将音频翻译并转录为英语。

文件上传目前限制为 25 MB，支持以下输入文件类型：`mp3`、`mp4`、`mpeg`、`mpga`、`m4a`、`wav` 和 `webm`。用于说话人分离的已知说话人参考片段在以数据 URL 形式提供时接受相同的格式。

本指南适用于文件上传和有界音频请求。如果您的应用程序需要从麦克风、通话或媒体流中获取实时转录增量，请改用[实时转录](/guides/realtime-transcription)。

## 快速开始

### 转录

转录 API 接受您要转录的音频文件和所需的转录输出文件格式作为输入。所有模型支持相同的输入格式集。在输出方面：

*   `whisper-1` 支持 `json`、`text`、`srt`、`verbose_json` 和 `vtt`。
*   `gpt-4o-transcribe` 和 `gpt-4o-mini-transcribe` 支持 `json` 或纯 `text`。
*   `gpt-4o-transcribe-diarize` 支持 `json`、`text` 和 `diarized_json`（在响应中添加说话人片段）。

**转录音频**

::: code-group
```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream("/path/to/file/audio.mp3"),
  model: "gpt-4o-transcribe",
});

console.log(transcription.text);
```

```python
from openai import OpenAI

client = OpenAI()
audio_file= open("/path/to/file/audio.mp3", "rb")

transcription = client.audio.transcriptions.create(
    model="gpt-4o-transcribe", 
    file=audio_file
)

print(transcription.text)
```

:::
```cli
openai audio:transcriptions create \
  --model gpt-4o-transcribe \
  --file /path/to/file/audio.mp3 \
  --raw-output \
  --transform text
```
```curl
curl --request POST \
  --url https://api.openai.com/v1/audio/transcriptions \
  --header "Authorization: Bearer $OPENAI_API_KEY" \
  --header 'Content-Type: multipart/form-data' \
  --form file=@/path/to/file/audio.mp3 \
  --form model=gpt-4o-transcribe
```

默认情况下，响应类型为 json，其中包含原始文本。

```
{
  "text": "Imagine the wildest idea that you've ever had, and you're curious about how it might scale to something that's a 100, a 1,000 times bigger.
....
}
```

Audio API 还允许您在请求中设置其他参数。例如，如果您想将 `response_format` 设置为 `text`，您的请求将如下所示：

**其他选项**

::: code-group
```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream("/path/to/file/speech.mp3"),
  model: "gpt-4o-transcribe",
  response_format: "text",
});

console.log(transcription.text);
```

```python
from openai import OpenAI

client = OpenAI()
audio_file = open("/path/to/file/speech.mp3", "rb")

transcription = client.audio.transcriptions.create(
    model="gpt-4o-transcribe", 
    file=audio_file, 
    response_format="text"
)

print(transcription.text)
```

```curl
curl --request POST \
  --url https://api.openai.com/v1/audio/transcriptions \
  --header "Authorization: Bearer $OPENAI_API_KEY" \
  --header 'Content-Type: multipart/form-data' \
  --form file=@/path/to/file/speech.mp3 \
  --form model=gpt-4o-transcribe \
  --form response_format=text
```

:::

[API 参考]( https://developers.openai.com/api/reference/audio)包含可用参数的完整列表。

`gpt-4o-transcribe` 和 `gpt-4o-mini-transcribe` 支持 `json` 或 `text` 响应，并允许使用提示词和 logprobs。`gpt-4o-transcribe-diarize` 添加了说话人标签，但当音频超过 30 秒时需要 `chunking_strategy`（建议使用 `"auto"`），且不支持提示词、logprobs 或 `timestamp_granularities[]`。

### 说话人分离

`gpt-4o-transcribe-diarize` 生成带有说话人感知的转录。请求 `diarized_json` 响应格式以接收包含 `speaker`、`start` 和 `end` 元数据的片段数组。设置 `chunking_strategy`（`"auto"` 或语音活动检测配置），以便服务可以将音频分割成片段；当输入超过 30 秒时这是必需的。

您可以选择性地提供最多四个短音频参考，使用 `known_speaker_names[]` 和 `known_speaker_references[]` 将片段映射到已知说话人。提供 2-10 秒的参考片段，支持主音频上传所支持的任何输入格式；使用 multipart form data 时将其编码为 [data URLs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs)。

**对会议录音进行说话人分离**

::: code-group
```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const agentRef = fs.readFileSync("agent.wav").toString("base64");

const transcript = await openai.audio.transcriptions.create({
  file: fs.createReadStream("meeting.wav"),
  model: "gpt-4o-transcribe-diarize",
  response_format: "diarized_json",
  chunking_strategy: "auto",
  extra_body: {
    known_speaker_names: ["agent"],
    known_speaker_references: ["data:audio/wav;base64," + agentRef],
  },
});

for (const segment of transcript.segments) {
  console.log(`${segment.speaker}: ${segment.text}`, segment.start, segment.end);
}
```

```python
import base64
from openai import OpenAI

client = OpenAI()

def to_data_url(path: str) -> str:
    with open(path, "rb") as fh:
        return "data:audio/wav;base64," + base64.b64encode(fh.read()).decode("utf-8")

with open("meeting.wav", "rb") as audio_file:
    transcript = client.audio.transcriptions.create(
        model="gpt-4o-transcribe-diarize",
        file=audio_file,
        response_format="diarized_json",
        chunking_strategy="auto",
        extra_body={
            "known_speaker_names": ["agent"],
            "known_speaker_references": [to_data_url("agent.wav")],
        },
    )

for segment in transcript.segments:
    print(segment.speaker, segment.text, segment.start, segment.end)
```

```curl
curl --request POST \
  --url https://api.openai.com/v1/audio/transcriptions \
  --header "Authorization: Bearer $OPENAI_API_KEY" \
  --header 'Content-Type: multipart/form-data' \
  --form file=@/path/to/file/meeting.wav \
  --form model=gpt-4o-transcribe-diarize \
  --form response_format=diarized_json \
  --form chunking_strategy=auto \
  --form 'known_speaker_names[]=agent' \
  --form 'known_speaker_references[]=data:audio/wav;base64,AAA...'
```

:::

当 `stream=true` 时，说话人分离响应会在片段完成时发出 `transcript.text.segment` 事件。`transcript.text.delta` 事件包含 `segment_id` 字段，但说话人分离的增量不会在每个片段最终确定之前流式传输部分说话人分配。

`gpt-4o-transcribe-diarize` 目前仅通过 `/v1/audio/transcriptions` 可用，尚不支持 Realtime API。

### 翻译

翻译 API 接受任何支持语言的音频文件作为输入，并在必要时将音频转录为英语。这与我们的 /Transcriptions 端点不同，因为输出不是原始输入语言，而是翻译为英语文本。此端点仅支持 `whisper-1` 模型。

**翻译音频**

::: code-group
```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const translation = await openai.audio.translations.create({
  file: fs.createReadStream("/path/to/file/german.mp3"),
  model: "whisper-1",
});

console.log(translation.text);
```

```python
from openai import OpenAI

client = OpenAI()
audio_file = open("/path/to/file/german.mp3", "rb")

translation = client.audio.translations.create(
    model="whisper-1", 
    file=audio_file,
)

print(translation.text)
```

```curl
curl --request POST \
  --url https://api.openai.com/v1/audio/translations \
  --header "Authorization: Bearer $OPENAI_API_KEY" \
  --header 'Content-Type: multipart/form-data' \
  --form file=@/path/to/file/german.mp3 \
  --form model=whisper-1 \
```

:::

在这个例子中，输入的音频是德语，输出的文本如下：

```
Hello, my name is Wolfgang and I come from Germany. Where are you heading today?
```

我们目前仅支持翻译为英语。

## 支持的语言

我们目前通过 `transcriptions` 和 `translations` 端点[支持以下语言](https://github.com/openai/whisper#available-models-and-languages)：

南非荷兰语、阿拉伯语、亚美尼亚语、阿塞拜疆语、白俄罗斯语、波斯尼亚语、保加利亚语、加泰罗尼亚语、中文、克罗地亚语、捷克语、丹麦语、荷兰语、英语、爱沙尼亚语、芬兰语、法语、加利西亚语、德语、希腊语、希伯来语、印地语、匈牙利语、冰岛语、印度尼西亚语、意大利语、日语、卡纳达语、哈萨克语、韩语、拉脱维亚语、立陶宛语、马其顿语、马来语、马拉地语、毛利语、尼泊尔语、挪威语、波斯语、波兰语、葡萄牙语、罗马尼亚语、俄语、塞尔维亚语、斯洛伐克语、斯洛文尼亚语、西班牙语、斯瓦希里语、瑞典语、他加禄语、泰米尔语、泰语、土耳其语、乌克兰语、乌尔都语、越南语和威尔士语。

虽然底层模型在 98 种语言上进行了训练，但我们仅列出[词错误率](https://en.wikipedia.org/wiki/Word_error_rate)（WER）低于 50% 的语言，WER 是语音转文字模型准确性的行业标准基准。对于上面未列出的语言，模型将返回结果，但质量会较低。

我们为基于 GPT-4o 的模型支持一些 ISO 639-1 和 639-3 语言代码。对于我们没有的语言代码，请尝试通过提示词指定特定语言（例如，"Output in English"）。

## 时间戳

默认情况下，转录 API 将以文本形式输出所提供音频的转录。[`timestamp_granularities[]` 参数]( https://developers.openai.com/api/reference/audio/createTranscription#audio-createtranscription-timestamp_granularities)启用更结构化和带时间戳的 json 输出格式，时间戳可以在片段级别、单词级别或两者兼有。这为转录和视频编辑提供了单词级精度，允许删除与单个单词相关联的特定帧。

**时间戳选项**

::: code-group
```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream("audio.mp3"),
  model: "whisper-1",
  response_format: "verbose_json",
  timestamp_granularities: ["word"]
});

console.log(transcription.words);
```

```python
from openai import OpenAI

client = OpenAI()
audio_file = open("/path/to/file/speech.mp3", "rb")

transcription = client.audio.transcriptions.create(
  file=audio_file,
  model="whisper-1",
  response_format="verbose_json",
  timestamp_granularities=["word"]
)

print(transcription.words)
```

```curl
curl https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F file="@/path/to/file/audio.mp3" \
  -F "timestamp_granularities[]=word" \
  -F model="whisper-1" \
  -F response_format="verbose_json"
```

:::

`timestamp_granularities[]` 参数仅支持 `whisper-1`。

## 较长的输入

默认情况下，转录 API 仅支持小于 25 MB 的文件。如果您的音频文件超过该大小，您需要将其分割成 25 MB 或更小的块，或使用压缩音频格式。为获得最佳性能，我们建议您避免在句子中间分割音频，因为这可能会导致一些上下文丢失。

处理此问题的一种方法是使用 [PyDub 开源 Python 包](https://github.com/jiaaro/pydub)来分割音频：

```
from pydub import AudioSegment

song = AudioSegment.from_mp3("good_morning.mp3")

# PyDub handles time in milliseconds
ten_minutes = 10 * 60 * 1000

first_10_minutes = song[:ten_minutes]

first_10_minutes.export("good_morning_10.mp3", format="mp3")
```

_OpenAI 不对 PyDub 等第三方软件的可用性或安全性做任何保证。_

## 提示词

您可以使用[提示词]( https://developers.openai.com/api/reference/audio/createTranscription#audio/createTranscription-prompt)来提高转录 API 生成的转录质量。

**提示词**

::: code-group
```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream("/path/to/file/speech.mp3"),
  model: "gpt-4o-transcribe",
  response_format: "text",
  prompt:"The following conversation is a lecture about the recent developments around OpenAI, GPT-4.5 and the future of AI.",
});

console.log(transcription.text);
```

```python
from openai import OpenAI

client = OpenAI()
audio_file = open("/path/to/file/speech.mp3", "rb")

transcription = client.audio.transcriptions.create(
  model="gpt-4o-transcribe", 
  file=audio_file, 
  response_format="text",
  prompt="The following conversation is a lecture about the recent developments around OpenAI, GPT-4.5 and the future of AI."
)

print(transcription.text)
```

```curl
curl --request POST \
  --url https://api.openai.com/v1/audio/transcriptions \
  --header "Authorization: Bearer $OPENAI_API_KEY" \
  --header 'Content-Type: multipart/form-data' \
  --form file=@/path/to/file/speech.mp3 \
  --form model=gpt-4o-transcribe \
  --form prompt="The following conversation is a lecture about the recent developments around OpenAI, GPT-4.5 and the future of AI."
```

:::

对于 `gpt-4o-transcribe` 和 `gpt-4o-mini-transcribe`，您可以使用 `prompt` 参数通过为模型提供额外上下文来提高转录质量，方式类似于您对其他 GPT-4o 模型的提示。`gpt-4o-transcribe-diarize` 目前不支持提示词。

以下是提示词在不同场景中如何提供帮助的一些示例：

1.  提示词可以帮助纠正模型在音频中误识别的特定单词或缩写。例如，以下提示词改善了 DALL·E 和 GPT-3 这两个词的转录，它们之前被写成 "GDP 3" 和 "DALI"："The transcript is about OpenAI which makes technology like DALL·E, GPT-3, and ChatGPT with the hope of one day building an AGI system that benefits all of humanity."
2.  为了保留被分割成片段的文件的上下文，可以用前一个片段的转录来提示模型。模型会使用前一段音频中的相关信息，从而提高转录准确性。`whisper-1` 模型仅考虑提示词的最后 224 个 token，忽略之前的所有内容。对于多语言输入，Whisper 使用自定义分词器。对于仅英语输入，它使用标准 GPT-2 分词器。两种分词器都可以在开源 [Whisper Python 包](https://github.com/openai/whisper/blob/main/whisper/tokenizer.py#L361)中找到。
3.  有时模型会在转录中跳过标点符号。为防止这种情况，请使用包含标点符号的简单提示词："Hello, welcome to my lecture."
4.  模型也可能会省略音频中常见的填充词。如果您想在转录中保留填充词，请使用包含它们的提示词："Umm, let me think like, hmm… Okay, here's what I'm, like, thinking."
5.  某些语言可以用不同的方式书写，例如简体中文或繁体中文。模型默认情况下可能不会始终使用您想要的书写风格。您可以通过使用您首选书写风格的提示词来改善这一点。

对于 `whisper-1`，模型会尝试匹配提示词的风格，因此如果提示词使用了大写和标点符号，它也更可能使用。然而，当前的提示系统比我们的其他语言模型更有限，对生成文本的控制有限。

您可以在[提高可靠性](#improving-reliability)部分找到更多改善 `whisper-1` 转录的示例。

## 

流式转录

根据您的用例以及您是尝试转录已完成的音频录制还是处理正在进行的音频流并使用 OpenAI 进行轮次检测，有两种方式可以流式传输转录。

### 流式转录已完成的音频录制

如果您有一个已完成的音频录制，无论是因为它是一个音频文件还是您正在使用自己的轮次检测（如按键说话），您可以使用我们的转录 API 配合 `stream=True` 来接收[转录事件]( https://developers.openai.com/api/reference/audio/transcript-text-delta-event)流，一旦模型完成该部分音频的转录就会立即发送。

**流式转录**

::: code-group
```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const stream = await openai.audio.transcriptions.create({
  file: fs.createReadStream("/path/to/file/speech.mp3"),
  model: "gpt-4o-mini-transcribe",
  response_format: "text",
  // highlight-start
  stream: true,
  // highlight-end
});

// highlight-start
for await (const event of stream) {
  console.log(event);
}
// highlight-end
```

```python
from openai import OpenAI

client = OpenAI()
audio_file = open("/path/to/file/speech.mp3", "rb")

stream = client.audio.transcriptions.create(
  model="gpt-4o-mini-transcribe", 
  file=audio_file, 
  response_format="text",
  # highlight-start
  stream=True
  # highlight-end
)

# highlight-start
for event in stream:
  print(event)
# highlight-end
```

```curl
curl --request POST \
  --url https://api.openai.com/v1/audio/transcriptions \
  --header "Authorization: Bearer $OPENAI_API_KEY" \
  --header 'Content-Type: multipart/form-data' \
  --form file=@example.wav \
  --form model=whisper-1 \
  # highlight-start
  --form stream=True
```

:::

一旦模型完成该部分音频的转录，您将收到 `transcript.text.delta` 事件流，随后在转录完成时收到包含完整转录的 `transcript.text.done` 事件。使用 `response_format="diarized_json"` 时，流还会在每个片段最终确定时发出带有说话人标签的 `transcript.text.segment` 事件。

此外，您可以使用 `include[]` 参数在响应中包含 `logprobs`，以获取转录中 token 的对数概率。这些可以帮助确定模型对转录特定部分的置信度。

`whisper-1` 不支持流式转录。

### 流式转录正在进行的音频录制

对于来自麦克风、通话或媒体流的实时音频，请使用[实时转录](/guides/realtime-transcription)指南，而不是上面面向文件的流式路径。它涵盖了当前的转录会话流程和推荐的实时路径 [`gpt-realtime-whisper`](/models/gpt-realtime-whisper)。

## 提高可靠性

使用 Whisper 时面临的最常见挑战之一是模型经常无法识别不常见的单词或缩写。以下是一些在这些情况下提高 Whisper 可靠性的不同技术：

使用 prompt 参数

第一种方法涉及使用可选的 prompt 参数传递正确拼写的词典。

由于 Whisper 没有使用指令遵循技术进行训练，它的运作方式更像基础 GPT 模型。请记住，Whisper 仅考虑提示词的前 224 个 token。

**Prompt 参数**

::: code-group
```javascript
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream("/path/to/file/speech.mp3"),
  model: "whisper-1",
  response_format: "text",
  prompt:"ZyntriQix, Digique Plus, CynapseFive, VortiQore V8, EchoNix Array, OrbitalLink Seven, DigiFractal Matrix, PULSE, RAPT, B.R.I.C.K., Q.U.A.R.T.Z., F.L.I.N.T.",
});

console.log(transcription.text);
```

```python
from openai import OpenAI

client = OpenAI()
audio_file = open("/path/to/file/speech.mp3", "rb")

transcription = client.audio.transcriptions.create(
  model="whisper-1", 
  file=audio_file, 
  response_format="text",
  prompt="ZyntriQix, Digique Plus, CynapseFive, VortiQore V8, EchoNix Array, OrbitalLink Seven, DigiFractal Matrix, PULSE, RAPT, B.R.I.C.K., Q.U.A.R.T.Z., F.L.I.N.T."
)

print(transcription.text)
```

```curl
curl --request POST \
  --url https://api.openai.com/v1/audio/transcriptions \
  --header "Authorization: Bearer $OPENAI_API_KEY" \
  --header 'Content-Type: multipart/form-data' \
  --form file=@/path/to/file/speech.mp3 \
  --form model=whisper-1 \
  --form prompt="ZyntriQix, Digique Plus, CynapseFive, VortiQore V8, EchoNix Array, OrbitalLink Seven, DigiFractal Matrix, PULSE, RAPT, B.R.I.C.K., Q.U.A.R.T.Z., F.L.I.N.T."
```

:::

虽然这提高了可靠性，但此技术限于 224 个 token，因此您的 SKU 列表需要相对较小才能使其成为可扩展的解决方案。

使用 GPT-4 进行后处理

第二种方法涉及使用 GPT-4 或 GPT-3.5-Turbo 的后处理步骤。

我们首先通过 `system_prompt` 变量为 GPT-4 提供指令。与我们之前使用 prompt 参数所做的类似，我们可以定义我们的公司和产品名称。

**后处理**

::: code-group
```javascript
const systemPrompt = `
You are a helpful assistant for the company ZyntriQix. Your task is 
to correct any spelling discrepancies in the transcribed text. Make 
sure that the names of the following products are spelled correctly: 
ZyntriQix, Digique Plus, CynapseFive, VortiQore V8, EchoNix Array, 
OrbitalLink Seven, DigiFractal Matrix, PULSE, RAPT, B.R.I.C.K., 
Q.U.A.R.T.Z., F.L.I.N.T. Only add necessary punctuation such as 
periods, commas, and capitalization, and use only the context provided.
`;

const transcript = await transcribe(audioFile);
const completion = await openai.chat.completions.create({
model: "gpt-4.1",
temperature: temperature,
messages: [
  {
    role: "system",
    content: systemPrompt
  },
  {
    role: "user",
    content: transcript
  }
],
store: true,
});

console.log(completion.choices[0].message.content);
```

```python
system_prompt = """
You are a helpful assistant for the company ZyntriQix. Your task is to correct 
any spelling discrepancies in the transcribed text. Make sure that the names of 
the following products are spelled correctly: ZyntriQix, Digique Plus, 
CynapseFive, VortiQore V8, EchoNix Array, OrbitalLink Seven, DigiFractal 
Matrix, PULSE, RAPT, B.R.I.C.K., Q.U.A.R.T.Z., F.L.I.N.T. Only add necessary 
punctuation such as periods, commas, and capitalization, and use only the 
context provided.
"""

def generate_corrected_transcript(temperature, system_prompt, audio_file):
  response = client.chat.completions.create(
      model="gpt-4.1",
      temperature=temperature,
      messages=[
          {
              "role": "system",
              "content": system_prompt
          },
          {
              "role": "user",
              "content": transcribe(audio_file, "")
          }
      ]
  )
  return completion.choices[0].message.content
corrected_text = generate_corrected_transcript(
  0, system_prompt, fake_company_filepath
)
```

:::

如果您在自己的音频文件上尝试此方法，您会看到 GPT-4 纠正了转录中的许多拼写错误。由于其更大的上下文窗口，此方法可能比使用 Whisper 的 prompt 参数更具可扩展性。它也更可靠，因为 GPT-4 可以以 Whisper 由于缺乏指令遵循能力而无法实现的方式进行指导和引导。
