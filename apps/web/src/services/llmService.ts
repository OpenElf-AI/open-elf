export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'baidu' | 'alibaba' | 'tencent' | 'local';
  apiKey?: string;
  baseUrl?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMProvider {
  generate(messages: ChatMessage[], config: LLMConfig): Promise<LLMResponse>;
}

class OpenAIProvider implements LLMProvider {
  async generate(messages: ChatMessage[], config: LLMConfig): Promise<LLMResponse> {
    const apiKey = config.apiKey || import.meta.env.VITE_OPENAI_API_KEY;
    const baseUrl = config.baseUrl || 'https://api.openai.com/v1';

    if (!apiKey) {
      throw new Error('请先在个人中心配置 OpenAI API Key');
    }

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: config.model || 'gpt-3.5-turbo',
          messages,
          temperature: config.temperature ?? 0.7,
          max_tokens: config.maxTokens ?? 1000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.error?.message || `HTTP ${response.status}`;
        throw new Error(`OpenAI 调用失败: ${errorMsg}`);
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        usage: data.usage
          ? {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
              totalTokens: data.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('OpenAI 连接失败，请检查网络配置');
    }
  }
}

class AnthropicProvider implements LLMProvider {
  async generate(messages: ChatMessage[], config: LLMConfig): Promise<LLMResponse> {
    const apiKey = config.apiKey || import.meta.env.VITE_ANTHROPIC_API_KEY;
    const baseUrl = config.baseUrl || 'https://api.anthropic.com/v1';

    if (!apiKey) {
      throw new Error('请先在个人中心配置 Anthropic API Key');
    }

    try {
      const systemMessage = messages.find(m => m.role === 'system');
      const otherMessages = messages.filter(m => m.role !== 'system');

      const response = await fetch(`${baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: config.model || 'claude-3-haiku-20240307',
          messages: otherMessages,
          system: systemMessage?.content,
          max_tokens: config.maxTokens ?? 1024,
          temperature: config.temperature,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.error?.message || `HTTP ${response.status}`;
        throw new Error(`Anthropic 调用失败: ${errorMsg}`);
      }

      const data = await response.json();
      return {
        content: data.content[0].text,
        usage: data.usage
          ? {
              promptTokens: data.usage.input_tokens,
              completionTokens: data.usage.output_tokens,
              totalTokens: data.usage.input_tokens + data.usage.output_tokens,
            }
          : undefined,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Anthropic 连接失败，请检查网络配置');
    }
  }
}

class BaiduProvider implements LLMProvider {
  async generate(messages: ChatMessage[], config: LLMConfig): Promise<LLMResponse> {
    const apiKey = config.apiKey || import.meta.env.VITE_BAIDU_API_KEY;
    const baseUrl =
      config.baseUrl || 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat';

    if (!apiKey) {
      throw new Error('请先在个人中心配置百度 API Key');
    }

    try {
      const model = config.model || 'ernie-3.5-turbo';
      const baiduMessages = messages.map(msg => ({
        role: msg.role === 'system' ? 'user' : msg.role,
        content: msg.role === 'system' ? `[System Prompt]\n${msg.content}` : msg.content,
      }));

      const response = await fetch(`${baseUrl}/${model}?access_token=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: baiduMessages,
          temperature: config.temperature ?? 0.8,
          max_output_tokens: config.maxTokens ?? 1000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.error_msg || `HTTP ${response.status}`;
        throw new Error(`百度文心一言调用失败: ${errorMsg}`);
      }

      const data = await response.json();

      if (data.error_code) {
        throw new Error(`百度文心一言错误: ${data.error_msg}`);
      }

      return {
        content: data.result,
        usage: data.usage
          ? {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
              totalTokens: data.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('百度文心一言连接失败，请检查网络配置');
    }
  }
}

class AlibabaProvider implements LLMProvider {
  async generate(messages: ChatMessage[], config: LLMConfig): Promise<LLMResponse> {
    const apiKey = config.apiKey || import.meta.env.VITE_ALIBABA_API_KEY;
    const baseUrl =
      config.baseUrl ||
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

    if (!apiKey) {
      throw new Error('请先在个人中心配置阿里云 API Key');
    }

    try {
      const systemMessage = messages.find(m => m.role === 'system');
      const otherMessages = messages.filter(m => m.role !== 'system');

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: config.model || 'qwen-turbo',
          input: {
            messages: [
              ...(systemMessage ? [{ role: 'system', content: systemMessage.content }] : []),
              ...otherMessages,
            ],
          },
          parameters: {
            temperature: config.temperature ?? 0.7,
            max_tokens: config.maxTokens ?? 1000,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.message || `HTTP ${response.status}`;
        throw new Error(`阿里云通义千问调用失败: ${errorMsg}`);
      }

      const data = await response.json();

      if (data.code) {
        throw new Error(`阿里云通义千问错误: ${data.message}`);
      }

      return {
        content: data.output.text,
        usage: data.usage
          ? {
              promptTokens: data.usage.input_tokens,
              completionTokens: data.usage.output_tokens,
              totalTokens: data.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('阿里云通义千问连接失败，请检查网络配置');
    }
  }
}

class TencentProvider implements LLMProvider {
  async generate(messages: ChatMessage[], config: LLMConfig): Promise<LLMResponse> {
    const apiKey = config.apiKey || import.meta.env.VITE_TENCENT_API_KEY;
    const baseUrl = config.baseUrl || 'https://hunyuan.tencentcloudapi.com';

    if (!apiKey) {
      throw new Error('请先在个人中心配置腾讯云 API Key');
    }

    try {
      const systemMessage = messages.find(m => m.role === 'system');
      const otherMessages = messages.filter(m => m.role !== 'system');

      const hunyuanMessages = [
        ...(systemMessage ? [{ Role: 'system', Content: systemMessage.content }] : []),
        ...otherMessages.map(msg => ({ Role: msg.role, Content: msg.content })),
      ];

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'X-TC-Action': 'ChatCompletions',
          'X-TC-Version': '2023-09-01',
        },
        body: JSON.stringify({
          Model: config.model || 'hunyuan-lite',
          Messages: hunyuanMessages,
          Temperature: config.temperature ?? 0.7,
          TopP: 0.9,
          Stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.Error?.Message || `HTTP ${response.status}`;
        throw new Error(`腾讯混元调用失败: ${errorMsg}`);
      }

      const data = await response.json();

      if (data.Error) {
        throw new Error(`腾讯混元错误: ${data.Error.Message}`);
      }

      return {
        content: data.Response.Choices[0].Message.Content,
        usage: data.Response.Usage
          ? {
              promptTokens: data.Response.Usage.PromptTokens,
              completionTokens: data.Response.Usage.CompletionTokens,
              totalTokens: data.Response.Usage.TotalTokens,
            }
          : undefined,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('腾讯混元连接失败，请检查网络配置');
    }
  }
}

class MockProvider implements LLMProvider {
  async generate(messages: ChatMessage[], _config: LLMConfig): Promise<LLMResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    let hasCapability = false;
    let capabilityName = '';

    const systemMessage = messages.find(m => m.role === 'system');
    if (systemMessage?.content) {
      const capabilityMatch = systemMessage.content.match(/【(.+?)】\n([\s\S]*?)(?=\n【|$)/);
      if (capabilityMatch) {
        hasCapability = true;
        capabilityName = capabilityMatch[1];
      }
    }

    if (hasCapability) {
      const userMessage = messages.filter(m => m.role === 'user').pop()?.content || '';

      let response = `✨ 正在使用【${capabilityName}】为您服务...\n\n`;

      if (capabilityName.includes('文案') || capabilityName.includes('策划')) {
        response += `根据您的需求"${userMessage}"，为您提供以下文案建议：\n\n`;
        response += `### 产品文案方案\n\n`;
        response += `**标题：** 创新科技，引领未来\n\n`;
        response += `**正文：**\n`;
        response += `我们致力于为用户提供最先进的AI解决方案。通过前沿技术和优质服务，让您的生活更加智能便捷。\n\n`;
        response += `**核心亮点：**\n`;
        response += `- 智能驱动，高效便捷\n`;
        response += `- 安全可靠，值得信赖\n`;
        response += `- 持续创新，永不止步\n\n`;
        response += `---\n\n`;
        response += `需要调整或其他帮助，请随时告诉我！`;
      } else if (capabilityName.includes('文生图') || capabilityName.includes('图片')) {
        response += `🎨 正在为您生成图片...\n\n`;
        response += `根据您的描述，我为您构思了以下画面：\n\n`;
        response += `这是一幅充满创意的艺术作品，融合了现代美学与科技感。画面主体突出，色彩和谐，构图精妙。\n\n`;
        response += `---\n\n`;
        response += `💡 提示：如需真实生成图片，请在个人中心配置文生图API Key`;
      } else if (capabilityName.includes('搜索') || capabilityName.includes('联网')) {
        response += `🔍 正在搜索最新信息...\n\n`;
        response += `根据您的查询"${userMessage}"，为您找到以下信息：\n\n`;
        response += `### 搜索结果摘要\n\n`;
        response += `1. **最新动态**：根据最新数据显示...\n`;
        response += `2. **相关资讯**：业内专家分析认为...\n`;
        response += `3. **数据统计**：截至目前，统计数据表明...\n\n`;
        response += `---\n\n`;
        response += `需要更详细的信息，请继续提问！`;
      } else if (capabilityName.includes('代码') || capabilityName.includes('审查')) {
        response += `💻 正在分析代码...\n\n`;
        response += `根据您的需求，为您提供以下代码审查建议：\n\n`;
        response += `### 代码审查报告\n\n`;
        response += `✅ **代码质量：** 良好\n`;
        response += `🔍 **潜在问题：** 暂无明显安全隐患\n`;
        response += `💡 **优化建议：**\n`;
        response += `1. 增加错误处理逻辑\n`;
        response += `2. 添加代码注释提高可读性\n`;
        response += `3. 考虑性能优化\n\n`;
        response += `---\n\n`;
        response += `需要其他帮助，请随时告诉我！`;
      } else {
        response += `我已激活【${capabilityName}】能力，正在为您处理中...\n\n`;
        response += `根据您的需求"${userMessage}"，以下是我的建议：\n\n`;
        response += `这是一个很好的问题！让我结合${capabilityName}的专业知识为您详细解答...\n\n`;
        response += `---\n\n`;
        response += `如果您还有其他问题，请随时告诉我！`;
      }

      return {
        content: response,
        usage: {
          promptTokens: 100,
          completionTokens: 200,
          totalTokens: 300,
        },
      };
    }

    const replies = [
      '这是一个很好的问题！让我为您详细解答。根据您描述的情况，我建议...',
      '感谢您的提问！基于我的分析，我认为最佳方案是...',
      '非常有趣的话题！让我从专业角度为您分析一下...',
      '好的，我理解您的需求了。以下是我的建议和解决方案...',
      '这个问题很有深度！让我结合专业知识为您解答...',
    ];

    const randomReply = replies[Math.floor(Math.random() * replies.length)];

    return {
      content: `${randomReply}\n\n如果您还有其他问题，请随时告诉我！\n\n💡 提示：这是模拟回复，如需真实AI回答，请在个人中心配置API Key`,
      usage: {
        promptTokens: 50,
        completionTokens: 100,
        totalTokens: 150,
      },
    };
  }
}

const providers: Record<string, LLMProvider> = {
  openai: new OpenAIProvider(),
  anthropic: new AnthropicProvider(),
  baidu: new BaiduProvider(),
  alibaba: new AlibabaProvider(),
  tencent: new TencentProvider(),
  local: new MockProvider(),
};

export class LLMService {
  private config: LLMConfig;

  constructor(config?: Partial<LLMConfig>) {
    this.config = {
      provider: 'local',
      model: 'mock-model',
      temperature: 0.7,
      maxTokens: 1000,
      ...config,
    };
  }

  setConfig(config: Partial<LLMConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): LLMConfig {
    return { ...this.config };
  }

  async generate(messages: ChatMessage[], options?: Partial<LLMConfig>): Promise<LLMResponse> {
    const finalConfig = { ...this.config, ...options };
    const provider = providers[finalConfig.provider];

    if (!provider) {
      throw new Error(`不支持的模型提供商: ${finalConfig.provider}`);
    }

    return provider.generate(messages, finalConfig);
  }

  async generateWithSystemPrompt(
    userMessage: string,
    systemPrompt: string,
    options?: Partial<LLMConfig>
  ): Promise<LLMResponse> {
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];
    return this.generate(messages, options);
  }
}

export const llmService = new LLMService();
