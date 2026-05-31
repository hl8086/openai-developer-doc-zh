
通过将 Kubernetes 投射的服务账户令牌交换为短期 OpenAI 访问令牌，将 Kubernetes 用作工作负载身份提供者。

## 设置 Kubernetes

本指南假设已启用 Kubernetes 服务账户令牌投射功能，该功能在现代 Kubernetes 版本中默认可用。OpenAI 工作负载身份联合需要兼容 OIDC 的投射服务账户令牌。不支持存储在 Secrets 中的旧版 Kubernetes 服务账户令牌。

为需要调用 OpenAI API 的工作负载使用 Kubernetes `ServiceAccount`。如果还没有，请创建一个：

```
kubectl create serviceaccount openai-wif --namespace default
```

获取 Kubernetes 集群的 OIDC 签发者：

```
kubectl get --raw /.well-known/openid-configuration | jq -r .issuer
```

即使你上传了 JWKS 且 OpenAI 不会对 OIDC 签发者执行 JWKS 发现，此签发者也必须与工作负载身份提供者中配置的签发者匹配。

获取集群 JWKS 并保存返回的密钥集。配置工作负载身份提供者时需要用到它：

```
kubectl get --raw /openid/v1/jwks
```

为投射的服务账户令牌配置 OpenAI 期望的受众和适合你工作负载的过期时间。OpenAI 会验证令牌的签发者、签名、受众和过期时间。在此示例中，令牌文件挂载在 `/var/run/secrets/tokens/token`，使用受众 `https://api.openai.com/v1`，并在 3600 秒后过期。如果投射令牌的受众与 OpenAI 工作负载身份提供者的受众匹配，你可以使用不同的受众：

```
apiVersion: v1
kind: Pod
metadata:
  name: openai-wif-app
  namespace: default
spec:
  serviceAccountName: openai-wif
  containers:
    - name: app
      image: my-image
      volumeMounts:
        - name: ksa-token
          mountPath: /var/run/secrets/tokens
          readOnly: true
  volumes:
    - name: ksa-token
      projected:
        sources:
          - serviceAccountToken:
              path: token
              audience: "https://api.openai.com/v1"
              expirationSeconds: 3600
```

## 验证令牌

在配置工作负载身份联合之前，在本地解码一个示例投射服务账户令牌并检查其声明。从挂载了投射令牌的运行中 Pod 执行：

```text
TOKEN=$(kubectl exec -n default openai-wif-app -- cat /var/run/secrets/tokens/token)

TOKEN="$TOKEN" python3 - <<'PY'
import base64
import json
import os

payload = os.environ["TOKEN"].split(".")[1]
payload += "=" * (-len(payload) % 4)
print(json.dumps(json.loads(base64.urlsafe_b64decode(payload)), indent=2))
PY
```

此命令在不验证令牌签名的情况下解码 JWT 载荷。对生产令牌使用本地解码器，避免将生产令牌粘贴到第三方工具中。

解码后的 Kubernetes 投射服务账户令牌类似于：

```
{
  "iss": "https://kubernetes.example.com",
  "aud": ["https://api.openai.com/v1"],
  "sub": "system:serviceaccount:default:openai-wif",
  "iat": 1716235422,
  "exp": 1716239022,
  "kubernetes.io": {
    "namespace": "default",
    "serviceaccount": {
      "name": "openai-wif",
      "uid": "11111111-2222-3333-4444-555555555555"
    }
  }
}
```

使用解码后的载荷将你收到的令牌与 OpenAI 中配置的签发者、受众和映射值进行比较。大多数配置问题在交换令牌之前就可以在 `iss`、`aud` 和 `sub` 声明中看到。

## 设置工作负载身份联合

在 OpenAI 中为 Kubernetes 签发者创建工作负载身份提供者，然后添加与投射令牌中属性匹配的服务账户映射。

首先配置工作负载身份提供者，然后创建服务账户映射。

### 设置工作负载身份提供者

1.  **创建工作负载身份提供者。** 将 **Name** 设置为唯一值，例如 `kubernetes-prod`。使用 **Description**，例如 `Production Kubernetes cluster`，帮助管理员识别集群。
    
