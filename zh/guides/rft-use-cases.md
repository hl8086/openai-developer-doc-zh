<!-- Source: https://developers.openai.com/api/docs/guides/rft-use-cases -->

[强化微调](/api/docs/guides/reinforcement-fine-tuning)（RFT）提供了一种提升模型在特定任务上性能的方法。任务必须明确且具有可验证的答案。

OpenAI 正在逐步关闭微调平台。该平台不再对新用户开放，但现有微调平台用户在未来几个月内仍可创建训练任务。

  

所有微调模型在其基础模型被[弃用](/api/docs/deprecations)之前将继续可用于推理。完整时间线请参见[此处](/api/docs/deprecations)。

## 何时使用强化微调

智能体工作流旨在做出既正确又可验证的决策。RFT 可以通过提供明确的评分标准，并使用基于代码或基于 LLM 的评分器来衡量功能正确性、事实准确性或策略合规性来提供帮助。

在早期用户中，出现了三个明确的用例：

1.  **将指令转化为可运行的代码**：将开放式提示转换为必须通过确定性测试的结构化代码、配置或模板。
2.  **将事实提取为整洁的格式**：从杂乱的非结构化文本中提取可验证的事实和摘要，并返回 JSON 结构化或其他基于模式的输出。
3.  **正确应用复杂规则**：在提供的信息具有细微差别、数量庞大、层次分明或高风险时，做出细粒度的标签或策略决策。

[准备好使用强化微调了吗？跳转到指南 →](/api/docs/guides/reinforcement-fine-tuning)

### 1\. 将指令转化为可运行的代码

在此用例中，模型对隐藏的领域约束进行推理，以生成代码、查询或基础设施模板等结构化输出。输出必须满足多个正确性条件，成功通常通过确定性方式评分：产物要么能编译、通过测试，要么满足明确的模式。

#### 为半导体设计连接验证 IP

用例提示评分器代码结果

用例

