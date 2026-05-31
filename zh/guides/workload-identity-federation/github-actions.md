
使用 GitHub Actions 作为工作负载身份提供者，通过将 GitHub 签发的 OIDC 令牌交换为短期 OpenAI 访问令牌。这使得工作流无需在 GitHub secrets 中存储长期 API 密钥即可向 OpenAI API 进行身份验证。

GitHub 可以为具有 `id-token: write` 权限并请求身份令牌的工作流作业铸造签名的 OIDC JWT。OpenAI 在签发 OpenAI 访问令牌之前会验证令牌的签发者、受众、签名和映射属性。

## 设置 GitHub Actions

授予工作流或作业请求 GitHub OIDC 令牌的权限：

```
permissions:
  id-token: write
  contents: read
```

`id-token: write` 权限允许作业请求 OIDC JWT。它不会授予对仓库内容的写入权限。`contents: read` 权限是 `actions/checkout` 所需的。

使用在 OpenAI 工作负载身份提供者中配置的确切受众来请求令牌。自定义 JavaScript actions 可以调用 `core.getIDToken("your-wif-audience")`；shell 步骤可以直接调用 GitHub 的 OIDC 请求 URL。包含保留 URL 字符的受众值（如 `https://api.openai.com/v1`）在附加到请求 URL 之前应进行 URL 编码：

```
AUDIENCE="https://api.openai.com/v1"
ENCODED_AUDIENCE=$(jq -rn --arg audience "$AUDIENCE" '$audience | @uri')

TOKEN=$(curl -sSf -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" \
  "${ACTIONS_ID_TOKEN_REQUEST_URL}&audience=${ENCODED_AUDIENCE}" | jq -r .value)
```

重要的 GitHub OIDC 声明包括：

*   `iss`：令牌签发者。对于 GitHub Actions，值为 `https://token.actions.githubusercontent.com`。
*   `aud`：工作流请求的受众值。配置 OpenAI 要求与您请求的完全相同的值，例如 `your-wif-audience` 或 `https://api.openai.com/v1`。
*   `sub`：主要主题字符串。GitHub 根据工作流元数据（如仓库、分支、标签、拉取请求或环境）构建它。
*   `repository`：运行工作流的仓库，例如 `my-org/my-repo`。
*   `repository_owner`：拥有仓库的组织或用户，例如 `my-org`。
*   `ref`：触发工作流的 Git 引用，例如 `refs/heads/main` 或 `refs/tags/v1.0.0`。
*   `workflow`：工作流声明。使用 GitHub 发出的实际声明值，例如如果作业中的工作流声明是 `deploy`，则使用 `deploy`。
*   `workflow_ref`：工作流文件路径和引用，例如 `my-org/my-repo/.github/workflows/deploy.yml@refs/heads/main`。
*   `environment`：GitHub 环境名称，例如 `production`，当作业使用环境时。
*   `run_id`、`run_number`、`run_attempt` 和 `job_workflow_ref`：运行和作业标识符，可用于审计或更高级的信任规则。