2.  **设置签发者和受众。** 将 **OIDC Issuer URL** 设置为 `kubectl get --raw /.well-known/openid-configuration | jq -r .issuer` 返回的签发者。此值必须与投射令牌中的 `iss` 声明匹配。将 **Audience** 设置为投射服务账户令牌卷上配置的相同不透明受众字符串。在此示例中，该值为 `https://api.openai.com/v1`。
    
3.  **上传 Kubernetes JWKS。** 启用 **Use uploaded JWKS for token verification**，然后将 **JWKS JSON** 设置为 `kubectl get --raw /openid/v1/jwks` 的输出。OpenAI 使用此公钥集来验证投射的 Kubernetes 服务账户令牌。上传完整的密钥集，包括外层的 `keys`。
    
    > **注意：** 对于自托管 Kubernetes 集群，OpenAI 仅支持本地 JWKS 模式。上传集群返回的 JWKS；OpenAI 不会对配置的签发者执行 OIDC 发现。OpenAI 仍会将配置的签发者与令牌中的 `iss` 字段进行比较。
    
    如果你的集群轮换服务账户签名密钥，请更新工作负载身份提供者配置中上传的 JWKS。由不在已配置 JWKS 中的密钥签名的令牌将被拒绝。如果 JWKS 包含多个活跃的公钥，请包含完整的 `keys` 数组。
    
4.  **仅在需要派生映射属性时添加属性转换。** 原始令牌声明如 `sub`、`aud` 和 `iss` 可以直接在映射断言中使用。如果你计划匹配转换后的属性而非原始令牌声明，仪表板会自动添加 `openai.` 前缀；例如，输入 `workload_subject` 并设置表达式 `assertion.sub` 将创建 `openai.workload_subject`。已以 `openai.` 开头的原始令牌声明在 `openai.` 映射键中会被忽略，除非配置了匹配的转换。
    

### 设置服务账户映射

1.  **创建服务账户映射。** 将 **Name** 设置为工作负载身份提供者内的唯一值，例如 `openai-mapping-kubernetes`。使用 **Description**，例如 `Workload Identity Provider Mapping for Kubernetes Workloads`，说明哪个工作负载可以使用该映射。
    
2.  **匹配 Kubernetes 服务账户主体。** 将 **Key** 设置为 `sub`，将 **Value** 设置为 `system:serviceaccount:default:openai-wif`。对于 Kubernetes 服务账户，主体格式为 `system:serviceaccount:`&lt;namespace>`:`&lt;service-account-name>``。
    
3.  **选择 OpenAI 目标。** 将 **Project** 设置为拥有目标服务账户的 OpenAI 项目。将 **Service account** 设置为 Kubernetes 工作负载可以使用的 OpenAI 服务账户，例如 `kubernetes-prod-openai-wif`。如果希望为此映射创建新的服务账户而非复用现有的，请勾选 `Create a new service account in this project`。
    
4.  **根据需要缩小 API 权限。** 选择适当的 **Permissions**，例如 `api.model.request` 和 `api.vector_store.read`，以进一步缩小从此映射铸造的访问令牌的范围。将权限留空以避免添加 WIF 特定的范围限制；令牌仍以映射的服务账户身份进行授权。
    

## 在代码中使用令牌

配置 OpenAI SDK 客户端以读取投射的 Kubernetes 令牌并将其交换为 OpenAI 签发的访问令牌。

使用挂载的令牌路径（例如 `/var/run/secrets/tokens/token`）作为 SDK 工作负载身份联合提供者的主体令牌源。SDK 将该 Kubernetes 令牌交换为 OpenAI 签发的访问令牌，并使用 OpenAI 令牌对 API 请求进行身份验证。

以下示例使用自定义主体令牌提供者初始化 OpenAI 客户端。该提供者从挂载的文件路径读取投射的 Kubernetes 服务账户令牌，并将其用作工作负载身份联合的主体令牌。

**从 Kubernetes 投射的服务账户令牌进行身份验证**

