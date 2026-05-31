<!-- Source: https://developers.openai.com/api/docs/models/gpt-5.4-mini -->

[Models](/api/docs/models)

![gpt-5.4-mini](/images/api/models/icons/gpt-5.4-mini.png)

GPT-5.4 mini

Default

Our strongest mini model yet for coding, computer use, and subagents

Our strongest mini model yet for coding, computer use, and subagents

CompareTry in Playground

Reasoning

Higher

Speed

Fast

Price

$0.75•$4.5

Input•Output

Input

Text, image

Output

Text

GPT-5.4 mini brings the strengths of GPT-5.4 to a faster, more efficient model designed for high-volume workloads. Learn more in our [latest model guide](/api/docs/guides/latest-model).

400,000 context window

128,000 max output tokens

Aug 31, 2025 knowledge cutoff

Reasoning token support

Pricing

Pricing is based on the number of tokens used, or other metrics based on the model type. For tool-specific models, like search and computer use, there’s a fee per tool call. See details in the [pricing page](/api/docs/pricing).

Text tokens

Per 1M tokens

∙

Batch API price

Input

$0.75

Cached input

$0.075

Output

$4.50

Quick comparison

Input

Cached input

Output

GPT-5.4

$2.50

GPT-5.4 mini

$0.75

GPT-5.4 nano

$0.20

Regional processing (data residency) endpoints are charged a 10% uplift for GPT-5.4 mini.

Modalities

Text

Input and output

Image

Input only

Audio

Not supported

Video

Not supported

Endpoints

Chat Completions

v1/chat/completions

Responses

v1/responses

Realtime

v1/realtime

Realtime translation

v1/realtime/translations

Realtime transcription

v1/realtime/transcription\_sessions

Assistants

v1/assistants

Batch

v1/batch

Fine-tuning

v1/fine-tuning

Embeddings

v1/embeddings

Image generation

v1/images/generations

Videos

v1/videos

Image edit

v1/images/edits

Speech generation

v1/audio/speech

Transcription

v1/audio/transcriptions

Translation

v1/audio/translations

Moderation

v1/moderations

Completions (legacy)

v1/completions

Features

Streaming

Supported

Function calling

Supported

Structured outputs

Supported

Fine-tuning

Not supported

Tools

Tools supported by this model when using the Responses API.

Web search

Supported

File search

Supported

Image generation

Supported

Code interpreter

Supported

Hosted shell

Supported

Apply patch

Supported

Skills

Supported

Computer use

Supported

MCP

Supported

Tool search

Supported

Snapshots

Snapshots let you lock in a specific version of the model so that performance and behavior remain consistent. Below is a list of all available snapshots and aliases for GPT-5.4 mini.

![gpt-5.4-mini](/images/api/models/icons/gpt-5.4-mini.png)

gpt-5.4-mini

gpt-5.4-mini-2026-03-17

gpt-5.4-mini-2026-03-17

Rate limits

Rate limits ensure fair and reliable access to the API by placing specific caps on requests, tokens, audio duration, or other usage within a given time period. Your usage tier determines how high these limits are set and automatically increases as you send more requests and spend more on the API.

| Tier | RPM | TPM | Batch queue limit |
| --- | --- | --- | --- |
| Free | Not supported |
| Tier 1 | 500 | 500,000 | 5,000,000 |
| Tier 2 | 5,000 | 2,000,000 | 20,000,000 |
| Tier 3 | 5,000 | 4,000,000 | 40,000,000 |
| Tier 4 | 10,000 | 10,000,000 | 1,000,000,000 |
| Tier 5 | 30,000 | 180,000,000 | 15,000,000,000 |