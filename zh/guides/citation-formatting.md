
可靠的引用能够建立信任，并帮助读者验证回复的准确性。本指南提供了关于如何准备可引用材料以及指导模型有效格式化引用的实用指导，使用的是 OpenAI 模型熟悉的模式。

## 概述

引用系统包含许多部分：你需要决定哪些内容可以被引用，清晰地呈现这些材料，指导模型如何引用，并在向用户展示之前验证结果。

本指南涵盖模型直接接触的五个核心要素：

1.  可引用单元：定义模型可以引用的内容。
2.  材料表示：以清晰、结构化的格式呈现源材料。
3.  引用格式：指定模型应使用的确切引用格式。
4.  提示指令：告诉模型何时引用以及如何正确引用。
5.  引用解析：从模型的回复中提取引用以供下游使用。

## 选择可引用单元

在编写提示之前，明确定义模型可以引用的内容。常见选项包括：

| 可引用单元 | 最适用场景 | 缺点 | 示例 |
| --- | --- | --- | --- |
| 文档 | 你只需要显示答案来自哪个文档。 | 不够精确。 | 当你只需要显示哪个文档支持该声明时，引用整个员工手册。 |
| 块/片段 | 你需要在简洁性和精确性之间取得良好平衡。 | 仍然无法精确到行。 | 引用包含该条款的特定合同段落或检索片段。 |
| 行范围 | 你需要显示确切的支持文本。 | 对模型来说更困难。 | 当用户需要验证精确段落时，引用 `L42-L47` 行。 |

一个好的可引用单元应该：

*   一致性：同一来源在不同运行中应保持相同的 ID。
*   易于检查：人们应该能够阅读它并理解周围的上下文。
*   大小适当：大到足以有意义，但小到足以保持精确。

对于大多数系统，块级引用是最佳默认选择。它们通常比行级引用对模型更容易，比文档级引用对用户更有用。

## 表示可引用材料

模型无法引用未被清晰呈现的材料。无论材料来自工具还是直接注入，确保它具有：

*   稳定的源 ID：一致的标识符，如 `file1` 或 `block1`。
*   可读文本：格式清晰的源材料。
*   元数据（可选）：URL、时间戳、标题和类似的上下文信息。

可引用材料示例

```
Citation Marker: {CITATION_START}cite{CITATION_DELIMITER}file0{CITATION_STOP}
Title: Employee Handbook
URL: https://company.example/handbook
Updated: 2026-03-01

[L1] Employees may work remotely up to three days per week.
[L2] Additional remote days require manager approval.
[L3] Exceptions may apply for approved accommodations.
```

**源 ID 与定位符：** 源 ID 是一个稳定的、模型生成的标识符，如 `block1`。定位符是精确的 UI 渲染高亮，如 `lines L8-L13` 或 `Paragraph 21`。通常，模型应该输出源 ID，而你的系统负责解析或渲染定位符。过早混合两者往往会增加格式错误。

## 定义引用格式

你需要定义模型将生成的引用格式。使用一种明确、一致且模型能够可靠复现的格式。

以下是我们推荐的引用格式和标记。这些引用标记是强烈推荐的，因为它们与我们模型训练时使用的标记非常接近。如果你选择不同的标记值，请尽可能保持整体引用格式相似。

| 组成部分 | 作用 | 推荐值 |
| --- | --- | --- |
| `CITATION_START` | 打开引用标记。 | `\ue200` |
| 引用族 | 标识引用类型。对所有支持的来源使用 `cite`。 | `cite` |
| `CITATION_DELIMITER` | 分隔标记内的字段。 | `\ue202` |
| 源 ID | 标识被引用的单元。`turn#` 是轮次编号。`item#` 是特定的文件、块或 URL。 | `turn0file1`、`turn0block1`、`turn0url1` |
| 定位符（可选） | 将引用缩小到精确范围。 | `L8-L13` |
| `CITATION_STOP` | 关闭引用标记。 | `\ue201` |

对于工具调用，`turnN` 每次工具调用递增一次，而不是每个单独结果递增一次。在单次调用中，来源通过后缀如 `file0`、`file1` 等来区分。在单次响应系统中，如果模型在回答之前只进行了一次工具调用，所有引用将只是 `turn0…`。如果它进行了多次工具调用，你可能会看到 `turn0fileX`、`turn1fileX` 等引用。