```
import { readFile } from "node:fs/promises";
import OpenAI from "openai";
import type { SubjectTokenProvider } from "openai/auth";

const tokenPath = "/var/run/secrets/tokens/token";
const identityProviderId = process.env.OPENAI_IDENTITY_PROVIDER_ID;
const serviceAccountId = process.env.OPENAI_SERVICE_ACCOUNT_ID;

if (!identityProviderId || !serviceAccountId) {
  throw new Error("Set OPENAI_IDENTITY_PROVIDER_ID and OPENAI_SERVICE_ACCOUNT_ID");
}

function mountedServiceAccountTokenProvider(path: string): SubjectTokenProvider {
  return {
    tokenType: "jwt",
    getToken: async () => {
      const token = (await readFile(path, "utf8")).trim();
      if (!token) {
        throw new Error("The mounted service account token file is empty.");
      }
      return token;
    },
  };
}

const client = new OpenAI({
  workloadIdentity: {
    identityProviderId,
    serviceAccountId,
    provider: mountedServiceAccountTokenProvider(tokenPath),
  },
});

const response = await client.responses.create({
  model: "gpt-4.1-mini",
  input: "Say hello from Kubernetes workload identity federation.",
});

console.log(response.output_text);
```

```
import os
from pathlib import Path

from openai import OpenAI
from openai.auth import SubjectTokenProvider

TOKEN_PATH = "/var/run/secrets/tokens/token"


def mounted_service_account_token_provider(token_path: str) -> SubjectTokenProvider:
    def get_token() -> str:
        token = Path(token_path).read_text().strip()
        if not token:
            raise RuntimeError("The mounted service account token file is empty.")
        return token

    return {"token_type": "jwt", "get_token": get_token}


client = OpenAI(
    workload_identity={
        "identity_provider_id": os.environ["OPENAI_IDENTITY_PROVIDER_ID"],
        "service_account_id": os.environ["OPENAI_SERVICE_ACCOUNT_ID"],
        "provider": mounted_service_account_token_provider(TOKEN_PATH),
    },
)

response = client.responses.create(
    model="gpt-4.1-mini",
    input="Say hello from Kubernetes workload identity federation.",
)

print(response.output_text)
```

```
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/auth"
	"github.com/openai/openai-go/v3/option"
	"github.com/openai/openai-go/v3/responses"
)

const tokenPath = "/var/run/secrets/tokens/token"

type mountedServiceAccountTokenProvider struct {
	path string
}

func (p mountedServiceAccountTokenProvider) TokenType() auth.SubjectTokenType {
	return auth.SubjectTokenTypeJWT
}

func (p mountedServiceAccountTokenProvider) GetToken(ctx context.Context, _ auth.HTTPDoer) (string, error) {
	data, err := os.ReadFile(p.path)
	if err != nil {
		return "", &auth.SubjectTokenProviderError{
			Provider: "kubernetes",
			Message:  "failed to read mounted service account token",
			Cause:    err,
		}
	}

	token := strings.TrimSpace(string(data))
	if token == "" {
		return "", &auth.SubjectTokenProviderError{
			Provider: "kubernetes",
			Message:  "mounted service account token is empty",
		}
	}

	return token, nil
}

func main() {
	client := openai.NewClient(
		option.WithWorkloadIdentity(auth.WorkloadIdentity{
			IdentityProviderID: os.Getenv("OPENAI_IDENTITY_PROVIDER_ID"),
			ServiceAccountID:   os.Getenv("OPENAI_SERVICE_ACCOUNT_ID"),
			Provider: mountedServiceAccountTokenProvider{
				path: tokenPath,
			},
		}),
	)

	response, err := client.Responses.New(context.Background(), responses.ResponseNewParams{
		Model: openai.ChatModelGPT4_1Mini,
		Input: responses.ResponseNewParamsInputUnion{
			OfString: openai.String("Say hello from Kubernetes workload identity federation."),
		},
	})
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(response.OutputText())
}
```

