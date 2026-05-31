import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'OpenAI 开发者文档中文翻译',
  description: 'OpenAI Developer Documentation 中文翻译',
  srcDir: 'zh',
  base: '/openai-developer-doc-zh/',
  ignoreDeadLinks: true,
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.includes('_') || tag.includes('-')
      }
    }
  },
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '官方文档', link: 'https://developers.openai.com/api/docs' }
    ],
    sidebar: [
      {
        text: 'Get started',
        items: [
          { text: 'Quickstart', link: '/quickstart' },
          { text: 'Models', link: '/models' },
          { text: 'Pricing', link: '/pricing' },
          {
            text: 'SDKs and CLI',
            collapsed: true,
            items: [
              { text: 'OpenAI SDK', link: '/libraries' },
              { text: 'Agents SDK', link: '/guides/agents' },
              { text: 'OpenAI CLI', link: '/libraries/openai-cli' },
            ]
          },
          { text: 'Latest: GPT-5.5', link: '/guides/latest-model' },
          { text: 'Prompt guidance', link: '/guides/prompt-guidance' },
        ]
      },
      {
        text: 'Core concepts',
        items: [
          { text: 'Text generation', link: '/guides/text' },
          { text: 'Code generation', link: '/guides/code-generation' },
          { text: 'Images and vision', link: '/guides/images-vision' },
          { text: 'Audio and speech', link: '/guides/audio' },
          { text: 'Structured output', link: '/guides/structured-outputs' },
          { text: 'Function calling', link: '/guides/function-calling' },
          { text: 'Responses API', link: '/guides/migrate-to-responses' },
          { text: 'Using tools', link: '/guides/tools' },
        ]
      },
      {
        text: 'Agents SDK',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/guides/agents' },
          { text: 'Quickstart', link: '/guides/agents/quickstart' },
          { text: 'Agent definitions', link: '/guides/agents/define-agents' },
          { text: 'Models and providers', link: '/guides/agents/models' },
          { text: 'Running agents', link: '/guides/agents/running-agents' },
          { text: 'Sandbox agents', link: '/guides/agents/sandboxes' },
          { text: 'Orchestration', link: '/guides/agents/orchestration' },
          { text: 'Guardrails', link: '/guides/agents/guardrails-approvals' },
          { text: 'Results and state', link: '/guides/agents/results' },
          { text: 'Integrations and observability', link: '/guides/agents/integrations-observability' },
          { text: 'Evaluate agent workflows', link: '/guides/agent-evals' },
          { text: 'Voice agents', link: '/guides/voice-agents' },
          {
            text: 'Agent Builder',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/guides/agent-builder' },
              { text: 'Node reference', link: '/guides/node-reference' },
              { text: 'Safety in building agents', link: '/guides/agent-builder-safety' },
              {
                text: 'ChatKit',
                collapsed: true,
                items: [
                  { text: 'Overview', link: '/guides/chatkit' },
                  { text: 'Customize', link: '/guides/chatkit-themes' },
                  { text: 'Widgets', link: '/guides/chatkit-widgets' },
                  { text: 'Actions', link: '/guides/chatkit-actions' },
                  { text: 'Advanced integrations', link: '/guides/custom-chatkit' },
                ]
              },
            ]
          },
        ]
      },
      {
        text: 'Tools',
        collapsed: true,
        items: [
          { text: 'Web search', link: '/guides/tools-web-search' },
          { text: 'MCP and Connectors', link: '/guides/tools-connectors-mcp' },
          { text: 'Secure MCP Tunnel', link: '/guides/secure-mcp-tunnels' },
          { text: 'Skills', link: '/guides/tools-skills' },
          { text: 'Shell', link: '/guides/tools-shell' },
          { text: 'Computer use', link: '/guides/tools-computer-use' },
          {
            text: 'File search and retrieval',
            collapsed: true,
            items: [
              { text: 'File search', link: '/guides/tools-file-search' },
              { text: 'Retrieval', link: '/guides/retrieval' },
            ]
          },
          { text: 'Tool search', link: '/guides/tools-tool-search' },
          {
            text: 'More tools',
            collapsed: true,
            items: [
              { text: 'Apply Patch', link: '/guides/tools-apply-patch' },
              { text: 'Local shell', link: '/guides/tools-local-shell' },
              { text: 'Image generation', link: '/guides/tools-image-generation' },
              { text: 'Code interpreter', link: '/guides/tools-code-interpreter' },
            ]
          },
        ]
      },
      {
        text: 'Run and scale',
        collapsed: true,
        items: [
          { text: 'Conversation state', link: '/guides/conversation-state' },
          { text: 'Background mode', link: '/guides/background' },
          { text: 'Streaming', link: '/guides/streaming-responses' },
          { text: 'WebSocket mode', link: '/guides/websocket-mode' },
          { text: 'Webhooks', link: '/guides/webhooks' },
          { text: 'File inputs', link: '/guides/file-inputs' },
          {
            text: 'Context management',
            collapsed: true,
            items: [
              { text: 'Compaction', link: '/guides/compaction' },
              { text: 'Counting tokens', link: '/guides/token-counting' },
              { text: 'Prompt caching', link: '/guides/prompt-caching' },
            ]
          },
          {
            text: 'Prompting',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/guides/prompting' },
              { text: 'Prompt engineering', link: '/guides/prompt-engineering' },
              { text: 'Citation formatting', link: '/guides/citation-formatting' },
              { text: 'Migration guide', link: '/guides/prompting/migrate-from-prompt-object' },
            ]
          },
          {
            text: 'Reasoning',
            collapsed: true,
            items: [
              { text: 'Reasoning models', link: '/guides/reasoning' },
              { text: 'Reasoning best practices', link: '/guides/reasoning-best-practices' },
            ]
          },
        ]
      },
      {
        text: 'Evaluation',
        collapsed: true,
        items: [
          { text: 'Getting started', link: '/guides/evaluation-getting-started' },
          { text: 'Working with evals', link: '/guides/evals' },
          { text: 'Prompt optimizer', link: '/guides/prompt-optimizer' },
          { text: 'External models', link: '/guides/external-models' },
          { text: 'Red teaming', link: '/guides/red-teaming' },
          { text: 'Best practices', link: '/guides/evaluation-best-practices' },
        ]
      },
      {
        text: 'Realtime and audio',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/guides/realtime' },
          { text: 'Voice agents', link: '/guides/voice-agents' },
          { text: 'Live translation', link: '/guides/realtime-translation' },
          {
            text: 'Transcription',
            collapsed: true,
            items: [
              { text: 'Realtime transcription', link: '/guides/realtime-transcription' },
              { text: 'Speech to text', link: '/guides/speech-to-text' },
            ]
          },
          { text: 'Speech generation', link: '/guides/text-to-speech' },
          { text: 'Realtime prompting guide', link: '/guides/realtime-models-prompting' },
          {
            text: 'Connection methods',
            collapsed: true,
            items: [
              { text: 'WebRTC', link: '/guides/realtime-webrtc' },
              { text: 'WebSocket', link: '/guides/realtime-websocket' },
              { text: 'SIP', link: '/guides/realtime-sip' },
            ]
          },
          {
            text: 'Realtime sessions',
            collapsed: true,
            items: [
              { text: 'Managing conversations', link: '/guides/realtime-conversations' },
              { text: 'Voice activity detection', link: '/guides/realtime-vad' },
              { text: 'Realtime with tools', link: '/guides/realtime-mcp' },
              { text: 'Webhooks and server-side controls', link: '/guides/realtime-server-controls' },
              { text: 'Managing costs', link: '/guides/realtime-costs' },
            ]
          },
        ]
      },
      {
        text: 'Model optimization',
        collapsed: true,
        items: [
          { text: 'Optimization cycle', link: '/guides/model-optimization' },
          {
            text: 'Fine-tuning',
            collapsed: true,
            items: [
              { text: 'Supervised fine-tuning', link: '/guides/supervised-fine-tuning' },
              { text: 'Vision fine-tuning', link: '/guides/vision-fine-tuning' },
              { text: 'Direct preference optimization', link: '/guides/direct-preference-optimization' },
              { text: 'Reinforcement fine-tuning', link: '/guides/reinforcement-fine-tuning' },
              { text: 'RFT use cases', link: '/guides/rft-use-cases' },
              { text: 'Best practices', link: '/guides/fine-tuning-best-practices' },
            ]
          },
          { text: 'Graders', link: '/guides/graders' },
        ]
      },
      {
        text: 'Specialized models',
        collapsed: true,
        items: [
          { text: 'Image generation', link: '/guides/image-generation' },
          { text: 'Video generation', link: '/guides/video-generation' },
          { text: 'Deep research', link: '/guides/deep-research' },
          { text: 'Embeddings', link: '/guides/embeddings' },
          { text: 'Moderation', link: '/guides/moderation' },
        ]
      },
      {
        text: 'Going live',
        collapsed: true,
        items: [
          { text: 'Production best practices', link: '/guides/production-best-practices' },
          {
            text: 'Workload identity federation',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/guides/workload-identity-federation' },
              { text: 'Kubernetes', link: '/guides/workload-identity-federation/kubernetes' },
              { text: 'AWS', link: '/guides/workload-identity-federation/aws' },
              { text: 'Microsoft Azure', link: '/guides/workload-identity-federation/microsoft-azure' },
              { text: 'Google Cloud', link: '/guides/workload-identity-federation/google-cloud' },
              { text: 'GitHub Actions', link: '/guides/workload-identity-federation/github-actions' },
            ]
          },
          { text: 'Deployment checklist', link: '/guides/deployment-checklist' },
          {
            text: 'Latency optimization',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/guides/latency-optimization' },
              { text: 'Predicted Outputs', link: '/guides/predicted-outputs' },
              { text: 'Priority processing', link: '/guides/priority-processing' },
            ]
          },
          {
            text: 'Cost optimization',
            collapsed: true,
            items: [
              { text: 'Overview', link: '/guides/cost-optimization' },
              { text: 'Batch', link: '/guides/batch' },
              { text: 'Flex processing', link: '/guides/flex-processing' },
            ]
          },
          { text: 'Accuracy optimization', link: '/guides/optimizing-llm-accuracy' },
          {
            text: 'Safety',
            collapsed: true,
            items: [
              { text: 'Safety best practices', link: '/guides/safety-best-practices' },
              { text: 'Safety checks', link: '/guides/safety-checks' },
              { text: 'Cybersecurity checks', link: '/guides/safety-checks/cybersecurity' },
              { text: 'Under 18 API Guidance', link: '/guides/safety-checks/under-18-api-guidance' },
            ]
          },
        ]
      },
      {
        text: 'Legacy APIs',
        collapsed: true,
        items: [
          {
            text: 'Assistants API',
            collapsed: true,
            items: [
              { text: 'Migration guide', link: '/assistants/migration' },
              { text: 'Deep dive', link: '/assistants/deep-dive' },
              { text: 'Tools', link: '/assistants/tools' },
            ]
          },
        ]
      },
      {
        text: 'Resources',
        collapsed: true,
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'Your data', link: '/guides/your-data' },
          { text: 'Permissions', link: '/guides/rbac' },
          { text: 'Rate limits', link: '/guides/rate-limits' },
          { text: 'Admin APIs', link: '/guides/admin-apis' },
          { text: 'Deprecations', link: '/deprecations' },
          { text: 'MCP for deep research', link: '/mcp' },
          { text: 'Developer mode', link: '/guides/developer-mode' },
          {
            text: 'ChatGPT Actions',
            collapsed: true,
            items: [
              { text: 'Introduction', link: '/actions/introduction' },
              { text: 'Getting started', link: '/actions/getting-started' },
              { text: 'Actions library', link: '/actions/actions-library' },
              { text: 'Authentication', link: '/actions/authentication' },
              { text: 'Production', link: '/actions/production' },
              { text: 'Data retrieval', link: '/actions/data-retrieval' },
              { text: 'Sending files', link: '/actions/sending-files' },
            ]
          },
        ]
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/hl8086/openai-developer-doc-zh' }
    ],
    search: { provider: 'local' },
    outline: { level: [2, 3] },
  }
})
