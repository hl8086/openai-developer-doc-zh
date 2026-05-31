<!-- Source: https://developers.openai.com/api/docs/mcp -->

[Model Context Protocol](https://modelcontextprotocol.io/introduction) (MCP) 是一个开放协议，正在成为扩展 AI 模型工具和知识的行业标准。远程 MCP 服务器可用于通过互联网将模型连接到新的数据源和功能。

在本指南中，我们将介绍如何构建一个远程 MCP 服务器，该服务器从私有数据源（[向量存储](/api/docs/guides/retrieval)）读取数据，并将其作为数据应用（以前称为连接器）在 ChatGPT 中提供，用于聊天、深度研究和公司知识，以及[通过 API](/api/docs/guides/deep-research) 使用。

**注意**：关于 ChatGPT 应用设置（开发者模式、连接 MCP 服务器和可选 UI），请先参阅 Apps SDK 文档：[快速入门](/apps-sdk/quickstart)、[构建 MCP 服务器](/apps-sdk/build/mcp-server)、[从 ChatGPT 连接](/apps-sdk/deploy/connect-chatgpt) 和 [身份验证](/apps-sdk/build/auth)。如果你正在构建数据应用，可以跳过 UI 资源，只需暴露工具即可。

**术语更新**：自 **2025 年 12 月 17 日** 起，ChatGPT 将连接器重命名为应用。现有功能保持不变，但当前文档和产品 UI 使用"应用"。请参阅帮助中心更新：[带同步功能的 ChatGPT 应用](https://help.openai.com/en/articles/10847137-chatgpt-apps-with-sync)、[ChatGPT 中的公司知识](https://help.openai.com/en/articles/12628342-company-knowledge-in-chatgpt-business-enterprise-and-edu) 和 [应用中的管理员控制、安全性和合规性](https://help.openai.com/en/articles/11509118-admin-controls-security-and-compliance-in-apps-connectors-enterprise-edu-and-business)。

## 配置数据源

你可以使用任何来源的数据来驱动远程 MCP 服务器，但为了简单起见，我们将使用 OpenAI API 中的[向量存储](/api/docs/guides/retrieval)。首先将 PDF 文档上传到新的向量存储 - [你可以使用这本关于猫的 19 世纪公共领域书籍](https://cdn.openai.com/API/docs/cats.pdf)作为示例。

你可以[在仪表板中](https://platform.openai.com/storage/vector_stores)上传文件并创建向量存储，也可以通过 API 创建向量存储和上传文件。[按照向量存储指南](/api/docs/guides/retrieval)设置向量存储并上传文件。

记下向量存储的唯一 ID，以便在后续示例中使用。

![向量存储配置](https://cdn.openai.com/API/docs/images/vector_store.png)

## 创建 MCP 服务器

接下来，让我们创建一个远程 MCP 服务器，该服务器将对我们的向量存储执行搜索查询，并能够返回具有给定 ID 的文件的文档内容。

在本示例中，我们将使用 Python 和 [FastMCP](https://github.com/jlowin/fastmcp) 构建 MCP 服务器。本节末尾将提供服务器的完整实现，以及在 [Replit](https://replit.com/) 上运行它的说明。

请注意，还有许多其他 MCP 服务器框架可以在各种编程语言中使用。无论你使用哪个框架，服务器中的工具定义都需要符合此处描述的格式。

要与 ChatGPT 深度研究和公司知识（以及通过 API 的深度研究）配合使用，你的 MCP 服务器应实现两个只读工具：`search` 和 `fetch`，使用 [Company knowledge compatibility](/apps-sdk/build/mcp-server#company-knowledge-compatibility) 中的兼容性模式。

为每个工具声明输出模式，以便客户端可以验证结果格式。在 FastMCP 中，类型化的返回模型可以自动生成此模式；下面的示例从相同的模型显式传递 `output_schema`。

### `search` 工具

`search` 工具负责根据用户的查询从 MCP 服务器的数据源返回相关搜索结果列表。

_参数：_

单个查询字符串。

_返回：_

一个包含单个键 `results` 的对象，其值为结果对象数组。每个结果对象应包含：

*   `id` - 文档或搜索结果项的唯一 ID
*   `title` - 人类可读的标题。
*   `url` - 用于引用的规范 URL。

在 MCP 中，将此对象作为 `structuredContent` 返回，并在 [content 数组](https://modelcontextprotocol.io/docs/learn/architecture#understanding-the-tool-execution-response)中包含相同值的 JSON 编码字符串以保持兼容性。

最终的工具响应应如下所示：

```
{
  "structuredContent": {
    "results": [{ "id": "doc-1", "title": "...", "url": "..." }]
  },
  "content": [
    {
      "type": "text",
      "text": "{\"results\":[{\"id\":\"doc-1\",\"title\":\"...\",\"url\":\"...\"}]}"
    }
  ]
}
```

### `fetch` 工具

fetch 工具用于检索搜索结果文档或项目的完整内容。

_参数：_

一个字符串，是搜索文档的唯一标识符。

_返回：_

一个包含以下属性的对象：

*   `id` - 文档或搜索结果项的唯一 ID
*   `title` - 搜索结果项的字符串标题
*   `text` - 文档或项目的完整文本
*   `url` - 文档或搜索结果项的 URL。用于在研究中引用特定资源。
*   `metadata` - 关于结果的可选键/值数据对

在 MCP 中，将此对象作为 `structuredContent` 返回，并在 content 数组中包含相同值的 JSON 编码字符串以保持兼容性。

最终的工具响应应如下所示：

```
{
  "structuredContent": {
    "id": "doc-1",
    "title": "...",
    "text": "full text...",
    "url": "https://example.com/doc",
    "metadata": { "source": "vector_store" }
  },
  "content": [
    {
      "type": "text",
      "text": "{\"id\":\"doc-1\",\"title\":\"...\",\"text\":\"full text...\",\"url\":\"https://example.com/doc\",\"metadata\":{\"source\":\"vector_store\"}}"
    }
  ]
}
```

### 服务器示例

尝试此示例 MCP 服务器的简单方法是使用 [Replit](https://replit.com/)。你可以使用自己的 API 凭据和向量存储信息配置此示例应用程序来亲自尝试。

[Replit 上的示例 MCP 服务器 - 在 Replit 上 Remix 服务器示例进行实时测试。](https://replit.com/@kwhinnery-oai/DeepResearchServer?v=1#README.md)

下面也提供了 FastMCP 中 `search` 和 `fetch` 工具的完整实现以供参考。

完整实现 - FastMCP 服务器

```
"""
Sample MCP Server for ChatGPT Integration

This server implements the Model Context Protocol (MCP) with search and fetch
capabilities designed to work with ChatGPT's chat and deep research features.
"""

import logging
import os
from typing import Any

from fastmcp import FastMCP
from openai import OpenAI
from pydantic import BaseModel


class SearchResult(BaseModel):
    id: str
    title: str
    url: str


class SearchOutput(BaseModel):
    results: list[SearchResult]


class FetchOutput(BaseModel):
    id: str
    title: str
    text: str
    url: str
    metadata: dict[str, Any] | None = None

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# OpenAI configuration
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
VECTOR_STORE_ID = os.environ.get("VECTOR_STORE_ID", "")

# Initialize OpenAI client
openai_client = OpenAI()

server_instructions = """
This MCP server provides search and document retrieval capabilities
for ChatGPT Apps and deep research. Use the search tool to find relevant documents
based on keywords, then use the fetch tool to retrieve complete
document content with citations.
"""


def create_server():
    """Create and configure the MCP server with search and fetch tools."""

    # Initialize the FastMCP server
    mcp = FastMCP(name="Sample MCP Server",
                  instructions=server_instructions)

    @mcp.tool(output_schema=SearchOutput.model_json_schema())
    async def search(query: str) -> SearchOutput:
        """
        Search for documents using OpenAI Vector Store search.

        This tool searches through the vector store to find semantically relevant matches.
        Returns a list of search results with basic information. Use the fetch tool to get
        complete document content.

        Args:
            query: Search query string. Natural language queries work best for semantic search.

        Returns:
            Dictionary with 'results' key containing list of matching documents.
            Each result includes id, title, and URL.
        """
        if not query or not query.strip():
            return SearchOutput(results=[])

        if not openai_client:
            logger.error("OpenAI client not initialized - API key missing")
            raise ValueError(
                "OpenAI API key is required for vector store search")

        # Search the vector store using OpenAI API
        logger.info(f"Searching {VECTOR_STORE_ID} for query: '{query}'")

        response = openai_client.vector_stores.search(
            vector_store_id=VECTOR_STORE_ID, query=query)

        results = []

        # Process the vector store search results
        if hasattr(response, 'data') and response.data:
            for i, item in enumerate(response.data):
                # Extract file_id, filename, and content
                item_id = getattr(item, 'file_id', f"vs_{i}")
                item_filename = getattr(item, 'filename', f"Document {i+1}")

                result = SearchResult(
                    id=item_id,
                    title=item_filename,
                    url=f"https://platform.openai.com/storage/files/{item_id}",
                )

                results.append(result)

        logger.info(f"Vector store search returned {len(results)} results")
        return SearchOutput(results=results)

    @mcp.tool(output_schema=FetchOutput.model_json_schema())
    async def fetch(id: str) -> FetchOutput:
        """
        Retrieve complete document content by ID for detailed
        analysis and citation. This tool fetches the full document
        content from OpenAI Vector Store. Use this after finding
        relevant documents with the search tool to get complete
        information for analysis and proper citation.

        Args:
            id: File ID from vector store (file-xxx) or local document ID

        Returns:
            Complete document with id, title, full text content,
            optional URL, and metadata

        Raises:
            ValueError: If the specified ID is not found
        """
        if not id:
            raise ValueError("Document ID is required")

        if not openai_client:
            logger.error("OpenAI client not initialized - API key missing")
            raise ValueError(
                "OpenAI API key is required for vector store file retrieval")

        logger.info(f"Fetching content from vector store for file ID: {id}")

        # Fetch file content from vector store
        content_response = openai_client.vector_stores.files.content(
            vector_store_id=VECTOR_STORE_ID, file_id=id)

        # Get file metadata
        file_info = openai_client.vector_stores.files.retrieve(
            vector_store_id=VECTOR_STORE_ID, file_id=id)

        # Extract content from paginated response
        file_content = ""
        if hasattr(content_response, 'data') and content_response.data:
            # Combine all content chunks from FileContentResponse objects
            content_parts = []
            for content_item in content_response.data:
                if hasattr(content_item, 'text'):
                    content_parts.append(content_item.text)
            file_content = "\n".join(content_parts)
        else:
            file_content = "No content available"

        # Use filename as title and create proper URL for citations
        filename = getattr(file_info, 'filename', f"Document {id}")

        result = FetchOutput(
            id=id,
            title=filename,
            text=file_content,
            url=f"https://platform.openai.com/storage/files/{id}",
        )

        # Add metadata if available from file info
        if hasattr(file_info, 'attributes') and file_info.attributes:
            result.metadata = dict(file_info.attributes)

        logger.info(f"Fetched vector store file: {id}")
        return result

    return mcp


def main():
    """Main function to start the MCP server."""
    # Verify OpenAI client is initialized
    if not openai_client:
        logger.error(
            "OpenAI API key not found. Please set OPENAI_API_KEY environment variable."
        )
        raise ValueError("OpenAI API key is required")

    logger.info(f"Using vector store: {VECTOR_STORE_ID}")

    # Create the MCP server
    server = create_server()

    # Configure and start the server
    logger.info("Starting MCP server on 0.0.0.0:8000")
    logger.info("Server will be accessible via SSE transport")

    try:
        # Use FastMCP's built-in run method with SSE transport
        server.run(transport="sse", host="0.0.0.0", port=8000)
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Server error: {e}")
        raise


if __name__ == "__main__":
    main()
```

Replit 设置

在 Replit 上，你需要在"Secrets"UI 中配置两个环境变量：

*   `OPENAI_API_KEY` - 你的标准 OpenAI API 密钥
*   `VECTOR_STORE_ID` - 可用于搜索的向量存储的唯一标识符 - 即你之前创建的那个。

在免费的 Replit 账户上，只要编辑器处于活动状态，服务器 URL 就会保持活动状态，因此在测试期间，你需要保持浏览器标签页打开。你可以通过点击链接图标获取 MCP 服务器的 URL：

![replit 配置](https://cdn.openai.com/API/docs/images/replit.png)

在长开发 URL 中，确保它以 `/sse/` 结尾，这是 MCP 服务器的服务器发送事件（流式）接口。这是你将用于在 ChatGPT 中连接应用并通过 API 调用它的 URL。Replit URL 示例如下：

```
https://777xxx.janeway.replit.dev/sse/
```

## 测试和连接你的 MCP 服务器

你可以[在提示词仪表板中](https://platform.openai.com/chat)使用深度研究模型测试你的 MCP 服务器。创建新提示词或编辑现有提示词，并在提示词配置中添加新的 MCP 工具。请记住，通过 API 用于深度研究的 MCP 服务器必须配置为无需审批。

如果你要在 ChatGPT 中将此服务器作为应用进行测试，请按照[从 ChatGPT 连接](/apps-sdk/deploy/connect-chatgpt)的说明操作。

![提示词配置](https://cdn.openai.com/API/docs/images/prompts_mcp.png)

配置好 MCP 服务器后，你可以通过提示词 UI 使用它与模型聊天。

![提示词聊天](https://cdn.openai.com/API/docs/images/chat_prompts_mcp.png)

你可以使用 Responses API 直接测试 MCP 服务器，请求如下：

```
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
  "model": "o4-mini-deep-research",
  "input": [
    {
      "role": "developer",
      "content": [
        {
          "type": "input_text",
          "text": "You are a research assistant that searches MCP servers to find answers to your questions."
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "Are cats attached to their homes? Give a succinct one page overview."
        }
      ]
    }
  ],
  "reasoning": {
    "summary": "auto"
  },
  "tools": [
    {
      "type": "mcp",
      "server_label": "cats",
      "server_url": "https://777ff573-9947-4b9c-8982-658fa40c7d09-00-3le96u7wsymx.janeway.replit.dev/sse/",
      "allowed_tools": [
        "search",
        "fetch"
      ],
      "require_approval": "never"
    }
  ]
}'
```

### 处理身份验证

作为构建自定义远程 MCP 服务器的开发者，授权和身份验证帮助你保护数据。我们建议在授权服务器支持 CIMD 且连接器创建者选择使用时，使用 OAuth 配合 [Client ID Metadata Documents](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization#client-id-metadata-documents) 进行客户端注册。ChatGPT 支持使用公共客户端令牌交换（`none`）或签名客户端断言令牌交换（`private_key_jwt`）的 CIMD。在配置时仍支持动态客户端注册。有关 ChatGPT 应用身份验证要求，请参阅[身份验证](/apps-sdk/build/auth)。有关协议详情，请阅读 [MCP 用户指南](https://modelcontextprotocol.io/docs/concepts/transports#authentication-and-authorization)或[授权规范](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization)。

如果你在 ChatGPT 中将自定义远程 MCP 服务器作为应用连接，工作区中的用户将获得到你应用程序的 OAuth 流程。

### 在 ChatGPT 中连接

1.  在 [ChatGPT 设置](https://chatgpt.com/#settings)中导入你的远程 MCP 服务器。
2.  在 **Apps & Connectors** 中使用你的服务器 URL 创建和配置应用。
3.  通过在聊天和深度研究中运行提示词来测试你的应用。

有关详细设置步骤，请参阅[从 ChatGPT 连接](/apps-sdk/deploy/connect-chatgpt)。

## 风险和安全

自定义 MCP 服务器使你能够将 ChatGPT 工作区连接到外部应用程序，这允许 ChatGPT 在这些应用程序中访问、发送和接收数据。请注意，自定义 MCP 服务器不是由 OpenAI 开发或验证的，它们是第三方服务，受其自身条款和条件约束。

如果你遇到恶意 MCP 服务器，请向 [security@openai.com](mailto:security@openai.com) 报告。

### 提示词注入相关风险

提示词注入是一种攻击形式，攻击者在我们的模型可能遇到的内容中嵌入恶意指令——例如网页——意图让这些指令覆盖 ChatGPT 的预期行为。如果模型遵从注入的指令，它可能会执行用户和开发者从未打算执行的操作——包括将私人数据发送到外部目的地。

例如，你可能要求 ChatGPT 通过检查日历和最近的电子邮件来为团体晚餐找一家餐厅。在研究过程中，它可能会遇到恶意评论——本质上是一段旨在欺骗代理执行非预期操作的有害内容——指示它从 Gmail 检索密码重置代码并将其发送到恶意网站。

以下是需要考虑的具体场景表。我们建议仔细查看此表，以帮助你决定是否使用自定义 MCP。

| 场景/风险 | 如果我信任 MCP 的开发者，是否安全？ | 我可以做什么来降低风险？ |
| --- | --- | --- |
| 攻击者可能以某种方式将提示词注入攻击插入到通过 MCP 可访问的数据中。<br><br>_示例：_<br>• 对于客户支持 MCP，攻击者可能向你发送包含提示词注入攻击的客户支持请求。 | 信任 MCP 的开发者并不能使其安全。<br><br>要使其安全，你需要信任 _MCP 中可访问的所有内容_。 | • 即使你信任 MCP 的开发者，如果 MCP 可能包含恶意或不受信任的用户输入，也不要使用该 MCP。<br>• 配置访问权限以最小化有权访问 MCP 的人数。 |
| 恶意 MCP 可能为读取或写入操作请求过多参数。<br><br>_示例：_<br>• 员工航班预订 MCP 可能暴露一个获取航班时刻表的读取操作，但请求的参数包括 `summaryOfConversation`、`userAnnualIncome`、`userHomeAddress`。 | 信任 MCP 的开发者不一定能使其安全。<br><br>MCP 的开发者可能认为请求某些数据是合理的，但你可能认为分享这些数据是不可接受的。 | • 在侧载 MCP 时，仔细审查每个操作请求的参数，确保没有隐私越权。 |
| 攻击者可能使用提示词注入攻击欺骗 ChatGPT 从自定义 MCP 获取敏感数据，然后发送给攻击者。<br><br>_示例：_<br>• 攻击者可能通过不同的 MCP（例如电子邮件）向企业用户之一发送提示词注入攻击，该攻击试图欺骗 ChatGPT 从某个内部工具 MCP 读取敏感数据，然后尝试将其泄露。 | 信任 MCP 的开发者并不能使其安全。<br><br>新 MCP 中的所有内容可能都是安全和可信的，因为风险在于这些数据被来自不同恶意来源的攻击窃取。 | • _ChatGPT 旨在保护用户_，但攻击者可能试图窃取你的数据，因此请注意风险并考虑承担该风险是否合理。<br>• 配置访问权限以最小化有权访问包含特别敏感数据的 MCP 的人数。 |
| 攻击者可能使用提示词注入攻击通过自定义 MCP 的写入操作泄露敏感信息。<br><br>_示例：_<br>• 攻击者使用提示词注入攻击（通过不同的 MCP）欺骗 ChatGPT 获取敏感数据，然后通过欺骗 ChatGPT 使用客户支持系统的 MCP 将其发送给攻击者来泄露数据。 | 信任 MCP 的开发者并不能使其安全。<br><br>即使你完全信任 MCP，如果写入操作有任何可被攻击者观察到的后果，他们可能会试图利用它。 | • 用户应在写入操作发生时仔细审查（确保它们是预期的，并且不包含不应共享的数据）。 |
| 攻击者可能使用提示词注入攻击通过恶意自定义 MCP 的读取操作泄露敏感信息（因为这些操作可以被 MCP 记录）。 | 此攻击仅在 MCP 是恶意的，或 MCP 错误地将写入操作标记为读取操作时才有效。<br><br>如果你信任 MCP 的开发者会正确地仅将读取操作标记为 _读取_，并信任该开发者不会试图窃取数据，那么此风险可能很小。 | • 仅使用你信任的开发者的 MCP（但请注意，这不足以使其安全）。 |
| 攻击者可能使用提示词注入攻击欺骗 ChatGPT 通过自定义 MCP 执行用户未打算的有害或破坏性写入操作。 | 信任 MCP 的开发者并不能使其安全。<br><br>新 MCP 中的所有内容可能都是安全和可信的，但此风险仍然存在，因为攻击来自不同的恶意来源。 | • 用户应仔细审查写入操作，确保它们是预期的和正确的。<br>• ChatGPT 旨在保护用户，但攻击者可能试图欺骗 ChatGPT 执行非预期的写入操作。<br>• 配置访问权限以最小化有权访问包含特别敏感数据的 MCP 的人数。 |

### 非提示词注入相关风险

自定义 MCP 还存在与提示词注入攻击无关的额外风险：

*   **写入操作可以增加 MCP 服务器的实用性和风险**，因为它们使服务器能够执行潜在的破坏性操作，而不仅仅是向 ChatGPT 提供信息。ChatGPT 目前要求在任何对话中执行写入操作之前进行手动确认。确认将标记潜在的敏感数据，但你应该仅在仔细考虑并接受 ChatGPT 可能在此类操作中犯错的可能性的情况下使用写入操作。即使 MCP 服务器已将操作标记为只读，写入操作仍可能发生，这使得在将自定义 MCP 服务器部署到 ChatGPT 之前信任它变得更加重要。
*   **任何 MCP 服务器都可能在查询过程中接收敏感数据**。即使服务器不是恶意的，它也可以访问 ChatGPT 在交互过程中提供的任何数据，可能包括用户之前提供给 ChatGPT 的敏感数据。例如，当 ChatGPT 使用深度研究或聊天应用工具时，此类数据可能包含在 ChatGPT 发送给 MCP 服务器的查询中。

### 连接到受信任的服务器

我们建议你不要连接到自定义 MCP 服务器，除非你了解并信任底层应用程序。

例如，始终选择由服务提供商自己托管的官方服务器（例如，连接到 Stripe 自己在 mcp.stripe.com 上托管的 Stripe 服务器，而不是由第三方托管的非官方 Stripe MCP 服务器）。由于目前官方 MCP 服务器不多，你可能会想使用由不运营该服务器的组织托管的 MCP 服务器，该服务器只是通过 API 代理对该服务的请求。这是不推荐的——你应该仅在仔细审查了他们如何使用你的数据并验证你可以信任该服务器之后才连接到 MCP。在构建和连接到你自己的 MCP 服务器时，请仔细检查它是否是正确的服务器。对于你响应 MCP 服务器请求时提供的数据，以及作为 OpenAI 调用你的 MCP 服务器的一部分发送给你的数据的处理方式，都要非常谨慎。

你的远程 MCP 服务器允许其他人将 OpenAI 连接到你的服务，并允许 OpenAI 在这些服务中访问、发送和接收数据以及执行操作。避免在工具的 JSON 中放入任何敏感信息，并避免存储访问你远程 MCP 服务器的 ChatGPT 用户的任何敏感信息。

作为 MCP 服务器的构建者，不要在工具定义中放入任何恶意内容。