```
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.openai.auth.SubjectTokenProvider;
import com.openai.auth.SubjectTokenType;
import com.openai.auth.WorkloadIdentity;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.core.http.HttpClient;
import com.openai.errors.SubjectTokenProviderException;
import com.openai.models.ChatModel;
import com.openai.models.responses.ResponseCreateParams;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.CompletableFuture;

public final class KubernetesWorkloadIdentityExample {
    private static final String TOKEN_PATH = "/var/run/secrets/tokens/token";

    private KubernetesWorkloadIdentityExample() {}

    static final class MountedServiceAccountTokenProvider implements SubjectTokenProvider {
        private final Path tokenPath;

        MountedServiceAccountTokenProvider(String tokenPath) {
            this.tokenPath = Path.of(tokenPath);
        }

        @Override
        public SubjectTokenType tokenType() {
            return SubjectTokenType.JWT;
        }

        @Override
        public String getToken(HttpClient httpClient, JsonMapper jsonMapper) {
            String token;
            try {
                token = Files.readString(tokenPath).trim();
            } catch (Exception e) {
                throw new SubjectTokenProviderException(
                        "kubernetes",
                        "failed to read mounted service account token",
                        e);
            }

            if (token.isEmpty()) {
                throw new SubjectTokenProviderException(
                        "kubernetes",
                        "mounted service account token is empty",
                        null);
            }

            return token;
        }

        @Override
        public CompletableFuture&lt;String> getTokenAsync(
                HttpClient httpClient, JsonMapper jsonMapper) {
            return CompletableFuture.supplyAsync(() -> getToken(httpClient, jsonMapper));
        }
    }

    public static void main(String[] args) {
        WorkloadIdentity workloadIdentity = WorkloadIdentity.builder()
                .identityProviderId(System.getenv("OPENAI_IDENTITY_PROVIDER_ID"))
                .serviceAccountId(System.getenv("OPENAI_SERVICE_ACCOUNT_ID"))
                .provider(new MountedServiceAccountTokenProvider(TOKEN_PATH))
                .build();

        OpenAIClient client = OpenAIOkHttpClient.builder()
                .workloadIdentity(workloadIdentity)
                .build();

        ResponseCreateParams params = ResponseCreateParams.builder()
                .model(ChatModel.GPT_4_1_MINI)
                .input("Say hello from Kubernetes workload identity federation.")
                .build();

        client.responses().create(params).output().stream()
                .flatMap(item -> item.message().stream())
                .flatMap(message -> message.content().stream())
                .flatMap(content -> content.outputText().stream())
                .forEach(outputText -> System.out.println(outputText.text()));
    }
}
```

```
require "openai"

TOKEN_PATH = "/var/run/secrets/tokens/token"

class MountedServiceAccountTokenProvider
  include OpenAI::Auth::SubjectTokenProvider

  def initialize(token_path:)
    @token_path = token_path
  end

  def token_type
    OpenAI::Auth::TokenType::JWT
  end

  def get_token
    token = File.read(@token_path).strip
    if token.empty?
      raise OpenAI::Errors::SubjectTokenProviderError.new(
        message: "Mounted service account token is empty",
        provider: "kubernetes"
      )
    end
    token
  rescue SystemCallError => e
    raise OpenAI::Errors::SubjectTokenProviderError.new(
      message: "Failed to read mounted service account token: #{e.message}",
      provider: "kubernetes",
      cause: e
    )
  end
end

provider = MountedServiceAccountTokenProvider.new(token_path: TOKEN_PATH)

workload_identity = OpenAI::Auth::WorkloadIdentity.new(
  identity_provider_id: ENV.fetch("OPENAI_IDENTITY_PROVIDER_ID"),
  service_account_id: ENV.fetch("OPENAI_SERVICE_ACCOUNT_ID"),
  provider: provider
)

client = OpenAI::Client.new(workload_identity: workload_identity)

response = client.responses.create(
  model: "gpt-4.1-mini",
  input: "Say hello from Kubernetes workload identity federation."
)

puts(response.output_text)
```


## Kubernetes 最佳实践

*   使用稳定的 OIDC 签发者。签发者 URL 必须与投射服务账户令牌的 `iss` 声明匹配，并且应在集群升级和维护操作中保持稳定。
*   谨慎保护签名密钥。任何能够访问集群服务账户签名密钥的人都可以铸造可能被 OpenAI 接受的令牌。
*   为 OpenAI 集成使用专用服务账户。避免复用同时用于不相关基础设施或应用程序访问的服务账户。
*   保持上传的 JWKS 为最新状态。OpenAI 在本地 JWKS 模式下使用配置的 JWKS 来验证工作负载身份令牌，因此在轮换到新签名密钥之前请更新工作负载身份提供者。
*   最小化自定义声明的复杂性。优先匹配标准声明如 `sub` 和 `aud`，或直接从这些声明派生的转换属性。
*   将命名空间所有权视为安全模型的一部分。如果命名空间管理员可以创建服务账户，请确保映射的范围适当，以防止意外的权限提升。
*   监控签发者和签名密钥的变更。在未更新工作负载身份提供者 JWKS 的情况下轮换签名密钥可能导致令牌交换失败。