有关完整的声明列表和主题格式，请参阅 GitHub 的 [OpenID Connect 参考文档](https://docs.github.com/en/actions/reference/security/oidc)。

## 验证令牌

在配置工作负载身份联合之前，在工作流运行器中解码示例 GitHub OIDC 令牌并检查其声明。在工作流步骤中请求令牌后：

```text
TOKEN="$TOKEN" python3 - <<'PY'
import base64
import json
import os

payload = os.environ["TOKEN"].split(".")[1]
payload += "=" * (-len(payload) % 4)
print(json.dumps(json.loads(base64.urlsafe_b64decode(payload)), indent=2))
PY
```

此命令解码 JWT 负载而不验证令牌签名。对生产令牌使用本地解码器，避免将生产令牌粘贴到第三方工具中。切勿记录原始 GitHub OIDC 令牌或交换后的 OpenAI 访问令牌。

解码后的 GitHub Actions OIDC 令牌类似于：

```
{
  "iss": "https://token.actions.githubusercontent.com",
  "aud": "https://api.openai.com/v1",
  "sub": "repo:my-org/my-repo:environment:production",
  "repository": "my-org/my-repo",
  "repository_owner": "my-org",
  "ref": "refs/heads/main",
  "workflow": "deploy",
  "workflow_ref": "my-org/my-repo/.github/workflows/deploy.yml@refs/heads/main",
  "environment": "production",
  "run_id": "1234567890",
  "run_attempt": "1"
}
```

使用解码后的负载将您收到的令牌与 OpenAI 中配置的签发者、受众和映射值进行比较。大多数配置问题在交换令牌之前就可以在 `iss`、`aud`、`repository`、`ref` 和 `workflow_ref` 声明中看到。

## 设置工作负载身份联合

在 OpenAI 中为 GitHub Actions 创建工作负载身份提供者，然后添加与您信任的 GitHub 工作流声明匹配的服务账户映射。

首先配置工作负载身份提供者，然后创建服务账户映射。

### 设置工作负载身份提供者

1.  **创建工作负载身份提供者。** 将 **Name** 设置为唯一值，例如 `github-actions-prod`。使用 **Description**（例如 `Production GitHub Actions workflows`）帮助管理员识别提供者。
    
2.  **设置签发者和受众。** 将 **OIDC Issuer URL** 设置为 `https://token.actions.githubusercontent.com`。将 **Audience** 设置为工作流请求的确切受众，例如 `your-wif-audience` 或 `https://api.openai.com/v1`。
    
3.  **使用 GitHub OIDC 发现。** 保持 **Use uploaded JWKS for token verification** 禁用。OpenAI 使用 GitHub 的 OIDC 发现元数据和 JWKS 来验证 GitHub 签名的令牌。
    
4.  **仅在需要派生映射属性时添加属性转换。** 原始 GitHub 声明（如 `repository`、`ref` 和 `workflow`）可以直接在映射断言中使用。如果您创建派生属性，仪表板会自动添加 `openai.` 前缀；例如，输入 `github_repository` 并设置表达式 `assertion.repository` 将创建 `openai.github_repository`。已经以 `openai.` 开头的原始令牌声明将被忽略用于 `openai.` 映射键，除非配置了匹配的转换。
    

### 设置服务账户映射

1.  **创建服务账户映射。** 将 **Name** 设置为工作负载身份提供者内的唯一值，例如 `github-actions-main-deploy`。使用 **Description**（例如 `Production deploy workflow on main`）来说明哪个工作流可以使用该映射。
    
2.  **添加精确声明断言。** 为每个必须匹配的 GitHub 声明添加一个 **Key** 和 **Value** 行。OpenAI 要求每个配置的行都匹配后才会签发访问令牌。对于生产部署工作流，使用如下断言：
    
    ```
    iss == "https://token.actions.githubusercontent.com"
    aud == "https://api.openai.com/v1"
    repository == "my-org/my-repo"
    ref == "refs/heads/main"
    workflow_ref == "my-org/my-repo/.github/workflows/deploy.yml@refs/heads/main"
    ```
    
    对于特权映射，优先使用 `workflow_ref` 而非 `workflow`，因为管理员通常打算信任特定的工作流文件路径和引用。工作流名称可以被重命名，多个工作流文件可以共享相同的名称。
    
    在映射 UI 中，将这些作为键/值行输入，例如 **Key** `repository` 对应 **Value** `my-org/my-repo`，**Key** `ref` 对应 **Value** `refs/heads/main`，**Key** `workflow_ref` 对应 **Value** `my-org/my-repo/.github/workflows/deploy.yml@refs/heads/main`。如果作业使用 GitHub 环境，还需添加 **Key** `environment` 对应 **Value** `production`。
    
    > **注意：** 避免过于宽泛的映射，例如仅信任 `repository_owner == "my-org"`，除非该所有者命名空间中的每个仓库都应该能够铸造 OpenAI 访问令牌。
    
3.  **选择 OpenAI 目标。** 将 **Project** 设置为拥有目标服务账户的 OpenAI 项目。将 **Service account** 设置为 GitHub 工作流可以使用的 OpenAI 服务账户，例如 `github-actions-prod-deploy`。
    
4.  **根据需要缩小 API 权限。** 选择适当的 **Permissions**（如 `api.model.request` 和 `api.vector_store.read`）以进一步缩小从此映射铸造的访问令牌的范围。将权限留空以避免添加 WIF 特定的范围限制；令牌仍然以映射的服务账户身份进行授权。
    

## 在工作流中使用令牌

配置您的 OpenAI SDK 客户端以请求 GitHub OIDC 令牌并将其交换为 OpenAI 签发的访问令牌。

工作流必须授予 `id-token: write` 权限，并将工作负载身份联合设置传递给 SDK 代码。SDK 从 GitHub 暴露给作业的 `ACTIONS_ID_TOKEN_REQUEST_URL` 和 `ACTIONS_ID_TOKEN_REQUEST_TOKEN` 环境变量请求 GitHub OIDC 令牌，然后使用交换后的 OpenAI 访问令牌对 API 请求进行身份验证。

例如，从如下工作流运行您的应用程序代码：

```
name: deploy

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Run OpenAI SDK code
        env:
          OPENAI_WIF_AUDIENCE: $\{\{ vars.OPENAI_WIF_AUDIENCE \}\}
          OPENAI_IDENTITY_PROVIDER_ID: $\{\{ vars.OPENAI_IDENTITY_PROVIDER_ID \}\}
          OPENAI_SERVICE_ACCOUNT_ID: $\{\{ vars.OPENAI_SERVICE_ACCOUNT_ID \}\}
        run: node ./scripts/call-openai.js
```

将 `OPENAI_WIF_AUDIENCE`、`OPENAI_IDENTITY_PROVIDER_ID` 和 `OPENAI_SERVICE_ACCOUNT_ID` 存储为 GitHub Actions 变量。它们用于标识提供者和服务账户，但不是持有者凭证。

以下示例使用自定义主题令牌提供者初始化 OpenAI 客户端。该提供者为配置的受众请求 GitHub OIDC 令牌，并将其用作工作负载身份联合的主题令牌。

**从 GitHub Actions OIDC 令牌进行身份验证**

::: code-group
```typescript
import OpenAI from "openai";
import type { SubjectTokenProvider } from "openai/auth";

const identityProviderId = process.env.OPENAI_IDENTITY_PROVIDER_ID;
const serviceAccountId = process.env.OPENAI_SERVICE_ACCOUNT_ID;
const audience = process.env.OPENAI_WIF_AUDIENCE;
const requestURL = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
const requestToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;

if (
  !identityProviderId ||
  !serviceAccountId ||
  !audience ||
  !requestURL ||
  !requestToken
) {
  throw new Error(
    "Set OPENAI_IDENTITY_PROVIDER_ID, OPENAI_SERVICE_ACCOUNT_ID, OPENAI_WIF_AUDIENCE, and run inside GitHub Actions with id-token: write"
  );
}

function githubActionsOIDCTokenProvider(
  requestURL: string,
  requestToken: string,
  audience: string
): SubjectTokenProvider {
  return {
    tokenType: "jwt",
    getToken: async () => {
      const url = new URL(requestURL);
      url.searchParams.set("audience", audience);

      const response = await fetch(url, {
        headers: { Authorization: `bearer ${requestToken}` },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to request GitHub OIDC token: ${response.status} ${response.statusText}`
        );
      }

      const body = (await response.json()) as { value?: string };
      if (!body.value) {
        throw new Error("GitHub OIDC token response did not include a value.");
      }

      return body.value;
    },
  };
}

