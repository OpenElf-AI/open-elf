import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { useToast } from '../components/Toast';
import { llmService, LLMConfig } from '../services/llmService';

const LLMConfigPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { goBack } = useAppStore();
  const { showToast } = useToast();

  const [config, setConfig] = useState<LLMConfig>(llmService.getConfig());
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setConfig(llmService.getConfig());
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      llmService.setConfig(config);
      localStorage.setItem('user_llm_config', JSON.stringify(config));
      showToast('配置已保存！现在你可以使用自己的API Key与智能体对话了', 'success');
    } catch (error) {
      showToast('保存失败，请重试', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await llmService.generateWithSystemPrompt(
        '请用一句话介绍你自己',
        '你是一个友好的AI助手',
        config
      );
      setTestResult(`测试成功！回复：${response.content}`);
      showToast('连接测试成功！', 'success');
    } catch (error) {
      setTestResult(`测试失败：${error instanceof Error ? error.message : '未知错误'}`);
      showToast('连接测试失败，请检查配置', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const providers = [
    { value: 'local', label: '本地模拟（测试用）' },
    { value: 'openai', label: 'OpenAI (GPT)' },
    { value: 'anthropic', label: 'Anthropic (Claude)' },
    { value: 'baidu', label: '百度文心一言' },
    { value: 'alibaba', label: '阿里通义千问' },
    { value: 'tencent', label: '腾讯混元' },
  ];

  const modelOptions: Record<string, string[]> = {
    local: ['mock-model'],
    openai: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo-preview'],
    anthropic: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229'],
    baidu: ['ernie-4.0', 'ernie-3.5', 'ernie-lite'],
    alibaba: ['qwen-max', 'qwen-plus', 'qwen-turbo'],
    tencent: ['hunyuan-lite', 'hunyuan-standard', 'hunyuan-pro'],
  };

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm z-10 border-b border-white/5">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={onBack || goBack}
            className="text-[#888888] hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-white font-semibold text-xl">AI模型配置</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <div className="bg-[#121212] rounded-2xl p-5">
          <h2 className="text-white font-medium text-base mb-4">基本设置</h2>

          <div className="space-y-4">
            <div>
              <label className="text-[#888888] text-sm mb-2 block">AI服务商</label>
              <select
                value={config.provider}
                onChange={e => {
                  const newProvider = e.target.value as LLMConfig['provider'];
                  setConfig({
                    ...config,
                    provider: newProvider,
                    model: modelOptions[newProvider]?.[0] || '',
                  });
                }}
                className="w-full bg-[#1A1A1A] rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
              >
                {providers.map(p => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[#888888] text-sm mb-2 block">模型</label>
              <select
                value={config.model}
                onChange={e => setConfig({ ...config, model: e.target.value })}
                className="w-full bg-[#1A1A1A] rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
              >
                {modelOptions[config.provider]?.map(model => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            {config.provider !== 'local' && (
              <>
                <div>
                  <label className="text-[#888888] text-sm mb-2 block">API Key</label>
                  <input
                    type="password"
                    value={config.apiKey || ''}
                    onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                    placeholder="请输入你的API Key"
                    className="w-full bg-[#1A1A1A] rounded-xl px-4 py-3 text-white text-sm placeholder-[#666666] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#888888] text-sm mb-2 block">API Base URL（可选）</label>
                  <input
                    type="text"
                    value={config.baseUrl || ''}
                    onChange={e => setConfig({ ...config, baseUrl: e.target.value })}
                    placeholder="自定义API地址（如使用代理）"
                    className="w-full bg-[#1A1A1A] rounded-xl px-4 py-3 text-white text-sm placeholder-[#666666] focus:outline-none"
                  />
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[#888888] text-sm mb-2 block">温度 (0-1)</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.temperature || 0.7}
                  onChange={e => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                  className="w-full bg-[#1A1A1A] rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[#888888] text-sm mb-2 block">最大Token数</label>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  step="100"
                  value={config.maxTokens || 1000}
                  onChange={e => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                  className="w-full bg-[#1A1A1A] rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#121212] rounded-2xl p-5">
          <h2 className="text-white font-medium text-base mb-4">配置说明</h2>
          <div className="text-[#888888] text-sm space-y-2">
            <p>• 本地模拟：无需API Key，用于测试界面功能</p>
            <p>
              • OpenAI：需要在{' '}
              <a
                href="https://platform.openai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                platform.openai.com
              </a>{' '}
              获取API Key
            </p>
            <p>
              • Anthropic：需要在{' '}
              <a
                href="https://console.anthropic.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                console.anthropic.com
              </a>{' '}
              获取API Key
            </p>
            <p>• 其他国内模型：请在对应平台申请API Key</p>
          </div>
        </div>

        {testResult && (
          <div
            className={`rounded-2xl p-4 ${testResult.includes('成功') ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}
          >
            <p
              className={`text-sm ${testResult.includes('成功') ? 'text-green-400' : 'text-red-400'}`}
            >
              {testResult}
            </p>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-black border-t border-white/5 p-5">
        <div className="flex gap-3">
          <button
            onClick={handleTest}
            disabled={isTesting || isSaving}
            className="flex-1 bg-[#1A1A1A] text-white py-4 rounded-2xl font-medium hover:bg-[#222222] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? '测试中...' : '测试连接'}
          </button>
          <button
            onClick={handleSave}
            disabled={isTesting || isSaving}
            className="flex-1 bg-primary text-black py-4 rounded-2xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '保存中...' : '保存配置'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LLMConfigPage;