> **公司**：[ChipStack](https://www.chipstack.ai) 正在构建下一代 AI 驱动的芯片设计和验证工具，旨在显著减少开发和验证复杂半导体芯片的时间和成本。
> 
> **要解决的问题**：对人类来说，一项具有挑战性且耗时的任务是将设计接口绑定到验证 IP（预创建的验证组件，正确应用后可以显著提高验证的质量和覆盖率）。验证 IP 种类繁多，每个可能包含数十到数百个需要映射的信号。必须有人深入了解该领域才能正确应用验证 IP。
> 
> **目标**：为了训练 OpenAI 推理模型来完成此任务，ChipStack 准备了一个包含不到 50 个样本的数据集，然后执行了多种 RFT 变体。在最终评估报告中，他们针对每个模型和变体——o1-mini 基础版和微调版、o3-mini 基础版和微调版——对评估集运行了三次，并对每个样本的结果取平均值，然后计算总体平均值。

提示

> 以下是提供的一段示例数据。

```
[
    {"name": "BLOCK_SIZE", "value": "8"},
    {"name": "ADDR_WIDTH", "value": "4"}
]
```

评分器代码

> 以下是用 Python 定义的字符串映射评分器，表示为具有 `name` 和 `value` 属性的对象列表。
> 
> 从概念上讲，这旨在建模类似 `Dict[str, str]` 的类型。

```
{
  "type": "python",
  "name": "donors_caas",
  "image_tag": "alpha",
  "source": "from collections import Counter

def grade(sample: dict[str, str], item: dict[str, str]) -> float:
    # multisets of (name, value) pairs
    predicted = sample[\"output_json\"][\"predicted\"]
    expected  = item[\"reference_answer\"]
    pred_counts = Counter((d[\"name\"], d[\"value\"]) for d in predicted)
    exp_counts  = Counter((d[\"name\"], d[\"value\"]) for d in expected)

    true_pos = sum(min(pred_counts[p], exp_counts[p]) for p in pred_counts)
    pred_total = sum(pred_counts.values())
    exp_total  = sum(exp_counts.values())

    precision = true_pos / pred_total if pred_total else 0.0
    recall    = true_pos / exp_total  if exp_total  else 0.0

    if precision + recall == 0.0:
        return 0.0
    return 2 * precision * recall / (precision + recall)"
}
```

结果

> 对于 o1-mini 和 o3-mini，性能均提升了约 12 个百分点。微调变体在识别何时不应进行连接方面有了很大改善。许多商业验证 IP 可能包含数百个可选信号，其中大多数不应被应用。
> 
> "得益于强大的基础模型和易于使用的强化微调 API，我们能够用少量高质量样本显著提升任务性能。"
> 
> —[ChipStack](https://www.chipstack.ai)，下一代 AI 驱动的芯片设计和验证工具

#### 生成可编译并通过 AST 检查的生产级 API 代码片段

用例评分器代码结果

用例

> **公司**：[Runloop](https://www.runloop.ai) 是一个将 AI 驱动的编码智能体部署到生产环境的平台，具备公共和自定义基准测试能力以优化性能。
> 
> **要解决的问题**：Runloop 希望提升模型在使用第三方 API（如 Stripe API）方面的性能，这些 API 可能庞大且复杂，在没有人工参与的情况下难以处理。如果他们能训练模型使用 Stripe API，Runloop 就能将具有经济影响力的业务案例转化为可运行的代码。
> 
> **目标**：他们的目标是教会模型掌握 Stripe API 的使用，包括为任意用户请求编写完整的代码片段——通过改编现有集成指南中的信息、合并多个指南中的信息，或推断指南中未明确说明的信息。他们使用 RFT 并设置了两个主要奖励：
> 
> 1.  奖励模型以符合"动态"集成指南预期外观的 Markdown 格式输出答案。
> 2.  奖励模型生成"正确"的代码片段，通过 AST Grep 验证输出的代码。这使他们能够确认模型正在使用正确的参数进行正确的 Stripe SDK 调用，在某些情况下甚至以正确的顺序调用。

评分器代码

```
# Note this file gets uploaded to the OpenAI API as a grader
from ast_grep_py import SgRoot
from pydantic import BaseModel, Field  # type: ignore
from typing import Any, List, Optional
import re

SUPPORTED_LANGUAGES = ['typescript', 'javascript', 'ts', 'js']

class CodeBlock(BaseModel):
    language: str = Field(
        description="Programming language of the code block (e.g., 'python', 'javascript')",
        examples=["python", "javascript", "typescript"]
    )
    path: str = Field(
        description="Target file path where the code should be written",
        examples=["main.py", "src/app.js", "index.html"]
    )
    code: str = Field(
        description="Actual code content extracted from the code block"
    )

class ASTGrepPattern(BaseModel):
    file_path_mask: str = Field(..., description="The file path pattern to match against")
    pattern: str = Field(..., description="The main AST grep pattern to search for")
    additional_greps: Optional[List[str]] = Field(
        default=None,
        description="Additional patterns that must also be present in the matched code"
    )

def extract_code_blocks(llm_output: str) -> List[CodeBlock]:
    # Regular expression to match code blocks with optional language and path
    try:
        pattern = r"```(\w+\s+)?([\w./-]+)?\n([\s\S]*?)\n```"
        matches = list(re.finditer(pattern, llm_output, re.DOTALL))

        print(f"Found {len(matches)} code blocks in the LLM output")

        # Check if any code blocks were found
        if not matches:
            raise Exception("No code blocks found in the LLM response")

        code_blocks: list[CodeBlock] = []
        for match in matches:
            language = match.group(1) or ""
            path = match.group(2) or ""
            code = match.group(3)

            # Clean the path and language
            path = path.strip()
            language = language.strip()

            # If path is relative (doesn't start with /), prefix with /home/user/testbed/
            if path and not path.startswith("/"):
                original_path = path
                path = f"/home/user/testbed/{path}"
                print(
                    f"Converting relative path '{original_path}' to absolute path '{path}'"
                )

            code_blocks.append(
                CodeBlock(language=language, path=path, code=code.strip())
            )

        # Check for missing language or path in code blocks
        missing_language = [
            i for i, block in enumerate(code_blocks) if not block.language
        ]
        missing_path = [i for i, block in enumerate(code_blocks) if not block.path]

        if missing_language:
            print(
                f"WARNING: Code blocks at positions {missing_language} are missing language identifiers"
            )
            raise Exception(
                f"Code blocks at positions {missing_language} are missing language identifiers"
            )

        if missing_path:
            print(
                f"WARNING: Code blocks at positions {missing_path} are missing file paths"
            )
            raise Exception(
                f"Code blocks at positions {missing_path} are missing file paths"
            )

        paths = [block.path for block in code_blocks if block.path]
        print(
            f"Successfully extracted {len(code_blocks)} code blocks with paths: {', '.join(paths)}"
        )

    except Exception as e:
        print(f"Error extracting code blocks: {str(e)}")
        raise

    return code_blocks


def calculate_ast_grep_score(code_blocks: List[CodeBlock], ast_greps: Any) -> float:
    # Convert ast_greps to list if it's a dict
    if isinstance(ast_greps, dict):
        ast_greps = [ast_greps]

    # Parse each grep pattern into the Pydantic model
    parsed_patterns: List[ASTGrepPattern] = []
    for grep in ast_greps:
        try:
            pattern = ASTGrepPattern(**grep)
            parsed_patterns.append(pattern)
        except Exception as e:
            print(f"Error parsing AST grep pattern: {e}")
            return 0.0

    if not parsed_patterns:
        return 0.0

    total_score = 0.0
    pattern_count = len(parsed_patterns)

    # Filter code blocks to only include TypeScript and JavaScript files
    supported_blocks = [
        block for block in code_blocks
        if block.language.lower() in SUPPORTED_LANGUAGES
    ]

    if not supported_blocks:
        print("No TypeScript or JavaScript code blocks found to analyze")
        return 0.0

    for pattern in parsed_patterns:
        # Find matching code blocks based on path prefix
        matching_blocks = [
            block for block in supported_blocks
            if block.path.startswith(pattern.file_path_mask)
        ]

        if not matching_blocks:
            print(f"No matching code blocks found for path prefix: {pattern.file_path_mask}")
            continue

        pattern_found = False
        for block in matching_blocks:
            try:
                # Create AST root for the code block
                root = SgRoot(block.code, block.language)
                node = root.root()

                # Check main pattern
                matches = node.find(pattern=pattern.pattern)
                if not matches:
                    continue

                # If we have additional greps, check them too
                if pattern.additional_greps:
                    all_additional_found = True
                    for additional_grep in pattern.additional_greps:
                        if additional_grep not in block.code:
                            all_additional_found = False
                            break

                    if not all_additional_found:
                        continue

                # If we get here, we found a match with all required patterns
                pattern_found = True
                break

            except Exception as e:
                print(f"Error processing code block {block.path}: {e}")
                continue

        if pattern_found:
            total_score += 1.0

    # Return average score across all patterns
    return total_score / pattern_count if pattern_count > 0 else 0.0

def grade_format(output_text: str) -> float:
        # Find <plan> and </plan> tags
    plan_start = output_text.find('<plan>')
    plan_end = output_text.find('</plan>')

    # Find <code> and </code> tags
    code_start = output_text.find('<code>')
    code_end = output_text.find('</code>')

    reward = 0.0

    if plan_start == -1 or plan_end == -1 or code_start == -1 or code_end == -1:
        print(f'missing plan or code tags. format reward: {reward}')
        return reward
    reward += 0.1 # total: 0.1

    if not (plan_start < plan_end < code_start < code_end):
        print(f'tags present but not in the correct order. format reward: {reward}')
        return reward
    reward += 0.1 # total: 0.2

    # Check if there are any stray tags
    plan_tags = re.findall(r'</?plan>', output_text)
    code_tags = re.findall(r'</?code>', output_text)

    if len(plan_tags) != 2 or len(code_tags) != 2:
        print(f'found stray plan or code tags. format reward: {reward}')
        return reward
    reward += 0.2 # total: 0.4

    # Extract content after </code> tag
    after_tags = output_text[code_end + len('</code>'):].strip()
    if after_tags:
        print(f'found text after code tags. format reward: {reward}')
        return reward
    reward += 0.2 # total: 0.6

    # Extract content inside <plan> tags
    plan_content = output_text[plan_start + len('<plan>'):plan_end].strip()
    if not plan_content:
        print(f'no plan content found. format reward: {reward}')
        return reward
    reward += 0.1 # total: 0.7

    # Extract content inside <code> tags
    code_content = output_text[code_start + len('<code>'):code_end].strip()
    if not code_content:
        print(f'no code content found. format reward: {reward}')
        return reward
    reward += 0.1 # total: 0.8

    # Extract content between </plan> and <code> tags
    between_tags = output_text[plan_end + len('</plan>'):code_start].strip()
    if between_tags:
        print(f'found text between plan and code tags. format reward: {reward}')
        return reward
    reward += 0.2 # total: 1.0

    if reward == 1.0:
        print(f'global format reward: {reward}')

    return reward

def grade(sample: Any, item: Any) -> float:
    try:
        output_text = sample["output_text"]

        format_reward = grade_format(output_text)
        if format_reward < 1.0:
            return format_reward

        # Extract code content for grading
        code_start = output_text.find('<code>')
        code_end = output_text.find('</code>')
        code_to_grade: str = output_text[code_start + len('<code>'):code_end].strip()
        code_blocks: List[CodeBlock] = []
        try:
            code_blocks = extract_code_blocks(code_to_grade)
        except Exception as e:
            print(f'error extracting code blocks: {e}')
            return 0.5

        ast_greps = item["reference_answer"]["ast_greps"]
        ast_grep_score = calculate_ast_grep_score(code_blocks, ast_greps)

        return (format_reward + ast_grep_score) / 2.0
    except Exception as e:
        print(f"Error during grading: {str(e)}")
        return 0.0
```

结果

> 综合格式和 AST Grep 的总奖励来看，Runloop 的 RFT 模型在基准测试中相比基础 o3-mini 模型平均提升了 **12%**。
> 
> 他们实施了两种类型的测试，一种提供集成指南中的明确内容（评估推理和指令遵循能力），另一种不提供（评估知识回忆能力）。两种变体的改进均超过 **8%**。
> 
> "OpenAI 的 RFT 平台让我们能够使用世界上最好的通用推理模型，并配备工具集来增强对我们业务重要的问题领域的推理能力。"
> 
> —[Runloop](https://www.runloop.ai/)

#### 日程管理器中冲突和重复的正确处理

用例结果

用例

> **公司**：[Milo](https://www.joinmilo.com) 帮助忙碌的父母管理混乱的家庭日程，将杂乱的输入——如包含待办事项的短信对话、学校通讯 PDF、每周提醒、体育日程邮件——转换为可靠的日历和列表操作。
> 
> **要解决的问题**：基础 GPT-4o 提示和 SFT 未能达到信任阈值。
> 
> **目标**：Milo 使用 RFT 来正确创建编码任务，如事件与列表分类、重复规则生成、准确的更新和删除、冲突检测以及严格的输出格式。他们定义了一个评分器来检查生成的项目对象是否完整、分类是否正确、是否为重复项或存在日历冲突。

结果

> 结果显示各方面性能均有提升，平均正确性分数**从 0.86 提升到 0.91**，而最具挑战性的场景从 **0.46 提升到 0.71**（满分=1）。
> 
> "准确性不仅仅是一个指标——它是忙碌父母的安心保障。这些仍然是早期阶段，但基础性能有了如此重要的改进，我们能够更积极地推进复杂推理需求。"
> 
> "导航和支持家庭动态涉及理解数据的细微含义。以冲突为例——知道 Ethan 的足球与 Ella 的独奏会冲突，因为爸爸必须接送两个孩子，这比简单的时间重叠要深入得多。"
> 
> —[Milo](https://www.joinmilo.com)，面向家庭的 AI 日程工具

### 2\. 将事实提取为整洁的格式

这些任务通常涉及需要明确分类指南的细微区别。成功的框架需要由领域专家通过共识定义的明确且分层的标注方案。如果没有一致的共识，评分信号就会变得嘈杂，削弱 RFT 的有效性。

#### 分配 ICD-10 医疗编码

用例结果

用例

> **公司**：[Ambience](https://www.ambiencehealthcare.com) 是一个 AI 平台，为临床医生消除行政负担，确保 100 多个专科的准确、合规文档记录，帮助医生专注于患者护理，同时提高文档质量并降低医疗系统的合规风险。
> 
> **要解决的问题**：ICD-10 编码是医学中最复杂的行政任务之一。每次患者就诊后，临床医生必须将每个诊断映射到约 70,000 个代码中的一个——需要遵循支付方关于特异性、护理地点和互斥配对的特定规则。错误可能触发审计和高达九位数的罚款。
> 
> **目标**：使用 OpenAI 前沿模型的强化微调，Ambience 希望训练一个推理系统，该系统能够监听就诊音频、引入相关 EHR 上下文，并以超过专家临床医生的准确度推荐 ICD-10 代码。

结果

> Ambience 实现了可以领先人类专家的模型改进。
> 
> 在涵盖数百次就诊的黄金标准测试集上，强化微调使模型从落后于人类变为领先 **12 个百分点——消除了约四分之一的训练有素的医生所犯的编码错误**：
> 
> *   o3-mini（基础版）：0.39（-6 分）
> *   医生基线：0.45
> *   RFT 微调 o3-mini：0.57（+12 分）
> 
> 结果是一个实时的、护理点编码支持系统，可以提高报销完整性同时降低合规风险。
> 
> "准确的 ICD-10 选择对合规文档记录至关重要。RFT 解锁了我们在任何基础模型中都未曾见过的新编码精度水平，为自动化编码设定了新标杆。"
> 
> —[Ambience Healthcare](https://www.ambiencehealthcare.com)

#### 提取摘录以支持法律主张

用例提示评分器结果

用例

> **公司**：[Harvey](https://www.harvey.ai) 正在构建法律团队信赖的 AI——而这种信赖取决于从大量合同、法规和判例法中精确检索正确的证据。法律专业人士不满足于仅仅生成听起来合理的摘要或改述的答案。他们要求可验证的引用——可以直接追溯到源文档的段落。
> 
> **要解决的问题**：Harvey 的客户使用其模型来分类诉讼风险、构建法律论点，并为法律专业人士提供尽职调查支持——所有这些任务中，一个遗漏或错误引用的句子都可能改变结果。模型必须能够解析冗长、密集的法律文件，并仅提取相关部分。在实践中，这些输入通常是杂乱且不一致的：有些主张含糊不清，而另一些则依赖于深埋在样板文件中的罕见法律原则。
> 
> **目标**：该任务的要求是解释细微的法律主张、浏览长篇文档，并通过逐字摘录选择切题的支持内容。

提示

```
## Instructions
You will be provided with a question and a text excerpt. Identify any passages in the text that are directly relevant to answering the question.
- If there are no relevant passages, return an empty list.
- Passages must be copied **exactly** from the text. Do not paraphrase or summarize.
## Excerpt
"""{text_excerpt}"""
```

评分器

```
from rapidfuzz import fuzz


# Similarity ratio helper
def fuzz_ratio(a: str, b: str) -> float:
    """Return a normalized similarity ratio using RapidFuzz.
    """
    if len(a) == 0 and len(b) == 0:
        return 1.0
    return fuzz.ratio(a, b) / 100.0


# Main grading entrypoint (must be named `grade`)
def grade(sample: dict, item: dict) -> float:
    """Compute an F1‑style score for citation extraction answers using RapidFuzz.
    """
    model_passages = (sample.get('output_json') or {}).get('passages', [])
    ref_passages = (item.get('reference_answer') or {}).get('passages', [])

    # If there are no reference passages, return 0.
    if not ref_passages:
        return 0.0

    # Recall: average best match for each reference passage.
    recall_scores = []
    for ref in ref_passages:
        best = 0.0
        for out in model_passages:
            score = fuzz_ratio(ref, out)
            if score > best:
                best = score
        recall_scores.append(best)
    recall = sum(recall_scores) / len(recall_scores)

    # Precision: average best match for each model passage.
    if not model_passages:
        precision = 0.0
    else:
        precision_scores = []
        for out in model_passages:
            best = 0.0
            for ref in ref_passages:
                score = fuzz_ratio(ref, out)
                if score > best:
                    best = score
            precision_scores.append(best)
        precision = sum(precision_scores) / len(precision_scores)

    if precision + recall == 0:
        return 0.0

    return 2 * precision * recall / (precision + recall)
```

结果

> 经过强化微调后，Harvey 的 F1 分数**提升了 20%**：
> 
> *   基线 F1：0.563
> *   RFT 后 F1：0.6765
> 
> 使用 RFT，Harvey 显著提升了法律事实提取性能，超越了 GPT-4o 的效率和准确性。早期试验表明，RFT 在与 GPT-4o 的 **93% 对比中获胜或持平**。
> 
> "RFT 模型展示了与 GPT-4o 相当或更优的性能，但推理速度显著更快，这对实际法律用例特别有益。"
> 
> —[Harvey](https://www.harvey.ai)，面向法律团队的 AI

### 3\. 正确应用复杂规则

此用例涉及从非结构化输入中提取可验证的事实或实体，并将其放入明确定义的模式中（例如 JSON 对象、条件代码、医疗编码、法律引用或财务指标）。

成功的提取任务通常受益于精确、连续的评分方法——如跨度级 F1 分数、模糊文本匹配指标或数值准确性检查——以评估提取的信息与真实标准的对齐程度。定义明确的成功标准和详细的评分标准。然后，模型就能实现可靠、可重复的改进。

#### 税务分析中的专家级推理

用例评分器代码结果

用例

> **公司**：[Accordance](https://www.accordance.com) 正在为税务、审计和注册会计师团队构建平台。
> 
> **要解决的问题**：税务是一个高度复杂的领域，需要对细微的事实模式和复杂的法规进行深度推理。这也是一个不断变化的领域。
> 
> **目标**：Accordance 希望为复杂的税务场景建立一个高信任度的系统，同时保持准确性。与传统的硬编码软件不同，重要的是他们的数据提取工具能够随着税务环境的演变而适应。

评分器代码

```
[+0.05] For correctly identifying Alex (33.33%), Barbara (33.33% → 20%), Chris (33.33%), and Dana (13.33%) ownership percentages
[+0.1] For correctly calculating Barbara's annual allocation as 26.67% and Dana's as 6.67% without closing of books
[+0.15] For properly allocating Alex ($300,000), Barbara ($240,030), Chris ($300,000), and Dana ($60,030) ordinary income
[+0.1] For calculating Alex's ending stock basis as $248,333 and debt basis as $75,000
[+0.05] For calculating Barbara's remaining basis after sale as $264,421
[+0.1] For calculating AAA before distributions as $1,215,000 and ending AAA as $315,000
[+0.1] For identifying all distributions as tax-free return of capital under AAA
[+0.1] For calculating Barbara's capital gain on stock sale as $223,720 ($400,000 - $176,280)
[+0.1] For explaining that closing of books would allocate based on actual half-year results
[+0.05] For identifying the ordering rules: AAA first, then E&P ($120,000), then remaining basis
[+0.05] For noting distributions exceeding $1,215,000 would be dividends up to $120,000 E&P
[+0.05] For correctly accounting for separately stated items in basis calculations (e.g., $50,000 Section 1231 gain)
```

结果

> 通过与 OpenAI 及其内部税务专家合作，Accordance 实现了：
> 
> *   税务分析任务相比基础模型提升了近 **40%**
> *   在 TaxBench 等基准测试中优于所有其他领先模型
> *   RFT 训练的模型展示了处理高级税务场景的高准确性能力——经税务专业人士评估，Accordance 的微调模型展示了专家级推理能力，有潜力节省数千小时的人工工作
> 
> "我们在税务分析任务上相比基础模型实现了 38.89% 的提升，并在关键税务基准测试（包括 TaxBench）上显著优于所有其他领先模型。RFT 训练模型处理复杂税务场景同时保持准确性的能力证明了强化微调——以及更广泛的 AI——已为专业应用做好准备。最重要的是，RFT 为随着税务环境演变而持续适应提供了基础，确保持续的价值和相关性。经税务专家评估，我们的微调模型展示了专家级推理能力，将节省数千个专业工时——这不仅仅是渐进式改进，而是税务工作方式的范式转变。"
> 
> —[Accordance](https://www.accordance.com/)，AI 税务会计公司

#### 细微内容审核策略的执行

用例结果

用例

> **公司**：[SafetyKit](https://www.safetykit.com) 是一个风险和合规平台，帮助组织在复杂的内容审核工作流中做出决策。
> 
> **要解决的问题**：这些系统必须处理大量内容并应用需要多步推理的复杂策略逻辑。由于数据量大且标注中存在细微区别，这类任务对通用模型来说可能很困难。
> 
> **目标**：SafetyKit 旨在用单个使用强化微调模型的推理智能体替换其最复杂工作流中的多个节点。目标是缩短 SafetyKit 在具有挑战性的细微领域中新策略执行的上市时间。

结果

> SafetyKit 正在使用其 o3-mini RFT 模型来支持高级内容审核能力，为世界上最大的 AI 聊天机器人公司之一确保用户安全。他们已成功将 F1 分数**从 86% 提升到 90%**，即将替换其生产管道中数十个 4o 调用。
> 
> "SafetyKit 的 RFT 驱动审核在细微内容审核任务中实现了实质性改进，这对于在动态的真实场景中保护用户至关重要。"
> 
> —[SafetyKit](https://www.safetykit.com)

#### 法律文档审查、比较和摘要

用例结果

用例

> **公司**：[Thomson Reuters](https://www.thomsonreuters.com) 是一家 AI 和技术公司，通过可信内容和工作流自动化赋能专业人士。
> 
> **要解决的问题**：法律专业人士在做出任何决策之前必须阅读大量内容。Thomson Reuters 的 CoCounsel 产品旨在通过提供具有内容和行业知识的 AI 助手来帮助这些专家更快地工作。驱动此工具的模型必须理解复杂的法律规则。
> 
> **目标**：Thomson Reuters 旨在创建一个在法律 AI 技能方面表现出色的强化微调模型。他们对 RFT 进行了初步评估，以查看是否能实现模型性能改进，使用了来自三个高频使用的 CoCounsel 法律 AI 技能的专业数据集：
> 
> 1.  审查文档：针对合同、笔录和其他法律文件提出的问题生成详细答案
> 2.  比较文档：突出显示两个或多个不同合同或文件之间的实质性差异
> 3.  摘要：总结一个或多个文档中最重要的信息，以实现快速法律审查

结果

> ![提供示例数据并创建微调任务以优化模型在您用例中的性能](https://cdn.openai.com/API/docs/images/thomsonreuters-results.png)
> 
> "LLM 作为评判者有助于证明改进推理模型的可能性——在初步评估中，RFT 模型始终优于基线 o3-mini 和 o1 模型"
> 
> —[Thomson Reuters](https://www.thomsonreuters.com/)，AI 和技术公司

## 评估是基础

**在实施 RFT 之前，我们强烈建议为您打算微调的任务创建并运行评估**。如果您打算微调的模型在绝对最低分或绝对最高分上得分，那么 RFT 对您没有用处。

RFT 通过强化对提供的提示的更好答案来工作。如果我们无法区分不同答案的质量（即如果它们都获得最低或最高可能分数），那么就没有可学习的训练信号。但是，如果您的评估分数在最低和最高可能分数之间的某个范围内，就有足够的数据可以使用。

有效的评估揭示了人类专家一致同意但当前前沿模型仍有困难的机会，为 RFT 提供了有价值的差距来弥合。[开始使用评估](/api/docs/guides/evals)。

## 如何从 RFT 获得更好的结果

要在微调模型中看到改进，有两个主要方面需要重新审视和完善：确保您的任务定义明确，以及使您的评分方案更加稳健。

### 重新构建或澄清您的任务

好的任务给模型一个公平的学习机会，并让您量化改进。

*   **从模型偶尔已经能解决的任务开始**。RFT 通过采样许多答案、保留看起来最好的答案，并推动模型朝这些答案靠拢来工作。如果模型今天从未得到正确答案，它就无法改进。
*   **确保每个答案都可以评分**。评分器必须在没有人工参与的情况下读取答案并产生分数。我们支持多种[评分器类型](/api/docs/guides/graders)，包括自定义 Python 评分器和 LLM 评判者。如果您无法使用可用的评分器编写代码来评判答案，RFT 就不是合适的工具。
*   **消除对"正确"答案的疑虑**。如果两个认真的人经常对解决方案意见不一致，则任务太模糊。重写提示、添加上下文，或将任务拆分为更清晰的部分，直到领域专家达成一致。
*   **限制侥幸猜测**。如果任务是多选题且有一个明显的最佳选项，模型可以靠运气获胜。添加更多类别、要求简短的开放式文本，或调整格式使猜测代价高昂。

### 加强您的评分器

清晰、稳健的评分方案对 RFT 至关重要。

*   **产生平滑的分数，而不是通过/失败的标记**。随着答案改进而逐渐变化的分数提供更好的训练信号。
*   **防范奖励黑客**。当模型找到一种无需真正技能就能获得高分的捷径时，就会发生这种情况。
*   **避免偏斜数据**。某个标签出现频率最高的数据集会诱使模型猜测该标签。平衡数据集或增加稀有案例的权重，使模型必须思考。
*   **当代码不够用时使用 LLM 评判者**。对于丰富的开放式答案，让一个[独立的 OpenAI 模型评分](/api/docs/guides/graders#model-graders)您微调模型的答案。确保您：
    *   **评估评判者**：通过您的 LLM 评判者运行多个候选响应和正确答案，以确保返回的评分稳定且与偏好一致。
    *   **提供少样本示例**。在提示中包含优秀、一般和较差的答案，以提高评分器的有效性。

了解更多关于[评分器类型](/api/docs/guides/graders)的信息。

## 其他资源

如需更多灵感，请访问 [OpenAI Cookbook](/cookbook)，其中包含示例代码和第三方资源链接，或了解更多关于我们的模型和推理能力：

*   [认识模型](/api/docs/models)
*   [强化微调指南](/api/docs/guides/reinforcement-fine-tuning)
*   [评分器](/api/docs/guides/graders)
*   [模型优化概述](/api/docs/guides/model-optimization)