const client = new OpenAI({
  workloadIdentity: {
    identityProviderId,
    serviceAccountId,
    provider: githubActionsOIDCTokenProvider(requestURL, requestToken, audience),
  },
});

const response = await client.responses.create({
  model: "gpt-4.1-mini",
  input: "Say hello from GitHub Actions workload identity federation.",
});

console.log(response.output_text);
```

```python
import json
import os
import urllib.parse
import urllib.request

from openai import OpenAI
from openai.auth import SubjectTokenProvider


def github_actions_oidc_token_provider(audience: str) -> SubjectTokenProvider:
    request_url = os.environ["ACTIONS_ID_TOKEN_REQUEST_URL"]
    request_token = os.environ["ACTIONS_ID_TOKEN_REQUEST_TOKEN"]

    def get_token() -> str:
        parsed_url = urllib.parse.urlparse(request_url)
        query = dict(urllib.parse.parse_qsl(parsed_url.query, keep_blank_values=True))
        query["audience"] = audience
        url = urllib.parse.urlunparse(
            parsed_url._replace(query=urllib.parse.urlencode(query))
        )

        request = urllib.request.Request(
            url,
            headers={"Authorization": f"bearer {request_token}"},
        )
        with urllib.request.urlopen(request) as response:
            payload = json.loads(response.read().decode("utf-8"))

        token = payload.get("value")
        if not token:
            raise RuntimeError("GitHub OIDC token response did not include a value.")
        return token

    return {"token_type": "jwt", "get_token": get_token}


