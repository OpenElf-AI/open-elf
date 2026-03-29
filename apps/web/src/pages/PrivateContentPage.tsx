import React, { useState } from 'react';
import { useAppStore } from '../store';
import { useToast } from '../components/Toast';

interface PrivateItem {
  id: string;
  title: string;
  type: 'note' | 'file' | 'link';
  createdAt: string;
  preview?: string;
}

const PrivateContentPage: React.FC = () => {
  const { goBack, setCurrentView } = useAppStore();
  const { showToast } = useToast();
  const [activeType, setActiveType] = useState<'all' | 'note' | 'file' | 'link'>('all');

  const [items, setItems] = useState<PrivateItem[]>([
    {
      id: '1',
      title: '个人笔记 - 想法记录',
      type: 'note',
      createdAt: '2024-01-15',
      preview: '今天的一些想法和灵感...'
    },
    {
      id: '2',
      title: '重要文件备份',
      type: 'file',
      createdAt: '2024-01-10',
      preview: '2.5 MB'
    }
  ]);

  const handleCreateNote = () => {
    setCurrentView('profile');
    showToast('创建笔记功能开发中', 'info');
  };

  const handleUploadFile = () => {
    setCurrentView('profile');
    showToast('文件上传功能开发中', 'info');
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    showToast('已删除', 'success');
  };

  const filteredItems = activeType === 'all' 
    ? items 
    : items.filter(item => item.type === activeType);

  return (
    <div className="bg-black min-h-screen pb-24">
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm z-10 border-b border-white/5">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={goBack}
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
            <h1 className="text-white font-semibold text-xl">私密内容</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreateNote}
              className="text-[#888888] hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={handleUploadFile}
              className="text-[#888888] hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'all', label: '全部' },
            { key: 'note', label: '笔记' },
            { key: 'file', label: '文件' },
            { key: 'link', label: '链接' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveType(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeType === tab.key
                  ? 'bg-primary text-black'
                  : 'bg-[#1A1A1A] text-[#888888] hover:bg-[#252525]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <div className="w-24 h-24 bg-gradient-to-br from-[#1A1A1A] to-[#252525] rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-black/30">
              <div className="text-5xl">🔒</div>
            </div>
            <h3 className="text-white font-semibold text-xl mb-3">还没有私密内容</h3>
            <p className="text-[#666666] text-base text-center mb-8 max-w-xs leading-relaxed">
              你的私密内容将安全地存储在这里
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCreateNote}
                className="bg-gradient-to-r from-primary to-[#4096ff] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-[#0958d9] hover:to-primary active:scale-[0.97] shadow-lg shadow-primary/20"
              >
                创建笔记
              </button>
              <button
                onClick={handleUploadFile}
                className="bg-gradient-to-r from-[#1A1A1A] to-[#252525] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:from-[#252525] hover:to-[#333333] active:scale-[0.97] border border-white/10"
              >
                上传文件
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="w-full bg-[#121212] rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all duration-300 hover:bg-[#151515] active:scale-[0.99] shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30"
              >
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-[#1A1A1A] rounded-xl flex items-center justify-center">
                      {item.type === 'note' && (
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      )}
                      {item.type === 'file' && (
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      )}
                      {item.type === 'link' && (
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-base mb-1 truncate">{item.title}</h3>
                        {item.preview && (
                          <p className="text-[#888888] text-sm mb-2 line-clamp-1">{item.preview}</p>
                        )}
                        <div className="text-[#666666] text-xs">{item.createdAt}</div>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-[#666666] hover:text-red-500 transition-colors p-1"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivateContentPage;
