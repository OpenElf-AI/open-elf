import React, { useState } from 'react';
import { useAppStore, useUserStore } from '../store';
import { useToast } from '../components/Toast';
import { AgentAvatar } from '../components';
import { useCreateAgent } from '../hooks/useAgents';

const CreateAgentPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { goBack, setCurrentView } = useAppStore();
  const { user } = useUserStore();
  const { showToast } = useToast();
  const createMutation = useCreateAgent();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('29');
  const [baseModel, setBaseModel] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [totalSupply, setTotalSupply] = useState('10'); // 默认总供应量

  const baseModels = [
    { value: 'open-elf-general', label: 'OpenElf 通用助手' },
    { value: 'family-doctor', label: '家庭医生' },
    { value: 'code-master', label: '代码大师' },
    { value: 'english-tutor', label: '英语外教' },
    { value: 'copywriter', label: '文案策划' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      {
        name,
        description,
        avatar: '',
        prompt: '',
        category: '通用',
        price: parseFloat(price),
        totalSupply: parseInt(totalSupply),
        baseModel,
      },
      {
        onSuccess: () => {
          showToast('智能体已提交，等待平台审核', 'success');
          setCurrentView('discover');
        },
        onError: error => {
          showToast(error instanceof Error ? error.message : '创建失败，请重试', 'error');
        },
      }
    );
  };

  const isFormValid =
    name &&
    name.length <= 20 &&
    description &&
    description.length <= 200 &&
    price &&
    parseFloat(price) >= 9 &&
    parseFloat(price) <= 99 &&
    baseModel &&
    profileImage &&
    totalSupply &&
    parseInt(totalSupply) >= 1 &&
    parseInt(totalSupply) <= 1000;

  if (user?.verificationStatus === 'unverified') {
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
            <h1 className="text-white font-semibold text-lg">创建智能体</h1>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-5">
          <div className="w-24 h-24 rounded-full bg-[#1A1A1A] flex items-center justify-center mb-6 shadow-xl shadow-black/30">
            <svg
              className="w-12 h-12 text-[#666666]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-white font-semibold text-xl mb-3 text-center">需要创作者认证</h2>
          <p className="text-[#666666] text-base text-center mb-8 max-w-xs leading-relaxed">
            完成创作者认证后，即可发行您的智能体
          </p>
          <button
            onClick={() => setCurrentView({ type: 'verification' })}
            className="bg-gradient-to-r from-primary to-[#4096ff] text-white px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:from-[#0958d9] hover:to-primary active:scale-[0.97] shadow-lg shadow-primary/20"
          >
            去认证
          </button>
        </div>
      </div>
    );
  }

  if (user?.verificationStatus === 'pending') {
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
            <h1 className="text-white font-semibold text-lg">创建智能体</h1>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-5">
          <div className="w-24 h-24 rounded-full bg-yellow-500/20 flex items-center justify-center mb-6 shadow-xl shadow-yellow-500/10">
            <svg
              className="w-12 h-12 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-white font-semibold text-xl mb-3 text-center">认证审核中</h2>
          <p className="text-[#666666] text-base text-center mb-8 max-w-xs leading-relaxed">
            您的认证资料正在审核中，请耐心等待
          </p>
          <div className="bg-[#121212] rounded-2xl p-4 w-full max-w-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#666666] text-sm">平台</span>
              <span className="text-white text-sm">{user.verificationPlatform}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#666666] text-sm">粉丝数</span>
              <span className="text-white text-sm">
                {user.verificationFollowers?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-white font-semibold text-lg">创建智能体</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-5 space-y-4 sm:space-y-6">
          <div className="flex flex-col items-center">
            <AgentAvatar size="xl" />
            <div className="mt-3 text-center">
              <p className="text-[#666666] text-sm">平台统一智能体头像</p>
            </div>
          </div>

          <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 sm:p-5">
            <h2 className="text-white font-semibold text-base sm:text-lg mb-3 sm:mb-4">
              基本信息 <span className="text-red-400">*</span>
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-white font-medium text-sm sm:text-base mb-2 block">
                  智能体名称 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="给你的智能体起个名字"
                  maxLength={20}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-[#1677FF]/50 transition-colors text-sm sm:text-base"
                />
                <div className="text-right mt-1">
                  <span className="text-[#666666] text-xs sm:text-sm">{name.length}/20</span>
                </div>
              </div>
              <div>
                <label className="text-white font-medium text-sm sm:text-base mb-2 block">
                  功能描述 <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="介绍智能体的用途..."
                  maxLength={200}
                  rows={3}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-[#1677FF]/50 transition-colors resize-none text-sm sm:text-base"
                />
                <div className="text-right mt-1">
                  <span className="text-[#666666] text-xs sm:text-sm">
                    {description.length}/200
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 sm:p-5">
            <h2 className="text-white font-semibold text-base sm:text-lg mb-3 sm:mb-4">
              形象设置 <span className="text-red-400">*</span>
            </h2>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                上传上半身正面照片
              </label>
              <div className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center">
                {profileImage ? (
                  <div className="relative">
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-40 h-40 object-cover rounded-lg mx-auto"
                    />
                    <button
                      type="button"
                      onClick={() => setProfileImage(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProfileImage(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        className="w-12 h-12 text-[#666666]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-[#888888] text-sm">点击上传清晰的上半身正面照片</span>
                      <span className="text-[#666666] text-xs">用于生成3D模型</span>
                    </div>
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 sm:p-5">
            <h2 className="text-white font-semibold text-base sm:text-lg mb-3 sm:mb-4">
              基础模型 <span className="text-red-400">*</span>
            </h2>
            <div>
              <label className="text-white font-medium text-sm sm:text-base mb-2 block">
                选择基础对话大模型能力 <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {baseModels.map(model => (
                  <button
                    key={model.value}
                    type="button"
                    onClick={() => setBaseModel(model.value)}
                    className={`p-3 rounded-xl text-left transition-all ${
                      baseModel === model.value
                        ? 'bg-[#1677FF]/20 border border-[#1677FF]'
                        : 'bg-[#1A1A1A] border border-white/10 hover:border-[#1677FF]/50'
                    }`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        baseModel === model.value ? 'text-[#1677FF]' : 'text-white'
                      }`}
                    >
                      {model.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 sm:p-5">
            <h2 className="text-white font-semibold text-base sm:text-lg mb-3 sm:mb-4">
              销售设置 <span className="text-red-400">*</span>
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-white font-medium text-sm sm:text-base mb-2 block">
                  定价 <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-base sm:text-lg">
                    ¥
                  </span>
                  <input
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    min={9}
                    max={99}
                    step={0.1}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl pl-9 sm:pl-10 pr-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-[#1677FF]/50 transition-colors text-sm sm:text-lg"
                  />
                </div>
                <div className="text-[#666666] text-xs sm:text-sm mt-1">¥9.00 - ¥99.00</div>
              </div>
              <div>
                <label className="text-white font-medium text-sm sm:text-base mb-2 block">
                  总供应量 <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={totalSupply}
                  onChange={e => setTotalSupply(e.target.value)}
                  min={1}
                  max={1000}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-[#1677FF]/50 transition-colors text-sm sm:text-lg"
                />
                <div className="text-[#666666] text-xs sm:text-sm mt-1">1 - 1000</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 pt-0">
          <button
            type="submit"
            disabled={!isFormValid || createMutation.isPending}
            className={`w-full py-3.5 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-colors active:scale-[0.98] ${
              isFormValid && !createMutation.isPending
                ? 'bg-[#1677FF] text-white hover:bg-[#0958d9]'
                : 'bg-[#333333] text-[#666666] cursor-not-allowed'
            }`}
          >
            {createMutation.isPending ? '发行中...' : '确认发行'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAgentPage;
