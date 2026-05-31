<!-- Source: https://developers.openai.com/api/docs/guides/video-generation -->

探索

[![](https://cdn.openai.com/API/docs/video-gallery/posters/Space-Race.jpg)](/api/docs/guides/video-generation?gallery=open&galleryItem=Space-Race)[![](https://cdn.openai.com/API/docs/video-gallery/posters/maui.jpg)](/api/docs/guides/video-generation?gallery=open&galleryItem=maui)[![](https://cdn.openai.com/API/docs/video-gallery/posters/Upside-Down-City.jpg)](/api/docs/guides/video-generation?gallery=open&galleryItem=Upside-Down-City)[![](https://cdn.openai.com/API/docs/video-gallery/posters/fox-walk.jpg)](/api/docs/guides/video-generation?gallery=open&galleryItem=fox-walk)[![](https://cdn.openai.com/API/docs/video-gallery/posters/zebra-chase.jpg)](/api/docs/guides/video-generation?gallery=open&galleryItem=zebra-chase)[![](https://cdn.openai.com/API/docs/video-gallery/posters/mushroom-network.jpg)](/api/docs/guides/video-generation?gallery=open&galleryItem=mushroom-network)[![](https://cdn.openai.com/API/docs/video-gallery/posters/90s-TV-Ad.jpg)](/api/docs/guides/video-generation?gallery=open&galleryItem=90s-TV-Ad)[![](https://cdn.openai.com/API/docs/video-gallery/posters/chameleon.jpg)](/api/docs/guides/video-generation?gallery=open&galleryItem=chameleon)[![](https://cdn.openai.com/API/docs/video-gallery/posters/cozy-coffee-shop-interior.jpg)](/api/docs/guides/video-generation?gallery=open&galleryItem=Cozy-Coffee-Shop-Interior)[![](https://cdn.openai.com/API/docs/video-gallery/posters/coloring.jpg)](/api/docs/guides/video-generation?gallery=open&galleryItem=coloring)[![](https://cdn.openai.com/API/docs/video-gallery/posters/Sleeping-Otters.jpg)](/api/docs/guides/video-generation?gallery=open&galleryItem=Sleeping-Otters)[![](https://cdn.openai.com/API/docs/video-gallery/posters/indie-cafe-rainy-window.jpg)](/api/docs/guides/video-generation?gallery=open&galleryItem=indie-cafe-rainy-window)

Sora 2 视频生成模型和 Videos API 已弃用，将于 2026 年 9 月 24 日关闭。受影响的包括 Videos API、`sora-2`、`sora-2-pro`、`sora-2-2025-10-06`、`sora-2-2025-12-08` 和 `sora-2-pro-2025-10-06`。详情请参阅[弃用页面](/api/docs/deprecations)。

## 概述

Sora 是 OpenAI 在生成式媒体领域的最新前沿成果——一个最先进的视频模型，能够根据自然语言或图像创建细节丰富、动态生动且带有音频的视频片段。基于多年的多模态扩散研究，并在多样化的视觉数据上训练，Sora 为文本到视频生成带来了对 3D 空间、运动和场景连续性的深刻理解。

[Videos API](/api/reference/resources/videos) 首次向开发者开放了这些能力，支持以编程方式创建、延展、编辑和管理视频。

你可以用它来：

*   根据提示词创建新视频。
*   使用图像参考来引导生成。
*   在多次生成中复用角色资产，以获得更强的视觉一致性。
*   通过视频延展来继续已完成的片段。
*   对现有视频进行有针对性的编辑修改。
*   下载已完成的视频和辅助资产。
*   通过 [Batch API](/api/docs/guides/batch) 提交大规模离线渲染队列。

## 模型

第二代 Sora 模型有两个变体，分别针对不同的使用场景。

### Sora 2

`sora-2` 专为**速度和灵活性**设计。它非常适合探索阶段，当你在尝试不同的基调、结构或视觉风格，需要快速反馈而非完美保真度时。

它能快速生成高质量的结果，非常适合快速迭代、概念验证和粗剪。`sora-2` 对于社交媒体内容、原型和周转时间比超高保真度更重要的场景通常绰绰有余。

### Sora 2 Pro

`sora-2-pro` 生成更高质量的结果。当你需要**制作级质量的输出**时，它是更好的选择。

`sora-2-pro` 渲染时间更长且运行成本更高，但它能产出更精致、更稳定的结果。它最适合高分辨率电影级画面、营销素材以及任何对视觉精度要求严格的场景。

当你需要 `1920x1080` 或 `1080x1920` 的 1080p 导出时，请使用 `sora-2-pro`。

`sora-2` 和 `sora-2-pro` 都支持 `16` 秒和 `20` 秒的生成。

## 生成视频

生成视频是一个**异步**过程：

1.  当你调用 `POST /videos` 端点时，API 会返回一个包含任务 `id` 和初始 `status` 的任务对象。
    
2.  你可以轮询 `GET /videos/{video_id}` 端点直到状态变为 completed，或者——更高效的方式——使用 webhooks（参见下方的 webhooks 部分）在任务完成时自动收到通知。
    
3.  一旦任务达到 `completed` 状态，你可以通过 `GET /videos/{video_id}/content` 获取最终的 MP4 文件。
    

### 启动渲染任务

首先调用 `POST /videos`，传入文本提示词和所需参数。提示词定义了创意外观和感觉——主体、镜头、光线和运动——而 `size` 和 `seconds` 等参数控制视频的分辨率和时长。

**创建视频**

```javascript
import OpenAI from 'openai';

const openai = new OpenAI();

let video = await openai.videos.create({
    model: 'sora-2',
    prompt: "A video of the words 'Thank you' in sparkling letters",
});

console.log('Video generation started: ', video);
```
```python
from openai import OpenAI

openai = OpenAI()

video = openai.videos.create(
    model="sora-2",
    prompt="A video of a cool cat on a motorcycle in the night",
)

print("Video generation started:", video)
```
```curl
curl -X POST "https://api.openai.com/v1/videos" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F prompt="Wide tracking shot of a teal coupe driving through a desert highway, heat ripples visible, hard sun overhead." \
  -F model="sora-2-pro" \
  -F size="1280x720" \
  -F seconds="8" \
```

响应是一个包含唯一 id 和初始状态（如 `queued` 或 `in_progress`）的 JSON 对象。这意味着渲染任务已经开始。

```
{
  "id": "video_68d7512d07848190b3e45da0ecbebcde004da08e1e0678d5",
  "object": "video",
  "created_at": 1758941485,
  "status": "queued",
  "model": "sora-2-pro",
  "progress": 0,
  "seconds": "8",
  "size": "1280x720"
}
```

### 选择尺寸和时长

选择满足你制作需求的最小格式：

*   在迭代提示词、运动或构图时使用较短的片段。
*   当你需要更长的节拍、更完整的场景或更完整的片段时，生成最长 `20` 秒的视频。
*   使用 `sora-2-pro` 获取 `1920x1080` 或 `1080x1920` 的更高分辨率导出。

较长的时长和 1080p 任务的完成时间可能比短的 720p 或 480p 渲染明显更长，因此在面向用户的流程中请预留更高的延迟。

### 安全限制和约束

API 强制执行以下内容限制：

*   仅允许适合 18 岁以下受众的内容（未来将提供绕过此限制的设置）。
*   受版权保护的角色和受版权保护的音乐将被拒绝。
*   不能生成真实人物——包括公众人物。
*   描绘人类外貌的角色上传默认被阻止。
*   包含人脸的输入图像目前会被拒绝。

确保提示词、参考图像和文字稿遵守这些规则，以避免生成失败。

### 有效的提示词编写

为获得最佳效果，请描述**镜头类型、主体、动作、场景和光线**。例如：

*   _"一个孩子在草地公园放红色风筝的广角镜头，黄金时段的阳光，镜头缓慢向上平移。"_
*   _"木桌上一杯冒着热气的咖啡的特写，百叶窗透过的晨光，柔和的景深。"_

这种程度的具体描述有助于模型产生一致的结果，而不会生成不需要的细节。更多高级提示词技巧，请参阅我们专门的 Sora 2 [提示词指南](/cookbook/examples/sora/sora2_prompting_guide)。

### 监控进度

视频生成需要时间。根据模型、API 负载和分辨率，**单次渲染可能需要几分钟**。

为了高效管理，你可以轮询 API 请求状态更新，或者通过 webhook 获取通知。

#### 轮询状态端点

使用创建调用返回的 id 调用 `GET /videos/{video_id}`。响应显示任务的当前状态、进度百分比（如果可用）和任何错误。

典型状态包括 `queued`、`in_progress`、`completed` 和 `failed`。以合理的间隔轮询（例如每 10-20 秒），必要时使用指数退避，并向用户提供任务仍在进行中的反馈。

**轮询状态端点**

```javascript
import OpenAI from 'openai';

const openai = new OpenAI();

async function main() {
  const video = await openai.videos.createAndPoll({
    model: 'sora-2',
    prompt: "A video of the words 'Thank you' in sparkling letters",
  });

  if (video.status === 'completed') {
    console.log('Video successfully completed: ', video);
  } else {
    console.log('Video creation failed. Status: ', video.status);
  }
}

main();
```
```python
import asyncio

from openai import AsyncOpenAI

client = AsyncOpenAI()


async def main() -> None:
    video = await client.videos.create_and_poll(
        model="sora-2",
        prompt="A video of a cat on a motorcycle",
    )

    if video.status == "completed":
        print("Video successfully completed: ", video)
    else:
        print("Video creation failed. Status: ", video.status)


asyncio.run(main())
```

响应示例：

```
{
  "id": "video_68d7512d07848190b3e45da0ecbebcde004da08e1e0678d5",
  "object": "video",
  "created_at": 1758941485,
  "status": "in_progress",
  "model": "sora-2-pro",
  "progress": 33,
  "seconds": "8",
  "size": "1280x720"
}
```

#### 使用 webhooks 接收通知

与其反复使用 `GET` 轮询任务状态，不如注册一个 [webhook](/api/docs/guides/webhooks) 以在视频生成完成或失败时自动收到通知。

Webhooks 可以在你的 [webhook 设置页面](https://platform.openai.com/settings/project/webhooks)中配置。当任务完成时，API 会发出以下两种事件类型之一：`video.completed` 和 `video.failed`。每个事件都包含触发它的任务 ID。

Webhook 负载示例：

```
{
  "id": "evt_abc123",
  "object": "event",
  "created_at": 1758941485,
  "type": "video.completed", // or "video.failed"
  "data": {
    "id": "video_abc123"
  }
}
```

### 获取结果

#### 下载 MP4

一旦任务状态变为 `completed`，使用 `GET /videos/{video_id}/content` 获取 MP4 文件。此端点流式传输二进制视频数据并返回标准内容头，因此你可以直接将文件保存到磁盘或将其传输到云存储。

**下载 MP4**

```javascript
import OpenAI from 'openai';

const openai = new OpenAI();

let video = await openai.videos.create({
    model: 'sora-2',
    prompt: "A video of the words 'Thank you' in sparkling letters",
});

console.log('Video generation started: ', video);
let progress = video.progress ?? 0;

while (video.status === 'in_progress' || video.status === 'queued') {
    video = await openai.videos.retrieve(video.id);
    progress = video.progress ?? 0;

    // Display progress bar
    const barLength = 30;
    const filledLength = Math.floor((progress / 100) * barLength);
    // Simple ASCII progress visualization for terminal output
    const bar = '='.repeat(filledLength) + '-'.repeat(barLength - filledLength);
    const statusText = video.status === 'queued' ? 'Queued' : 'Processing';

    process.stdout.write(`${statusText}: [${bar}] ${progress.toFixed(1)}%`);

    await new Promise((resolve) => setTimeout(resolve, 2000));
}

// Clear the progress line and show completion
process.stdout.write('\n');

if (video.status === 'failed') {
    console.error('Video generation failed');
    return;
}

console.log('Video generation completed: ', video);

console.log('Downloading video content...');

const content = await openai.videos.downloadContent(video.id);

const body = content.arrayBuffer();
const buffer = Buffer.from(await body);

require('fs').writeFileSync('video.mp4', buffer);

console.log('Wrote video.mp4');
```
```curl
curl -L "https://api.openai.com/v1/videos/video_abc123/content" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  --output video.mp4
```
```python
from openai import OpenAI
import sys
import time


openai = OpenAI()

video = openai.videos.create(
    model="sora-2",
    prompt="A video of a cool cat on a motorcycle in the night",
)

print("Video generation started:", video)

progress = getattr(video, "progress", 0)
bar_length = 30

while video.status in ("in_progress", "queued"):
    # Refresh status
    video = openai.videos.retrieve(video.id)
    progress = getattr(video, "progress", 0)

    filled_length = int((progress / 100) * bar_length)
    bar = "=" * filled_length + "-" * (bar_length - filled_length)
    status_text = "Queued" if video.status == "queued" else "Processing"

    sys.stdout.write(f"
{status_text}: [{bar}] {progress:.1f}%")
    sys.stdout.flush()
    time.sleep(2)

# Move to next line after progress loop
sys.stdout.write("
")

if video.status == "failed":
    message = getattr(
        getattr(video, "error", None), "message", "Video generation failed"
    )
    print(message)
    return

print("Video generation completed:", video)
print("Downloading video content...")

content = openai.videos.download_content(video.id, variant="video")
content.write_to_file("video.mp4")

print("Wrote video.mp4")
```

现在你已经获得了可用于播放、编辑或分发的最终视频文件。下载 URL 在生成后最多有效 1 小时。如果你需要长期存储，请及时将文件复制到你自己的存储系统。

#### 下载辅助资产

对于每个已完成的视频，你还可以下载**缩略图**和**精灵图**。这些是轻量级资产，适用于预览、进度条或目录展示。使用 `variant` 查询参数指定你要下载的内容。默认值为 `variant=video`，即 MP4 文件。

```
# 下载缩略图
curl -L "https://api.openai.com/v1/videos/video_abc123/content?variant=thumbnail" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  --output thumbnail.webp

# 下载精灵图
curl -L "https://api.openai.com/v1/videos/video_abc123/content?variant=spritesheet" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  --output spritesheet.jpg
```

## 使用图像参考

你可以使用输入图像来引导生成，该图像将作为**视频的第一帧**。当你需要输出视频保留品牌资产、角色或特定环境的外观时，这非常有用。

根据请求类型选择 `input_reference` 格式：

*   在 `multipart/form-data` 请求中使用 `input_reference` 上传图像。
*   在 `application/json` 请求（包括 Batch）中使用 `input_reference` 传入 JSON 对象。JSON 格式接受 `file_id` 或 `image_url`。

图像必须与目标视频的分辨率（`size`）匹配。

支持的文件格式为 `image/jpeg`、`image/png` 和 `image/webp`。

```
curl -X POST "https://api.openai.com/v1/videos" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F prompt="She turns around and smiles, then slowly walks out of the frame." \
  -F model="sora-2-pro" \
  -F size="1280x720" \
  -F seconds="8" \
  -F input_reference="@sample_720p.jpeg;type=image/jpeg"
```

| 使用 [OpenAI GPT Image](/api/docs/guides/image-generation) 生成的输入图像 | 使用 Sora 2 生成的视频（转换为 GIF） |
| --- | --- |
| ![](https://cdn.openai.com/API/docs/images/sora/sora_woman_skyline_original_2.jpeg)[下载此图像](https://cdn.openai.com/API/docs/images/sora/woman_skyline_original_720p.jpeg) | ![](https://cdn.openai.com/API/docs/images/sora/sora_woman_skyline_video.gif) 提示词：_"She turns around and smiles, then slowly walks out of the frame."_ |
| ![](https://cdn.openai.com/API/docs/images/sora/sora_monster_original_2.jpeg)[下载此图像](https://cdn.openai.com/API/docs/images/sora/monster_original_720p.jpeg) | ![](https://cdn.openai.com/API/docs/images/sora/sora_monster_original.gif) 提示词：_"The fridge door opens. A cute, chubby purple monster comes out of it."_ |

## 使用角色保持一致性

角色功能允许你上传可复用的非人类主体，并在多次生成中引用它。当你希望动物、吉祥物或物体在多个镜头中保持相同的核心外观、风格和画面表现时，这非常有用。

角色上传目前在 `16:9` 或 `9:16`、`720p` 到 `1080p` 的短 `2` 到 `4` 秒片段中效果最佳。角色源视频在与请求输出的宽高比匹配时效果最好。如果宽高比不同，角色可能会出现拉伸或变形。单个视频最多可以包含两个角色。

角色与 `input_reference` 不同。图像参考条件化单次生成的开场帧，而角色资产可以在未来的视频请求中复用。

通过将短 MP4 片段上传到 `POST /v1/videos/characters` 来创建角色，然后在创建视频时将返回的角色 ID 包含在 `characters` 数组中。

描绘人类外貌的角色上传默认被阻止。请联系你的客户经理或[联系我们的销售团队](https://openai.com/contact-sales/)了解更多关于人类外貌访问资格的信息。

```
curl -X POST "https://api.openai.com/v1/videos/characters" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F "video=@character.mp4;type=video/mp4" \
  -F "name=Mossy"
```

在提示词中逐字提及角色名称。仅传递角色 ID 不足以可靠地在画面中保留角色。

角色可以与 `input_reference` 组合使用。延展不支持角色。

```
curl -X POST "https://api.openai.com/v1/videos" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "sora-2",
    "prompt": "A cinematic tracking shot of Mossy, a moss-covered teapot mascot, weaving through a lantern-lit market at dusk.",
    "size": "1280x720",
    "seconds": "8",
    "characters": [
      { "id": "char_123" }
    ]
  }'
```

## 延展已完成的视频

视频延展允许你继续一个已完成的视频并创建一个新的拼接结果。在 `POST /v1/videos/extensions` 的 `video` 字段中提供源视频，添加描述场景如何继续的提示词，API 将使用完整的源片段作为上下文生成下一个片段。

当你想保持运动、镜头方向和场景连续性时，请使用延展。如果你只需要控制新生成的开场帧，请改用 `input_reference`。

每次延展最多可添加 `20` 秒。单个视频最多可延展六次，最大总长度为 `120` 秒。延展目前仅接受源视频和提示词。它们不支持角色或图像参考。

```
curl -X POST "https://api.openai.com/v1/videos/extensions" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "video": {
      "id": "video_abc123"
    },
    "prompt": "Continue the scene as the camera rises over the rooftops and reveals the sunrise.",
    "seconds": "8"
  }'
```

## 编辑现有视频

编辑允许你对现有视频进行有针对性的调整，而无需从头重新生成所有内容。使用提示词和 `video` 引用发送 `POST /v1/videos/edits`，系统会复用原始的结构、连续性和构图，同时应用修改。当你进行单一、明确定义的更改时效果最好，因为较小、聚焦的编辑能保留更多原始保真度并降低引入伪影的风险。

视频生成之前可以使用 remix 端点进行编辑，该端点正在被弃用。请使用 edits 端点进行新的集成。

`video` 字段接受视频 ID 或上传的视频。如果你传递视频 ID，API 会从源视频推断模型。

编辑上传的视频仅对符合条件的客户可用。如果你需要此工作流程，请联系你的客户经理或[联系我们的销售团队](https://openai.com/contact-sales/)。

```
curl -X POST "https://api.openai.com/v1/videos/edits" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "video": {
      "id": "video_abc123"
    },
    "prompt": "Shift the color palette to teal, sand, and rust, with a warm backlight."
  }'
```

如果你上传新视频而不是编辑现有生成的视频，请在请求中显式设置 `model`。

```
curl -X POST "https://api.openai.com/v1/videos/edits" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F "video=@source.mp4;type=video/mp4" \
  -F "model=sora-2-pro" \
  -F "prompt=Shift the color palette to teal, sand, and rust, with a warm backlight."
```

编辑对于迭代特别有价值，因为它让你在不丢弃已有成果的情况下进行优化。通过将每次编辑限制为一个明确的调整，你可以保持视觉风格、主体一致性和镜头构图的稳定，同时仍然探索情绪、色调或场景布置的变化。这使得通过小而可靠的步骤构建精致的序列变得更加容易。

| 原始视频 | 编辑后生成的视频 |
| --- | --- |
| ![](https://cdn.openai.com/API/docs/images/sora/sora_monster_original.gif) | ![](https://cdn.openai.com/API/docs/images/sora/sora_monster_orange.gif) 提示词：_"Change the color of the monster to orange."_ |
| ![](https://cdn.openai.com/API/docs/images/sora/sora_monster_original.gif) | ![](https://cdn.openai.com/API/docs/images/sora/sora_monster_2monsters.gif) 提示词：_"A second monster comes out right after."_ |

## 通过 Batch API 运行视频任务

当你需要为离线处理、审核流程或工作室工作流排队大量视频渲染时，请使用 [Batch API](/api/docs/guides/batch)。批处理输入文件中的每一行使用与你发送到 `POST /v1/videos` 相同的 JSON 请求体，这使其非常适合镜头列表和计划渲染队列。

Batch 中的视频生成：

*   Batch 目前仅支持 `POST /v1/videos`。
*   Batch 请求必须使用 JSON，不能使用 multipart。
*   提前上传资产并从 JSON 请求体中引用它们。
*   在 Batch 中使用 `input_reference` 进行图像引导生成。在 JSON 请求中，将 `input_reference` 作为包含 `file_id` 或 `image_url` 的对象传递。
*   Batch 不支持 multipart `input_reference` 上传，包括视频参考输入。
*   Batch 生成的视频在批处理完成后最多可下载 `24` 小时。

```
{"custom_id":"shot-001","method":"POST","url":"/v1/videos","body":{"model":"sora-2-pro","prompt":"Slow dolly shot through a miniature paper city at blue hour, soft fog, practical window lights flickering on.","size":"1920x1080","seconds":"20"}}
{"custom_id":"shot-002","method":"POST","url":"/v1/videos","body":{"model":"sora-2-pro","prompt":"Portrait close-up of a red panda chef plating noodles in a stainless-steel kitchen, shallow depth of field.","size":"1080x1920","seconds":"16"}}
```

当批处理达到 `completed` 状态时，其输出中的视频任务已经达到终态，如 `completed`、`failed` 或 `expired`。使用稳定的 `custom_id` 值，以便你可以将批处理结果映射回你的内部镜头 ID、编辑队列或资产管道，然后使用返回的视频 ID 下载最终资产。

## 管理你的视频库

使用 `GET /videos` 列举你的视频。该端点支持可选的分页和排序查询参数。

```
curl "https://api.openai.com/v1/videos?limit=20&after=video_123&order=asc" \
  -H "Authorization: Bearer $OPENAI_API_KEY" | jq .
```

使用 `DELETE /videos/{video_id}` 从 OpenAI 的存储中删除你不再需要的视频。

```
curl -X DELETE "https://api.openai.com/v1/videos/REPLACE_WITH_YOUR_VIDEO_ID" \
  -H "Authorization: Bearer $OPENAI_API_KEY" | jq .
```