### 模板

```text
{CITATION_START}&lt;citation_family>{CITATION_DELIMITER}&lt;source_id>{CITATION_DELIMITER}&lt;locator>{CITATION_STOP}
```

### 示例

```
{CITATION_START}cite{CITATION_DELIMITER}turn0file1{CITATION_DELIMITER}L8-L13{CITATION_STOP}
```

如果你的系统不使用定位符，省略该字段：

```
{CITATION_START}cite{CITATION_DELIMITER}turn0file1{CITATION_STOP}
```

## 编写有效的引用指令

为了保持最高准确性，使用熟悉的引用模式。自定义或不熟悉的格式会增加模型的认知负担，导致引用错误，尤其是在：

*   低推理力度时，模型没有足够的预算来从格式错误中恢复。
*   高复杂度任务中，大部分推理预算用于解决任务本身而非清理引用语法。

下面，我们推荐一种接近模型熟悉模式的引用格式。你可以直接使用或根据自己的系统进行调整。

如果你想定义自己的提示，需要定义：

*   确切的标记语法。
*   引用放置的位置。
*   何时引用，何时不引用。
*   如何引用多个支持来源。
*   禁止使用的格式。
*   当缺少支持时该怎么做。

推荐的提示指令

使用以下格式清晰地指导模型：

```
## Citations

Results are returned by "tool_1". Each message from `tool_1` is called a "source" and identified by its reference ID, which is the first occurrence of 【turn\d+\w+\d+】 (e.g. 【turn2file1】). In this example, the string "turn2file1" would be the source reference ID.

Citations are references to `tool_1` sources. Citations may be used to refer to either a single source or multiple sources.

Citations to a single source must be written as {CITATION_START}cite{CITATION_DELIMITER}turn\d+\w+\d+{CITATION_STOP} (e.g. {CITATION_START}cite{CITATION_DELIMITER}turn2file5{CITATION_STOP}).

Citations to multiple sources must be written as {CITATION_START}cite{CITATION_DELIMITER}turn\d+\w+\d+{CITATION_DELIMITER}turn\d+\w+\d+{CITATION_DELIMITER}...{CITATION_STOP} (e.g. {CITATION_START}cite{CITATION_DELIMITER}turn2file5{CITATION_DELIMITER}turn2file1{CITATION_DELIMITER}...{CITATION_STOP}).

Citations must not be placed inside markdown bold, italics, or code fences, as they will not display correctly. Instead, place the citations outside the markdown block. Citations outside code fences may not be placed on the same line as the end of the code fence.

You must NOT write reference ID turn\d+\w+\d+ verbatim in the response text without putting them between {CITATION_START}...{CITATION_STOP}.

- Place citations at the end of the paragraph, or inline if the paragraph is long, unless the user requests specific citation placement.
- Citations must be placed after punctuation.
- Citations must not be all grouped together at the end of the response.
- Citations must not be put in a line or paragraph with nothing else but the citations themselves.
```

如果你希望模型也输出定位符，如行号（`L1-L22`），在提示中这样指定：

```
You *must* cite any results you use from this tool using the:
`\ue200cite\ue202turn0file0\ue202L8-L13\ue201` format ONLY if the item has a corresponding citation marker.
```

*   不要尝试引用没有对应引用标记的项目，因为它们不应被引用。
*   你必须在引用中包含行范围。

更高质量溯源的可选指令

以下规则在你需要更高质量的溯源行为时通常值得包含。根据你的用例需求调整此部分。

```text
&lt;extra_considerations_for_citations>
- **Relevance:** Include only search results and citations that support the cited response text. Irrelevant sources permanently degrade user trust.
- **Diversity:** You must base your answer on sources from diverse domains, and cite accordingly.
- **Trustworthiness:** To produce a credible response, you must rely on high quality domains, and ignore information from less reputable domains unless they are the only source.
- **Accurate Representation:** Each citation must accurately reflect the source content. Selective interpretation of the source content is not allowed.

Remember, the quality of a domain/source depends on the context.
- When multiple viewpoints exist, cite sources covering the spectrum of opinions to ensure balance and comprehensiveness.
- When reliable sources disagree, cite at least one high-quality source for each major viewpoint.
- Ensure more than half of citations come from widely recognized authoritative outlets on the topic.
- For debated topics, cite at least one reliable source representing each major viewpoint.
- Do not ignore the content of a relevant source because it is low quality.
&lt;/extra_considerations_for_citations>
```

