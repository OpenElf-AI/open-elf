import React, { useState } from 'react';
import { useAppStore } from '../store';
import { useToast } from '../components/Toast';

const CreateWorkPage: React.FC = () => {
  const { goBack } = useAppStore();
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['插画', '动画', '音乐', '视频', '3D作品', '其他'];

  const handleSubmit = () => {
    if (!title.trim()) {
      showToast('请输入作品标题', 'error');
      return;
    }
    if (!description.trim()) {
      showToast('请输入作品描述', 'error');
      return;
    }
    if (!category) {
      showToast('请选择作品分类', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      showToast('作品发布成功！', 'success');
      goBack();
    }, 1500);
  };

  return (
    <div className="bg-black min-h-screen pb-24">
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm z-10 border-b border-white/5">
        <div className="flex items-center gap-4 p-4">
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
          <h1 className="text-white font-semibold text-xl">发布作品</h1>
        </div>
      </div>

      <div className="p-5 space-y-6">
        <div className="bg-[#121212] rounded-2xl p-6 border border-white/5">
          <h2 className="text-white font-semibold text-lg mb-4">作品信息</h2>
          
          <div className="space-y-5">
            <div>
              <label className="text-[#888888] text-sm block mb-2">作品标题</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="请输入作品标题"
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div>
              <label className="text-[#888888] text-sm block mb-2">作品分类</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      category === cat
                        ? 'bg-primary text-black'
                        : 'bg-[#1A1A1A] text-[#888888] hover:bg-[#252525]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[#888888] text-sm block mb-2">作品描述</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="描述一下你的作品..."
                rows={4}
                className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-primary/50 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="text-[#888888] text-sm block mb-2">上传作品</label>
              <button className="w-full bg-[#1A1A1A] border-2 border-dashed border-white/20 rounded-xl py-8 flex flex-col items-center gap-3 hover:border-primary/40 transition-colors">
                <svg className="w-12 h-12 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="text-[#888888]">点击上传作品文件</span>
                <span className="text-[#666666] text-xs">支持图片、视频、音频格式</span>
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-primary text-black py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '发布中...' : '发布作品'}
        </button>
      </div>
    </div>
  );
};

export default CreateWorkPage;
