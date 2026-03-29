import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../store';
import { mockApi } from '../api';
import type { UserCapabilityPackage, Agent } from '../api/types';
import { useToast } from '../components/Toast';
import { CapabilityPackageAvatar } from '../components';
import { AgentAvatar } from '../components';

interface SelectAgentModalProps {
  agents: Agent[];
  onSelect: (agent: Agent) => void;
  onClose: () => void;
}

const SelectAgentModal: React.FC<SelectAgentModalProps> = ({ agents, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50">
      <div className="bg-[#121212] w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-xl">选择智能体</h2>
          <button
            onClick={onClose}
            className="text-[#888888] hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {agents.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-white font-medium text-lg mb-2">还没有智能体</h3>
            <p className="text-[#666666] text-sm mb-6">先去购买一个智能体吧</p>
          </div>
        ) : (
          <div className="space-y-3">
            {agents.map(agent => (
              <button
                key={agent.id}
                onClick={() => onSelect(agent)}
                className="w-full text-left bg-[#1A1A1A] hover:bg-[#252525] rounded-xl p-4 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <AgentAvatar size="md" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-base truncate">{agent.name}</h3>
                    <p className="text-[#888888] text-sm truncate">{agent.description}</p>
                  </div>
                  <svg className="w-5 h-5 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MyCapabilityPackagesPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { setCurrentView, goBack } = useAppStore();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [selectedPkg, setSelectedPkg] = useState<UserCapabilityPackage | null>(null);

  const { data: userCapabilityPackages = [], isLoading } = useQuery({
    queryKey: ['userCapabilityPackages'],
    queryFn: mockApi.capabilityPackages.getUserCapabilityPackages,
  });

  const { data: myAgents = [] } = useQuery({
    queryKey: ['myAgents'],
    queryFn: mockApi.agents.getMyAgents,
  });

  const installMutation = useMutation({
    mutationFn: ({ userPkgId, agentId }: { userPkgId: string; agentId: string }) =>
      mockApi.capabilityPackages.installToAgent(userPkgId, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userCapabilityPackages'] });
      queryClient.invalidateQueries({ queryKey: ['myAgents'] });
      showToast('能力包配置成功！', 'success');
      setSelectedPkg(null);
    },
    onError: error => {
      showToast(error instanceof Error ? error.message : '配置失败，请重试', 'error');
    },
  });

  const uninstallMutation = useMutation({
    mutationFn: (userPkgId: string) => mockApi.capabilityPackages.uninstallFromAgent(userPkgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userCapabilityPackages'] });
      queryClient.invalidateQueries({ queryKey: ['myAgents'] });
      showToast('能力包卸载成功！', 'success');
    },
    onError: error => {
      showToast(error instanceof Error ? error.message : '卸载失败，请重试', 'error');
    },
  });

  const handleInstall = (userPkg: UserCapabilityPackage) => {
    if (myAgents.length === 0) {
      showToast('你还没有智能体，先去购买一个吧！', 'error');
      return;
    }
    setSelectedPkg(userPkg);
  };

  const handleSelectAgent = (agent: Agent) => {
    if (selectedPkg) {
      installMutation.mutate({ userPkgId: selectedPkg.id, agentId: agent.id });
    }
  };

  const handleUninstall = (userPkg: UserCapabilityPackage) => {
    uninstallMutation.mutate(userPkg.id);
  };

  const getInstalledAgentName = (agentId: string) => {
    const agent = myAgents.find((a: Agent) => a.id === agentId);
    return agent?.name || '未知智能体';
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
          <div className="flex-1">
            <h1 className="text-white font-semibold text-xl">我的能力包</h1>
            {userCapabilityPackages.length > 0 && (
              <p className="text-[#666666] text-sm">已购 {userCapabilityPackages.length} 个</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {isLoading ? (
          <div className="flex items-center justify-center pt-20">
            <div className="flex gap-2">
              <div
                className="w-2 h-2 bg-[#666666] rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="w-2 h-2 bg-[#666666] rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="w-2 h-2 bg-[#666666] rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        ) : userCapabilityPackages.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-32">
            <CapabilityPackageAvatar size="xl" />
            <h3 className="text-white font-medium text-lg mb-2 mt-6">还没有能力包</h3>
            <p className="text-[#666666] text-sm text-center mb-6">
              去广场购买你的第一个AI能力包吧
            </p>
            <button
              onClick={() => setCurrentView('discover')}
              className="bg-[#9254DE] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#722ED1] transition-colors"
            >
              去广场
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {userCapabilityPackages.map((pkg: UserCapabilityPackage) => (
              <div
                key={pkg.id}
                className="w-full text-left bg-[#121212] rounded-2xl p-4 hover:bg-[#1A1A1A] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <CapabilityPackageAvatar size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-white font-medium text-base truncate">{pkg.name}</h3>
                      <span className="px-2 py-0.5 bg-[#9254DE]/20 text-[#9254DE] text-xs rounded-full">
                        {pkg.category}
                      </span>
                      {pkg.isInstalled && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                          已配置
                        </span>
                      )}
                      {pkg.exclusiveId && (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                          {pkg.exclusiveId}
                        </span>
                      )}
                    </div>

                    {pkg.isInstalled && pkg.installedAgentId && (
                      <div className="text-green-400 text-xs mb-2">
                        配置到：{getInstalledAgentName(pkg.installedAgentId)}
                      </div>
                    )}

                    <p className="text-[#888888] text-sm line-clamp-2 mb-3">{pkg.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {pkg.capabilities.map((cap, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-[#1A1A1A] text-[#888888] text-xs rounded-full"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                    <div className="text-[#666666] text-xs mb-3">
                      购买于：{new Date(pkg.purchasedAt).toLocaleDateString('zh-CN')}
                    </div>

                    <div className="flex gap-2">
                      {!pkg.isInstalled ? (
                        <button
                          onClick={() => handleInstall(pkg)}
                          disabled={installMutation.isPending}
                          className="px-4 py-2 bg-[#9254DE] text-white rounded-xl text-sm font-medium hover:bg-[#722ED1] transition-colors disabled:opacity-50"
                        >
                          {installMutation.isPending ? '配置中...' : '配置到智能体'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUninstall(pkg)}
                          disabled={uninstallMutation.isPending}
                          className="px-4 py-2 bg-[#1A1A1A] text-white rounded-xl text-sm font-medium hover:bg-[#252525] transition-colors disabled:opacity-50"
                        >
                          {uninstallMutation.isPending ? '卸载中...' : '移除配置'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPkg && (
        <SelectAgentModal
          agents={myAgents}
          onSelect={handleSelectAgent}
          onClose={() => setSelectedPkg(null)}
        />
      )}
    </div>
  );
};

export default MyCapabilityPackagesPage;