## 解析引用

一旦模型输出引用，你需要从响应文本中提取它们，以便解析源 ID、渲染链接，或在向用户展示答案之前移除原始标记。

下面的辅助函数设计为可直接复制到你的应用程序中。它解析单源引用、多源引用和可选的行范围定位符，同时保留原始文本中的字符偏移量。

此示例仅支持行定位符，如果你的系统使用不同的定位符格式，应进行相应调整。

后处理器示例

**引用解析辅助函数**

```python
import re
from typing import Iterable, TypedDict

CITATION_START = "\ue200"
CITATION_DELIMITER = "\ue202"
CITATION_STOP = "\ue201"

SOURCE_ID_RE = re.compile(r"^[A-Za-z0-9_-]+$")
LINE_LOCATOR_RE = re.compile(r"^L\\d+(?:-L\\d+)?$")


class Citation(TypedDict):
    raw: str
    family: str
    source_ids: list[str]
    locator: str | None
    start: int
    end: int


def extract_citations(
    text: str,
    *,
    families: tuple[str, ...] = ("cite",),
) -> list[Citation]:
    """
    Extract citations such as:

      {CITATION_START}cite{CITATION_DELIMITER}turn0file0{CITATION_STOP}
      {CITATION_START}cite{CITATION_DELIMITER}turn0file0{CITATION_DELIMITER}L8-L13{CITATION_STOP}
      {CITATION_START}cite{CITATION_DELIMITER}turn0search0{CITATION_DELIMITER}turn1news2{CITATION_STOP}
    """
    if not families:
        return []

    family_pattern = "|".join(re.escape(family) for family in families)
    token_re = re.compile(
        rf"{re.escape(CITATION_START)}"
        rf"(?P&lt;family>{family_pattern})"
        rf"{re.escape(CITATION_DELIMITER)}"
        rf"(?P&lt;body>.*?)"
        rf"{re.escape(CITATION_STOP)}",
        re.DOTALL,
    )

    citations: list[Citation] = []

    for match in token_re.finditer(text):
        parts = [part.strip() for part in match.group("body").split(CITATION_DELIMITER)]
        parts = [part for part in parts if part]

        if not parts:
            continue

        locator = None
        if LINE_LOCATOR_RE.fullmatch(parts[-1]):
            locator = parts.pop()

        if not parts or any(not SOURCE_ID_RE.fullmatch(part) for part in parts):
            continue

        citations.append(
            {
                "raw": match.group(0),
                "family": match.group("family"),
                "source_ids": parts,
                "locator": locator,
                "start": match.start(),
                "end": match.end(),
            }
        )

    return citations


def strip_citations(text: str, citations: Iterable[Citation]) -> str:
    """
    Remove raw citation markers from text using offsets returned by
    extract_citations().
    """
    clean_text = text

    for citation in sorted(citations, key=lambda item: item["start"], reverse=True):
        clean_text = clean_text[: citation["start"]] + clean_text[citation["end"] :]

    return clean_text
```

