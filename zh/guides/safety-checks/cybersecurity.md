# Cybersecurity checks

> GPT-5.

GPT-5.3-Codex 及更新的模型，包括 GPT-5.4 和 GPT-5.5，根据我们的[准备框架](https://cdn.openai.com/pdf/18a02b5d-6b67-4cec-ab64-68cdfbddebcd/preparedness-framework-v2.pdf)被归类为具有高网络安全能力。因此，当通过 API 使用这些模型时，会应用额外的自动化安全措施。请注意，API 中应用的安全措施与 Codex 中使用的不同。您可以在[此处](https://developers.openai.com/codex/concepts/cyber-safety/)了解更多关于 Codex 安全措施的信息。

这些安全措施会监控潜在可疑网络安全活动的信号。如果达到某些阈值，在审查活动期间，对模型的访问可能会被暂时限制。由于这些系统仍在校准中，合法的安全研究或防御性工作偶尔可能会被标记。我们预计只有少部分流量会受到影响，并且我们正在持续优化整体 API 体验。

## 非 ZDR 组织的安全措施操作

如果我们的系统检测到您的流量中存在超过定义阈值的潜在可疑网络安全活动，对这些模型的访问可能会被暂时撤销。在这种情况下，API 请求将返回错误代码为 `cyber_policy` 的错误。

如果您的组织未实施按用户划分的 [safety\_identifier](https://developers.openai.com/api/docs/guides/safety-best-practices#implement-safety-identifiers)，访问可能会被暂时撤销**整个组织**的权限。如果您的组织为每个终端用户提供唯一的 [safety\_identifier](https://developers.openai.com/api/docs/guides/safety-best-practices#implement-safety-identifiers)，访问可能仅会被暂时撤销**特定受影响用户**的权限，而非整个组织（经过人工审查和警告后）。提供安全标识符有助于最大限度地减少对平台上其他用户的干扰。

## ZDR 组织的安全措施操作

对于[非零数据保留 (ZDR)](https://developers.openai.com/api/docs/guides/your-data/#data-retention-controls-for-abuse-monitoring) 组织，流程与上述基本相似；但是，对于使用 ZDR 的组织，还会额外应用请求级别的缓解措施。

如果请求被分类为潜在可疑，您可能会收到错误代码为 `cyber_policy` 的 API 错误。对于流式请求，这些错误可能会在其他流式事件中间返回。

与非 ZDR 组织一样，如果可疑网络活动达到某些阈值，访问可能会被限制为特定的 safety\_identifier 或整个组织。

## 申诉

如果您认为您的访问被错误限制，并且需要在 7 天期限结束前恢复访问，请[联系支持团队](https://help.openai.com/en/articles/6614161-how-can-i-contact-support)。