client = OpenAI(
    workload_identity={
        "identity_provider_id": os.environ["OPENAI_IDENTITY_PROVIDER_ID"],
        "service_account_id": os.environ["OPENAI_SERVICE_ACCOUNT_ID"],
        "provider": github_actions_oidc_token_provider(
            os.environ["OPENAI_WIF_AUDIENCE"]
        ),
    },
)

response = client.responses.create(
    model="gpt-4.1-mini",
    input="Say hello from GitHub Actions workload identity federation.",
)

print(response.output_text)
```

:::
```go
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/auth"
	"github.com/openai/openai-go/v3/option"
	"github.com/openai/openai-go/v3/responses"
)

type githubActionsOIDCTokenProvider struct {
	requestURL   string
	requestToken string
	audience     string
}

func (p githubActionsOIDCTokenProvider) TokenType() auth.SubjectTokenType {
	return auth.SubjectTokenTypeJWT
}

func (p githubActionsOIDCTokenProvider) GetToken(ctx context.Context, httpClient auth.HTTPDoer) (string, error) {
	if httpClient == nil {
		httpClient = http.DefaultClient
	}

	oidcURL, err := url.Parse(p.requestURL)
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "github-actions",
			Message:  "failed to parse GitHub OIDC request URL",
			Cause:    err,
		}
	}
	query := oidcURL.Query()
	query.Set("audience", p.audience)
	oidcURL.RawQuery = query.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, oidcURL.String(), nil)
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "github-actions",
			Message:  "failed to create GitHub OIDC token request",
			Cause:    err,
		}
	}
	req.Header.Set("Authorization", "bearer "+p.requestToken)

	resp, err := httpClient.Do(req)
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "github-actions",
			Message:  "failed to request GitHub OIDC token",
			Cause:    err,
		}
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", &auth.SubjectTokenProviderError{
			Provider: "github-actions",
			Message:  fmt.Sprintf("GitHub OIDC token request failed with status %s", resp.Status),
		}
	}

	var body struct {
		Value string `json:"value"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "github-actions",
			Message:  "failed to decode GitHub OIDC token response",
			Cause:    err,
		}
	}
	if body.Value == "" {
		return "", &auth.SubjectTokenProviderError{
			Provider: "github-actions",
			Message:  "GitHub OIDC token response did not include a value",
		}
	}

	return body.Value, nil
}

func main() {
	client := openai.NewClient(
		option.WithWorkloadIdentity(auth.WorkloadIdentity{
			IdentityProviderID: os.Getenv("OPENAI_IDENTITY_PROVIDER_ID"),
			ServiceAccountID:   os.Getenv("OPENAI_SERVICE_ACCOUNT_ID"),
			Provider: githubActionsOIDCTokenProvider{
				requestURL:   os.Getenv("ACTIONS_ID_TOKEN_REQUEST_URL"),
				requestToken: os.Getenv("ACTIONS_ID_TOKEN_REQUEST_TOKEN"),
				audience:     os.Getenv("OPENAI_WIF_AUDIENCE"),
			},
		}),
	)

	response, err := client.Responses.New(context.Background(), responses.ResponseNewParams{
		Model: openai.ChatModelGPT4_1Mini,
		Input: responses.ResponseNewParamsInputUnion{
			OfString: openai.String("Say hello from GitHub Actions workload identity federation."),
		},
	})
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(response.OutputText())
}
```
```java
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.openai.auth.SubjectTokenProvider;
import com.openai.errors.SubjectTokenProviderException;
import com.openai.auth.SubjectTokenType;
import com.openai.auth.WorkloadIdentity;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.ChatModel;
import com.openai.models.responses.ResponseCreateParams;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CompletableFuture;

public final class GitHubActionsWorkloadIdentityExample {
    private GitHubActionsWorkloadIdentityExample() {}

    static final class GitHubActionsOidcTokenProvider implements SubjectTokenProvider {
        private final String requestUrl;
        private final String requestToken;
        private final String audience;

        GitHubActionsOidcTokenProvider(String requestUrl, String requestToken, String audience) {
            this.requestUrl = requestUrl;
            this.requestToken = requestToken;
            this.audience = audience;
        }

        @Override
        public SubjectTokenType tokenType() {
            return SubjectTokenType.JWT;
        }

        @Override
        public String getToken(
                com.openai.core.http.HttpClient httpClient, JsonMapper jsonMapper) {
            try {
                String separator = requestUrl.contains("?") ? "&" : "?";
                URI uri = URI.create(
                        requestUrl
                                + separator
                                + "audience="
                                + URLEncoder.encode(audience, StandardCharsets.UTF_8));

                HttpRequest request = HttpRequest.newBuilder(uri)
                        .header("Authorization", "bearer " + requestToken)
                        .GET()
                        .build();

                HttpResponse&lt;String> response = java.net.http.HttpClient.newHttpClient()
                        .send(request, HttpResponse.BodyHandlers.ofString());

                if (response.statusCode() < 200 || response.statusCode() >= 300) {
                    throw new SubjectTokenProviderException(
                            "github-actions",
                            "GitHub OIDC token request failed with status "
                                    + response.statusCode(),
                            null);
                }

                JsonNode payload = jsonMapper.readTree(response.body());
                String token = payload.path("value").asText("");
                if (token.isEmpty()) {
                    throw new SubjectTokenProviderException(
                            "github-actions",
                            "GitHub OIDC token response did not include a value",
                            null);
                }

                return token;
            } catch (SubjectTokenProviderException e) {
                throw e;
            } catch (Exception e) {
                throw new SubjectTokenProviderException(
                        "github-actions",
                        "failed to request GitHub OIDC token",
                        e);
            }
        }

        @Override
        public CompletableFuture&lt;String> getTokenAsync(
                com.openai.core.http.HttpClient httpClient, JsonMapper jsonMapper) {
            return CompletableFuture.supplyAsync(() -> getToken(httpClient, jsonMapper));
        }
    }

    public static void main(String[] args) {
        WorkloadIdentity workloadIdentity = WorkloadIdentity.builder()
                .identityProviderId(System.getenv("OPENAI_IDENTITY_PROVIDER_ID"))
                .serviceAccountId(System.getenv("OPENAI_SERVICE_ACCOUNT_ID"))
                .provider(new GitHubActionsOidcTokenProvider(
                        System.getenv("ACTIONS_ID_TOKEN_REQUEST_URL"),
                        System.getenv("ACTIONS_ID_TOKEN_REQUEST_TOKEN"),
                        System.getenv("OPENAI_WIF_AUDIENCE")))
                .build();

        OpenAIClient client = OpenAIOkHttpClient.builder()
                .workloadIdentity(workloadIdentity)
                .build();

        ResponseCreateParams params = ResponseCreateParams.builder()
                .model(ChatModel.GPT_4_1_MINI)
                .input("Say hello from GitHub Actions workload identity federation.")
                .build();

        client.responses().create(params).output().stream()
                .flatMap(item -> item.message().stream())
                .flatMap(message -> message.content().stream())
                .flatMap(content -> content.outputText().stream())
                .forEach(outputText -> System.out.println(outputText.text()));
    }
}
```
```ruby
require "json"
require "net/http"
require "openai"
require "uri"

class GitHubActionsOIDCTokenProvider
  include OpenAI::Auth::SubjectTokenProvider

  def initialize(request_url:, request_token:, audience:)
    @request_url = request_url
    @request_token = request_token
    @audience = audience
  end

  def token_type
    OpenAI::Auth::TokenType::JWT
  end

  def get_token
    uri = URI(@request_url)
    params = URI.decode_www_form(uri.query || "")
    params.reject! { |key, _| key == "audience" }
    params << ["audience", @audience]
    uri.query = URI.encode_www_form(params)

    request = Net::HTTP::Get.new(uri)
    request["Authorization"] = "bearer #{@request_token}"

    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == "https") do |http|
      http.request(request)
    end

    unless response.is_a?(Net::HTTPSuccess)
      raise OpenAI::Errors::SubjectTokenProviderError.new(
        message: "GitHub OIDC token request failed with status #{response.code}",
        provider: "github-actions"
      )
    end

    token = JSON.parse(response.body).fetch("value", "").to_s
    if token.empty?
      raise OpenAI::Errors::SubjectTokenProviderError.new(
        message: "GitHub OIDC token response did not include a value",
        provider: "github-actions"
      )
    end

    token
  rescue JSON::ParserError, SystemCallError => e
    raise OpenAI::Errors::SubjectTokenProviderError.new(
      message: "Failed to request GitHub OIDC token: #{e.message}",
      provider: "github-actions",
      cause: e
    )
  end
end

provider = GitHubActionsOIDCTokenProvider.new(
  request_url: ENV.fetch("ACTIONS_ID_TOKEN_REQUEST_URL"),
  request_token: ENV.fetch("ACTIONS_ID_TOKEN_REQUEST_TOKEN"),
  audience: ENV.fetch("OPENAI_WIF_AUDIENCE")
)

workload_identity = OpenAI::Auth::WorkloadIdentity.new(
  identity_provider_id: ENV.fetch("OPENAI_IDENTITY_PROVIDER_ID"),
  service_account_id: ENV.fetch("OPENAI_SERVICE_ACCOUNT_ID"),
  provider: provider
)

client = OpenAI::Client.new(workload_identity: workload_identity)

response = client.responses.create(
  model: "gpt-4.1-mini",
  input: "Say hello from GitHub Actions workload identity federation."
)

puts(response.output_text)
```

## GitHub Actions 最佳实践

*   对生产部署使用环境保护。在工作流可以访问生产 OpenAI 资源之前，要求审批或分支限制。
*   按仓库限制映射。尽可能匹配特定于仓库的声明，而不是允许组织内所有仓库的访问。
*   按分支或工作流限制映射。考虑匹配 `repository`、`ref`、`environment` 或 `workflow_ref` 等声明以限制令牌签发。
*   为 CI/CD 和生产工作负载使用单独的 OpenAI 服务账户。构建管道通常需要与已部署应用程序不同的权限。
*   避免向来自不受信任 fork 的拉取请求授予访问权限。fork 的拉取请求可能执行攻击者控制的代码，不应接收生产凭证。
*   使用短期交换。GitHub OIDC 令牌旨在用于临时身份验证，应仅在需要时进行交换。
*   审计仓库所有权变更。仓库转移、重命名和权限变更可能影响现有映射背后的安全假设。
*   优先使用精确声明匹配。匹配 `repository`、`ref` 和 `environment` 等声明，而不是依赖组织范围的信任关系。