```node
const CITATION_START = "\uE200";
const CITATION_DELIMITER = "\uE202";
const CITATION_STOP = "\uE201";

const SOURCE_ID_RE = /^[A-Za-z0-9_-]+$/;
const LINE_LOCATOR_RE = /^L\d+(?:-L\d+)?$/;

/**
 * @typedef {Object} Citation
 * @property {string} raw
 * @property {string} family
 * @property {string[]} source_ids
 * @property {string | null} locator
 * @property {number} start
 * @property {number} end
 */

/**
 * Extract citations such as:
 *
 *   {CITATION_START}cite{CITATION_DELIMITER}turn0file0{CITATION_STOP}
 *   {CITATION_START}cite{CITATION_DELIMITER}turn0file0{CITATION_DELIMITER}L8-L13{CITATION_STOP}
 *   {CITATION_START}cite{CITATION_DELIMITER}turn0search0{CITATION_DELIMITER}turn1news2{CITATION_STOP}
 *
 * @param {string} text
 * @param \{\{ families?: string[] \}\} [options]
 * @returns {Citation[]}
 */
function extractCitations(text, { families = ["cite"] } = {}) {
  if (families.length === 0) {
    return [];
  }

  const familyPattern = families
    .map((family) => family.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  const tokenRe = new RegExp(
    `${CITATION_START}(?&lt;family>${familyPattern})${CITATION_DELIMITER}(?&lt;body>[\\s\\S]*?)${CITATION_STOP}`,
    "g"
  );

  /** @type {Citation[]} */
  const citations = [];

  for (const match of text.matchAll(tokenRe)) {
    const body = match.groups?.body ?? "";
    const parts = body
      .split(CITATION_DELIMITER)
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length === 0) {
      continue;
    }

    let locator = null;
    const lastPart = parts[parts.length - 1];
    if (LINE_LOCATOR_RE.test(lastPart)) {
      locator = parts.pop() ?? null;
    }

    if (parts.length === 0 || parts.some((part) => !SOURCE_ID_RE.test(part))) {
      continue;
    }

    citations.push({
      raw: match[0],
      family: match.groups?.family ?? "",
      source_ids: parts,
      locator,
      start: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
    });
  }

  return citations;
}

/**
 * @param {string} text
 * @param {Iterable&lt;Citation>} citations
 * @returns {string}
 */
function stripCitations(text, citations) {
  let cleanText = text;
  const sortedCitations = Array.from(citations).sort(
    (left, right) => right.start - left.start
  );

  for (const citation of sortedCitations) {
    cleanText = cleanText.slice(0, citation.start) + cleanText.slice(citation.end);
  }

  return cleanText;
}
```


如果你的源 ID 使用不同的格式，请更新 `SOURCE_ID_RE` 以匹配你的系统。

## 示例

以下示例展示了两种常见的引用模式：

*   检索工具上下文，你的工具返回可引用的材料和 ID。
*   注入上下文，你直接在提示中提供可引用的块。

### 为检索工具上下文格式化引用

当模型通过工具检索上下文并在其回答中引用该检索上下文时，使用此模式。

#### 定义可引用单元

你应该根据用例所需的精确度来选择可引用单元。以下示例展示了几种可能的工具输出。

以下示例展示了几种推荐的工具输出格式。底层工具可能因应用而异，但最重要的是输出以清晰、稳定的结构呈现，如这些示例所示。

行级示例

以下是工具调用输出的示例：

```
Citation Marker: {CITATION_START}cite{CITATION_DELIMITER}turn0file0{CITATION_STOP}
[L1] The service agreement states that termination for convenience requires thirty (30) days' written notice, unless superseded by a customer-specific addendum.
[L2] In practice, renewal terms auto-extend for successive one-year periods when no written non-renewal notice is received before the deadline.
[L3] Appendix B further clarifies that pricing exceptions must be approved in writing by both Finance and the account owner.

Citation Marker: {CITATION_START}cite{CITATION_DELIMITER}turn0file1{CITATION_STOP}
...
```

这里，`turn0file0` 是稳定的源 ID。行号是定位符。

块级示例

以下是工具调用输出的示例：

```
Citation Marker: {CITATION_START}cite{CITATION_DELIMITER}turn0file0{CITATION_STOP}
[Block1]
The service agreement states that termination for convenience requires thirty (30) days' written notice, unless superseded by a customer-specific addendum.
In practice, renewal terms auto-extend for successive one-year periods when no written non-renewal notice is received before the deadline.
Appendix B further clarifies that pricing exceptions must be approved in writing by both Finance and the account owner.

Citation Marker: {CITATION_START}cite{CITATION_DELIMITER}turn0file1{CITATION_STOP}
[Block2]
...
```

如果你想要块级引用而不是行级引用，推荐的做法是让每个检索到的块拥有自己的稳定源 ID，并仍然使用相同的两字段 cite 格式来引用它，例如 `{CITATION_START}cite{CITATION_DELIMITER}turn0file0{CITATION_STOP}`，而不是发明一个完全不同的引用族。

#### 编写提示指令

