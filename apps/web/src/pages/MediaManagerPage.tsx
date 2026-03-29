import React, { useState } from 'react';
import { useAppStore } from '../store';
import { useToast } from '../components/Toast';

interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  size: string;
  createdAt: string;
  thumbnail?: string;
}

const MediaManagerPage: React.FC = () => {
  const { goBack } = useAppStore();
  const { showToast } = useToast();
  const [activeType, setActiveType] = useState<'all' | 'image' | 'video' | 'audio'>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);

  const [items, setItems] = useState<MediaItem[]>([
    { id: '1', name: '智能体头像1.png', type: 'image', size: '2.1 MB', createdAt: '2024-01-15' },
    { id: '2', name: '宣传视频.mp4', type: 'video', size: '128 MB', createdAt: '2024-01-10' },
    { id: '3', name: '背景音乐.mp3', type: 'audio', size: '3.5 MB', createdAt: '2024-01-08' },
    { id: '4', name: '封面图设计.jpg', type: 'image', size: '4.8 MB', createdAt: '2024-01-05' },
  ]);

  const toggleSelect = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleUpload = () => {
    showToast('上传功能开发中', 'info');
  };

  const handleDelete = () => {
    setItems(items.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
    setSelectMode(false);
    showToast('已删除选中的文件', 'success');
  };

  const filteredItems =
    activeType === 'all' ? items : items.filter(item => item.type === activeType);

  return (
    <div className="bg-black min-h-screen pb-24">
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm z-10 border-b border-white/5">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button onClick={goBack} className="text-[#888888] hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-white font-semibold text-xl">素材管理</h1>
          </div>
          <div className="flex gap-2">
            {selectMode ? (
              <button
                onClick={() => {
                  setSelectMode(false);
                  setSelectedItems([]);
                }}
                className="text-[#888888] hover:text-white transition-colors text-sm font-medium"
              >
                取消
              </button>
            ) : (
              <button
                onClick={() => setSelectMode(true)}
                className="text-[#888888] hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 00-2-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'all', label: '全部' },
            { key: 'image', label: '图片' },
            { key: 'video', label: '视频' },
            { key: 'audio', label: '音频' },
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

        <button
          onClick={handleUpload}
          className="w-full bg-[#121212] border-2 border-dashed border-primary/40 rounded-2xl py-8 flex flex-col items-center gap-3 hover:border-primary/60 transition-colors"
        >
          <svg
            className="w-12 h-12 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span className="text-primary font-semibold">上传素材</span>
          <span className="text-[#666666] text-xs">支持图片、视频、音频格式</span>
        </button>

        {selectMode && selectedItems.length > 0 && (
          <button
            onClick={handleDelete}
            className="w-full bg-red-500 text-white py-4 rounded-xl font-semibold hover:bg-red-600 transition-colors active:scale-[0.98]"
          >
            删除 {selectedItems.length} 个文件
          </button>
        )}

        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <div className="w-24 h-24 bg-gradient-to-br from-[#1A1A1A] to-[#252525] rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-black/30">
              <div className="text-5xl">📁</div>
            </div>
            <h3 className="text-white font-semibold text-xl mb-3">还没有素材</h3>
            <p className="text-[#666666] text-base text-center mb-8 max-w-xs leading-relaxed">
              上传你的素材文件，方便在创建智能体时使用
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className={`w-full bg-[#121212] rounded-2xl p-4 border border-white/5 transition-all duration-300 hover:bg-[#151515] ${
                  selectMode && selectedItems.includes(item.id) ? 'border-primary' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {selectMode && (
                    <button
                      onClick={() => toggleSelect(item.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        selectedItems.includes(item.id)
                          ? 'bg-primary border-primary'
                          : 'border-[#666666]'
                      }`}
                    >
                      {selectedItems.includes(item.id) && (
                        <svg
                          className="w-4 h-4 text-black"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                  )}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-[#1A1A1A] rounded-xl flex items-center justify-center">
                      {item.type === 'image' && (
                        <svg
                          className="w-6 h-6 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                      {item.type === 'video' && (
                        <svg
                          className="w-6 h-6 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                      {item.type === 'audio' && (
                        <svg
                          className="w-6 h-6 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 18V5l12-3v13M9 18c0 0 1.56 0 2.55-.588M9 18c0 0-2.55-.588-2.55-.588m5.1 0a4.5 4.5 0 00-5.1 0m5.1 0c.99.588 2.55.588 2.55.588m-5.1 0H9"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-base mb-1 truncate">{item.name}</h3>
                    <div className="flex items-center gap-3 text-[#666666] text-xs">
                      <span>{item.size}</span>
                      <span>•</span>
                      <span>{item.createdAt}</span>
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

export default MediaManagerPage;
