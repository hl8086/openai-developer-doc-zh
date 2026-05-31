<!-- Source: https://developers.openai.com/api/docs/guides/code-generation -->

Writing, reviewing, editing, and answering questions about code is one of the primary use cases for OpenAI models today. This guide walks through your options for code generation with GPT-5.4 and Codex.

## Get started

[Use Codex for out-of-the-box coding agentsConnect your codebase to Codex and accelerate your projects using software engineering agents.](#use-codex)

[Integrate with coding modelsUse OpenAI models in your application. Add them to a model picker, for instance.](#integrate-with-coding-models)

## Use Codex

[**Codex**](/codex/overview) is OpenAI’s coding agent for software development. It helps you write, review and debug code. Interact with Codex in a variety of interfaces: in your IDE, through the CLI, on web and mobile sites, or in your CI/CD pipelines with the SDK. Codex is the best way to get agentic software engineering on your projects.

Codex works best with the latest models from the GPT-5 family, such as [`gpt-5.5`](/api/docs/models/gpt-5.5). We offer a range of models specifically designed to work with coding agents like Codex, such as [`gpt-5.3-codex`](/api/docs/models/gpt-5.3-codex), but we recommend using the latest general-purpose model for most code generation tasks.

See the [Codex docs](https://developers.openai.com/codex) for setup guides, reference material, pricing, and more information.

## Integrate with coding models

For most API-based code generation, start with **`gpt-5.5`**. It handles both general-purpose work and coding, which makes it a strong default when your application needs to write code, reason about requirements, inspect docs, and handle broader workflows in one place.

This example shows how you can use the [Responses API](/api/docs/api-reference/responses) for a code generation use case:

**Default model for most coding tasks**

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const result = await openai.responses.create({
  model: "gpt-5.5",
  input: "Find the null pointer exception: ...your code here...",
  reasoning: { effort: "high" },
});

console.log(result.output_text);
```
```python
from openai import OpenAI
client = OpenAI()

result = client.responses.create(
    model="gpt-5.5",
    input="Find the null pointer exception: ...your code here...",
    reasoning={ "effort": "high" },
)

print(result.output_text)
```
```curl
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5.5",
    "input": "Find the null pointer exception: ...your code here...",
    "reasoning": { "effort": "high" }
  }'
```

## Frontend development

Our models from the GPT-5 family are especially strong at frontend development, especially when combined with a coding agent harness such as Codex.

The demo applications below were one shot generations, i.e. generated from a single prompt without hand-written code. Use them to evaluate frontend generation quality and prompt patterns for UI-heavy code generation workflows.

Explore

[![](https://cdn.openai.com/devhub/gpt5prompts/ocean-wave-simulation-5.2.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=ocean-wave-simulation-5.2)[![](https://cdn.openai.com/devhub/gpt5prompts/brutalist-dev-landing-page-5.2.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=brutalist-dev-landing-page-5.2)[![](https://cdn.openai.com/devhub/gpt5prompts/solar-system-explorer-5.2.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=solar-system-explorer-5.2)[![](https://cdn.openai.com/devhub/gpt5prompts/customer-journey-flow-5.2.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=customer-journey-flow-5.2)[![](https://cdn.openai.com/devhub/gpt5prompts/asteroid-game-5.2.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=asteroid-game-5.2)[![](https://cdn.openai.com/devhub/gpt5prompts/employee-skills-matrix-5.2.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=employee-skills-matrix-5.2)[![](https://cdn.openai.com/devhub/gpt5prompts/virtual-drum-kit-5.2.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=virtual-drum-kit-5.2)[![](https://cdn.openai.com/devhub/gpt5prompts/camping-gear-checklist-5.2.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=camping-gear-checklist-5.2)[![](https://cdn.openai.com/devhub/gpt5prompts/weather-theatre-5.2.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=weather-theatre-5.2)[![](https://cdn.openai.com/devhub/gpt5prompts/typing-rain-5.2.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=typing-rain-5.2)[![](https://cdn.openai.com/devhub/gpt5prompts/holiday-card-for-kids-5.2.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=holiday-card-for-kids-5.2)[![](https://cdn.openai.com/devhub/gpt5prompts/cloud-painter.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=cloud-painter)[![](https://cdn.openai.com/devhub/gpt5prompts/audio-step-sequencer.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=audio-step-sequencer)[![](https://cdn.openai.com/devhub/gpt5prompts/farewell-message-board.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=farewell-message-board)[![](https://cdn.openai.com/devhub/gpt5prompts/csv-to-charts.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=csv-to-charts)[![](https://cdn.openai.com/devhub/gpt5prompts/espresso.png)](/api/docs/guides/code-generation?gallery=open&galleryItem=espresso)[](/api/docs/guides/code-generation?gallery=open&galleryItem=openai-fm-inspired)[](/api/docs/guides/code-generation?gallery=open&galleryItem=case-study-landing-page)[](/api/docs/guides/code-generation?gallery=open&galleryItem=event-count-down)[](/api/docs/guides/code-generation?gallery=open&galleryItem=healthy-meal-tracker)[](/api/docs/guides/code-generation?gallery=open&galleryItem=music-theory-trainer)[](/api/docs/guides/code-generation?gallery=open&galleryItem=online-whiteboard)[](/api/docs/guides/code-generation?gallery=open&galleryItem=festival-lights-show)[](/api/docs/guides/code-generation?gallery=open&galleryItem=company-acronym-list)[](/api/docs/guides/code-generation?gallery=open&galleryItem=event-feedback)[](/api/docs/guides/code-generation?gallery=open&galleryItem=tiny-kanban)[](/api/docs/guides/code-generation?gallery=open&galleryItem=qr-code-generator)[](/api/docs/guides/code-generation?gallery=open&galleryItem=equation-solver-tool)[](/api/docs/guides/code-generation?gallery=open&galleryItem=micro-habit-tracker)[](/api/docs/guides/code-generation?gallery=open&galleryItem=markdown-to-slides)[](/api/docs/guides/code-generation?gallery=open&galleryItem=artisan-csa)[](/api/docs/guides/code-generation?gallery=open&galleryItem=pomodoro)[](/api/docs/guides/code-generation?gallery=open&galleryItem=online-course-landing-page)[](/api/docs/guides/code-generation?gallery=open&galleryItem=interactive-world-clock)[](/api/docs/guides/code-generation?gallery=open&galleryItem=online-poll-board)[](/api/docs/guides/code-generation?gallery=open&galleryItem=product-launch-page)[](/api/docs/guides/code-generation?gallery=open&galleryItem=falling-object-catcher)[](/api/docs/guides/code-generation?gallery=open&galleryItem=kinetic-typography-studio)[](/api/docs/guides/code-generation?gallery=open&galleryItem=esports-tournament-landing-page)[](/api/docs/guides/code-generation?gallery=open&galleryItem=math-practice-drills)[](/api/docs/guides/code-generation?gallery=open&galleryItem=language-learning-flashcards)[](/api/docs/guides/code-generation?gallery=open&galleryItem=webcam-filter-playground)[](/api/docs/guides/code-generation?gallery=open&galleryItem=nonprofit-impact-report)[](/api/docs/guides/code-generation?gallery=open&galleryItem=color-match-challenge)[](/api/docs/guides/code-generation?gallery=open&galleryItem=podcast-homepage)[](/api/docs/guides/code-generation?gallery=open&galleryItem=regex-lab)[](/api/docs/guides/code-generation?gallery=open&galleryItem=target-clicker)[](/api/docs/guides/code-generation?gallery=open&galleryItem=trivia-quiz-game)[](/api/docs/guides/code-generation?gallery=open&galleryItem=weather-theatre)

## Next steps

*   Visit the [Codex docs](https://developers.openai.com/codex) to learn what you can do with Codex, set up Codex in whichever interface you choose, or find more details.
*   Read [Using GPT-5.5](/api/docs/guides/latest-model) for model selection, features, and migration guidance.
*   See [Prompt guidance for GPT-5.5](/api/docs/guides/prompt-guidance) for prompting patterns that work well on coding and agentic tasks.
*   Compare [`gpt-5.5`](/api/docs/models/gpt-5.5) and [`gpt-5.3-codex`](/api/docs/models/gpt-5.3-codex) on the model pages.