```
## Citations

Results are returned by "tool_1". Each message from `tool_1` is called a "source" and identified by its reference ID, which is the first occurrence of `turn\\d+file\\d+` (for example, `turn0file0` or `turn2file1`). In this example, the string `turn0file0` would be the source reference ID.

Citations are references to `tool_1` sources. Citations may be used to refer to either a single source or multiple sources.

A citation to a single source must be written as:
{CITATION_START}cite{CITATION_DELIMITER}turn\d+file\d+{CITATION_STOP}

If line-level citations are supported, a citation to a specific line range must be written as:
{CITATION_START}cite{CITATION_DELIMITER}turn\d+file\d+{CITATION_DELIMITER}L\d+-L\d+{CITATION_STOP}

Citations to multiple sources must be written by emitting multiple citation markers, one for each supporting source.

You must NOT write reference IDs like `turn0file0` verbatim in the response text without putting them between {CITATION_START}...{CITATION_STOP}.

- Place citations at the end of the supported sentence, or inline if the sentence is long and contains multiple supported clauses.
- Citations must be placed after punctuation.
- Cite only retrieved sources that directly support the cited text.
- Never invent source IDs, line ranges, or block locators that were not returned by the tool.
- If multiple retrieved sources materially support a proposition, cite all of them.
- If the retrieved sources disagree, cite the conflicting sources and describe the disagreement accurately.
```

示例输出：

```
The on-call handoff process is documented in the weekly support sync notes. \ue200cite\ue202turn0file0\ue202L8-L13\ue201
```

### 为注入上下文格式化引用

当你提前检索或准备好上下文并直接注入到提示中时，使用此模式。

#### 定义可引用单元

对于注入上下文，一种常见模式是将源片段包装在带有稳定引用 ID 的显式标签中。

```
&lt;BLOCK id="block1">
The service agreement states that termination for convenience requires thirty (30) days' written notice, unless superseded by a customer-specific addendum.
In practice, renewal terms auto-extend for successive one-year periods when no written non-renewal notice is received before the deadline.
Appendix B further clarifies that pricing exceptions must be approved in writing by both Finance and the account owner.
&lt;/BLOCK>

&lt;BLOCK id="block2">
Syllabus
&lt;/BLOCK>
...
```

这使得可引用单元明确且易于模型引用。

#### 编写提示指令

```
## Citations

Supporting context is provided directly in the prompt as citable units. Each citable unit is identified by the value of its `id` attribute in the first occurrence of a tag such as `&lt;BLOCK id="block5"> ... &lt;/BLOCK>`. In this example, `block5` would be the source reference ID.

Because this pattern does not invoke tools, there is no tool turn counter to increment. That means you do not need to use a `turn#` prefix for the citation marker. You can keep IDs in a `turn0block5` style if that matches the rest of your system, or use plain IDs like `block5` as shown here. The key requirement is that the citation marker matches the injected context ID exactly and consistently.

Citations are references to these provided citable units. Citations may be used to refer to either a single source or multiple sources.

A citation to a single source must be written as:
{CITATION_START}cite{CITATION_DELIMITER}&lt;block_id>{CITATION_STOP}

For example:
{CITATION_START}cite{CITATION_DELIMITER}block5{CITATION_STOP}

Citations to multiple sources must be written by emitting multiple citation markers, one for each supporting block.

You must NOT write block IDs verbatim in the response text without putting them between {CITATION_START}...{CITATION_STOP}.

- Place citations at the end of the supported sentence, or inline if the sentence is long and contains multiple supported clauses.
- Citations must be placed after punctuation.
- Cite only blocks that appear in the provided context.
- Never invent new block IDs.
- Never cite outside knowledge or outside authorities.
- If multiple blocks materially support a proposition, cite all of them.
- If the provided blocks conflict, cite the conflicting blocks and describe the conflict accurately.
```

示例输出：

```
The Court held that the District Court lacked personal jurisdiction over the petitioner. \ue200cite\ue202block5\ue201
```

**注意：** OpenAI 托管的工具（如 web search）提供自动内联引用。如果你想使用托管工具，请参阅[工具概述](/guides/tools)、[web search 指南](/guides/tools-web-search)和[file search 指南](/guides/tools-file-search)。
