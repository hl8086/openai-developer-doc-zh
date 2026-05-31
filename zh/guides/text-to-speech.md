
Audio API 提供了一个基于我们 [GPT-4o mini TTS（文本转语音）模型](/models/gpt-4o-mini-tts) 的 [`speech`]( https://developers.openai.com/api/reference/audio/createSpeech) 端点。它内置了 11 种语音，可用于：

*   朗读书面博客文章
*   生成多种语言的语音音频
*   使用流式传输提供实时音频输出

以下是 `alloy` 语音的示例：

我们的[使用政策](https://openai.com/policies/usage-policies)要求您向最终用户明确披露，他们听到的 TTS 语音是 AI 生成的，而非人类声音。

## 快速开始

`speech` 端点接受三个关键输入：

1.  您使用的[模型]( https://developers.openai.com/api/reference/audio/createSpeech#audio-createspeech-model)
2.  要转换为音频的[文本]( https://developers.openai.com/api/reference/audio/createSpeech#audio-createspeech-input)
3.  用于朗读输出的[语音]( https://developers.openai.com/api/reference/audio/createSpeech#audio-createspeech-voice)

以下是一个简单的请求示例：

**从输入文本生成语音音频**

::: code-group
```javascript
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI();
const speechFile = path.resolve("./speech.mp3");

const mp3 = await openai.audio.speech.create({
  model: "gpt-4o-mini-tts",
  voice: "coral",
  input: "Today is a wonderful day to build something people love!",
  instructions: "Speak in a cheerful and positive tone.",
});

const buffer = Buffer.from(await mp3.arrayBuffer());
await fs.promises.writeFile(speechFile, buffer);
```

```python
from pathlib import Path
from openai import OpenAI

client = OpenAI()
speech_file_path = Path(__file__).parent / "speech.mp3"

with client.audio.speech.with_streaming_response.create(
    model="gpt-4o-mini-tts",
    voice="coral",
    input="Today is a wonderful day to build something people love!",
    instructions="Speak in a cheerful and positive tone.",
) as response:
    response.stream_to_file(speech_file_path)
```

```curl
curl https://api.openai.com/v1/audio/speech \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini-tts",
    "input": "Today is a wonderful day to build something people love!",
    "voice": "coral",
    "instructions": "Speak in a cheerful and positive tone."
  }' \
  --output speech.mp3
```

```cli
openai audio:speech create \
  --model gpt-4o-mini-tts \
  --voice coral \
  --instructions "Speak in a cheerful and positive tone." \
  --input "Today is a wonderful day to build something people love!" \
  --output speech.mp3
```

:::

默认情况下，端点输出语音音频的 MP3 格式，但您可以将其配置为输出任何[支持的格式](#supported-output-formats)。

### 文本转语音模型

对于智能实时应用，请使用 `gpt-4o-mini-tts` 模型，这是我们最新且最可靠的文本转语音模型。您可以通过提示词控制语音的各个方面，包括：

*   口音
*   情感范围
*   语调
*   模仿
*   语速
*   音色
*   耳语

我们的其他文本转语音模型是 `tts-1` 和 `tts-1-hd`。`tts-1` 模型提供更低的延迟，但质量低于 `tts-1-hd` 模型。

### 语音选项

TTS 端点提供 13 种内置语音来控制文本转语音的呈现方式。**在 [OpenAI.fm](https://openai.fm) 中试听和体验这些语音，这是我们用于试用 OpenAI API 中最新文本转语音模型的交互式演示**。语音目前针对英语进行了优化。

*   `alloy`
*   `ash`
*   `ballad`
*   `coral`
*   `echo`
*   `fable`
*   `nova`
*   `onyx`
*   `sage`
*   `shimmer`
*   `verse`
*   `marin`
*   `cedar`

为获得最佳质量，我们推荐使用 `marin` 或 `cedar`。

语音可用性取决于模型。`tts-1` 和 `tts-1-hd` 模型支持较少的语音集：`alloy`、`ash`、`coral`、`echo`、`fable`、`onyx`、`nova`、`sage` 和 `shimmer`。

如果您使用的是 [Realtime API](/guides/realtime)，请注意可用语音集略有不同——请参阅[实时对话指南](/guides/realtime-conversations#voice-options)了解当前的实时语音。

### 流式实时音频

Speech API 支持使用[分块传输编码](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Transfer-Encoding)进行实时音频流式传输。这意味着音频可以在完整文件生成并可访问之前就开始播放。

**将输入文本的语音音频直接流式传输到扬声器**

::: code-group
```javascript
import OpenAI from "openai";
import { playAudio } from "openai/helpers/audio";

const openai = new OpenAI();

const response = await openai.audio.speech.create({
  model: "gpt-4o-mini-tts",
  voice: "coral",
  input: "Today is a wonderful day to build something people love!",
  instructions: "Speak in a cheerful and positive tone.",
  response_format: "wav",
});

await playAudio(response);
```

```python
import asyncio

from openai import AsyncOpenAI
from openai.helpers import LocalAudioPlayer

openai = AsyncOpenAI()

async def main() -> None:
    async with openai.audio.speech.with_streaming_response.create(
        model="gpt-4o-mini-tts",
        voice="coral",
        input="Today is a wonderful day to build something people love!",
        instructions="Speak in a cheerful and positive tone.",
        response_format="pcm",
    ) as response:
        await LocalAudioPlayer().play(response)

if __name__ == "__main__":
    asyncio.run(main())
```

```curl
curl https://api.openai.com/v1/audio/speech \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini-tts",
    "input": "Today is a wonderful day to build something people love!",
    "voice": "coral",
    "instructions": "Speak in a cheerful and positive tone.",
    "response_format": "wav"
  }' | ffplay -i -
```

:::




为获得最快的响应时间，我们推荐使用 `wav` 或 `pcm` 作为响应格式。

## 支持的输出格式

默认响应格式为 `mp3`，但也提供其他格式如 `opus` 和 `wav`。

*   **MP3**：适用于一般用例的默认响应格式。
*   **Opus**：适用于互联网流媒体和通信，低延迟。
*   **AAC**：适用于数字音频压缩，YouTube、Android、iOS 首选。
*   **FLAC**：适用于无损音频压缩，受音频发烧友青睐，用于存档。
*   **WAV**：未压缩的 WAV 音频，适用于低延迟应用以避免解码开销。
*   **PCM**：类似于 WAV，但包含 24kHz 的原始采样（16 位有符号，小端序），没有文件头。

## 支持的语言

TTS 模型在语言支持方面通常遵循 Whisper 模型。Whisper [支持以下语言](https://github.com/openai/whisper#available-models-and-languages)并表现良好，尽管语音针对英语进行了优化：

南非荷兰语、阿拉伯语、亚美尼亚语、阿塞拜疆语、白俄罗斯语、波斯尼亚语、保加利亚语、加泰罗尼亚语、中文、克罗地亚语、捷克语、丹麦语、荷兰语、英语、爱沙尼亚语、芬兰语、法语、加利西亚语、德语、希腊语、希伯来语、印地语、匈牙利语、冰岛语、印度尼西亚语、意大利语、日语、卡纳达语、哈萨克语、韩语、拉脱维亚语、立陶宛语、马其顿语、马来语、马拉地语、毛利语、尼泊尔语、挪威语、波斯语、波兰语、葡萄牙语、罗马尼亚语、俄语、塞尔维亚语、斯洛伐克语、斯洛文尼亚语、西班牙语、斯瓦希里语、瑞典语、他加禄语、泰米尔语、泰语、土耳其语、乌克兰语、乌尔都语、越南语和威尔士语。

您可以通过提供所选语言的输入文本来生成这些语言的语音音频。

## 自定义语音

自定义语音使您能够为代理或应用程序创建独特的语音。这些语音可用于 [Text to Speech API]( https://developers.openai.com/api/reference/audio/createSpeech)、[Realtime API]( https://developers.openai.com/api/reference/realtime) 或[带音频输出的 Chat Completions API](/guides/audio) 的音频输出。

要创建自定义语音，您需要提供一段简短的音频参考样本，模型将尝试复制该样本。

自定义语音仅限符合条件的客户使用。请联系我们的[销售团队](https://openai.com/contact-sales/)了解更多信息。一旦为您的组织启用，您将可以在 Audio 下访问 [Voices](https://platform.openai.com/audio/voices) 标签页。

#### 创建语音

目前，语音必须通过 API 请求创建。请参阅 API 参考了解完整的 API 操作集。

创建语音需要两段独立的音频录制：

1.  **同意录音** — 此录音捕获配音演员提供同意以创建其声音的相似物。演员必须朗读下方提供的同意短语之一。
2.  **样本录音** — 模型将尝试遵循的实际音频样本。声音必须与同意录音匹配。

**创建高质量语音的技巧**

自定义语音的质量高度依赖于您提供的样本质量。优化录音质量可以产生很大的差异。

*   在安静、回声最小的空间中录制。
*   使用专业的 XLR 麦克风。
*   保持距离麦克风约 7-8 英寸，中间放置防喷罩，并保持该距离一致。
*   模型会精确复制您提供的内容——音色、节奏、能量、停顿、习惯——因此请录制您想要的确切声音。在整个录制过程中保持能量、风格和口音的一致性。
*   音频样本中的微小变化可能导致生成语音的质量差异，值得尝试多个示例以找到最佳匹配。

**要求和限制**

*   每个组织最多可创建 20 个语音。
*   音频样本必须为 30 秒或更短。
*   音频样本必须是以下类型之一：`mpeg`、`wav`、`ogg`、`aac`、`flac`、`webm` 或 `mp4`。

有关其他使用条款，请参阅文本转语音补充协议。

**创建语音同意**

同意音频录制必须仅包含以下短语之一。任何偏离脚本的内容都将导致失败。

| 语言 | 短语 |
| --- | --- |
| `de` | Ich bin der Eigentümer dieser Stimme und bin damit einverstanden, dass OpenAI diese Stimme zur Erstellung eines synthetischen Stimmmodells verwendet. |
| `en` | I am the owner of this voice and I consent to OpenAI using this voice to create a synthetic voice model. |
| `es` | Soy el propietario de esta voz y doy mi consentimiento para que OpenAI la utilice para crear un modelo de voz sintética. |
| `fr` | Je suis le propriétaire de cette voix et j'autorise OpenAI à utiliser cette voix pour créer un modèle de voix synthétique. |
| `hi` | मैं इस आवाज का मालिक हूं और मैं सिंथेटिक आवाज मॉडल बनाने के लिए OpenAI को इस आवाज का उपयोग करने की सहमति देता हूं |
| `id` | Saya adalah pemilik suara ini dan saya memberikan persetujuan kepada OpenAI untuk menggunakan suara ini guna membuat model suara sintetis. |
| `it` | Sono il proprietario di questa voce e acconsento che OpenAI la utilizzi per creare un modello di voce sintetica. |
| `ja` | 私はこの音声の所有者であり、OpenAIがこの音声を使用して音声合成 モデルを作成することを承認します。 |
| `ko` | 나는 이 음성의 소유자이며 OpenAI가 이 음성을 사용하여 음성 합성 모델을 생성할 것을 허용합니다. |
| `nl` | Ik ben de eigenaar van deze stem en ik geef OpenAI toestemming om deze stem te gebruiken om een synthetisch stemmodel te maken. |
| `pl` | Jestem właścicielem tego głosu i wyrażam zgodę na wykorzystanie go przez OpenAI w celu utworzenia syntetycznego modelu głosu. |
| `pt` | Eu sou o proprietário desta voz e autorizo o OpenAI a usá-la para criar um modelo de voz sintética. |
| `ru` | Я являюсь владельцем этого голоса и даю согласие OpenAI на использование этого голоса для создания модели синтетического голоса. |
| `uk` | Я є власником цього голосу і даю згоду OpenAI використовувати цей голос для створення синтетичної голосової моделі. |
| `vi` | Tôi là chủ sở hữu giọng nói này và tôi đồng ý cho OpenAI sử dụng giọng nói này để tạo mô hình giọng nói tổng hợp. |
| `zh` | 我是此声音的拥有者并授权OpenAI使用此声音创建语音合成模型 |

然后通过 API 上传录音。成功上传将返回同意录音 ID，您稍后将引用该 ID。请注意，如果同一配音演员进行多次尝试，同意录音可以用于多次不同的语音创建。

```curl
curl https://api.openai.com/v1/audio/voice_consents \
  -X POST \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "name=test_consent" \
  -F "language=en" \
  -F "recording=@$HOME/tmp/voice_consent/consent_recording.wav;type=audio/x-wav"
```

**创建语音**

接下来，您将通过引用同意录音 ID 并提供语音样本来创建实际语音。

```curl
curl https://api.openai.com/v1/audio/voices \
  -X POST \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "name=test_voice" \
  -F "audio_sample=@$HOME/tmp/voice_consent/audio_sample_recording.wav;type=audio/x-wav" \
  -F "consent=cons_123abc"
```

如果成功，创建的语音将列在 [Audio 标签页](https://platform.openai.com/audio/voices)下。

#### 在语音生成中使用语音

语音生成将照常工作。只需在[创建语音]( https://developers.openai.com/api/reference/audio/createSpeech)时或在启动[实时会话]( https://developers.openai.com/api/reference/realtime/create-call#realtime_create_call-session-audio-output-voice)时，在 `voice` 参数中指定语音的 ID。

**文本转语音示例**

```curl
curl https://api.openai.com/v1/audio/speech \
  -X POST \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini-tts",
    "voice": {
      "id": "voice_123abc"
    },
    "input": "Maple est le meilleur golden retriever du monde entier.",
    "language": "fr",
    "format": "wav"
  }' \
  --output sample.wav
```

**Realtime API 示例**

```javascript
const sessionConfig = JSON.stringify({
  session: {
    type: "realtime",
    model: "gpt-realtime-2",
    audio: {
      output: {
        voice: { id: "voice_123abc" },
      },
    },
  },
});
```

## 相关指南

[实时和音频概述 - 为语音代理、翻译、转录和语音生成选择正确的路径。](/guides/realtime)

[音频和语音概念 - 了解音频模态、语音任务、流式传输和基于请求的 API。](/guides/audio)
