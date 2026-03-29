import React, { useState } from 'react';
import { useAppStore } from '../store';
import { useToast } from '../components/Toast';

const DataAnalyticsPage: React.FC = () => {
  const { goBack } = useAppStore();
  const { showToast } = useToast();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  const stats = {
    totalViews: 1285,
    totalSales: 42,
    totalRevenue: 1260,
    conversionRate: 3.2
  };

  const handleExport = () => {
    showToast('数据报表导出成功', 'success');
  };

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
            <h1 className="text-white font-semibold text-xl">数据报表</h1>
          </div>
          <button
            onClick={handleExport}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-6">
        <div className="flex gap-2">
          {[
            { key: '7d', label: '7天' },
            { key: '30d', label: '30天' },
            { key: '90d', label: '90天' }
          ].map(range => (
            <button
              key={range.key}
              onClick={() => setTimeRange(range.key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                timeRange === range.key
                  ? 'bg-primary text-black'
                  : 'bg-[#1A1A1A] text-[#888888] hover:bg-[#252525]'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#121212] rounded-2xl p-5 border border-white/5">
            <div className="text-[#888888] text-sm mb-1">浏览量</div>
            <div className="text-white text-3xl font-bold mb-1">{stats.totalViews.toLocaleString()}</div>
            <div className="text-green-500 text-xs">+12.5%</div>
          </div>
          <div className="bg-[#121212] rounded-2xl p-5 border border-white/5">
            <div className="text-[#888888] text-sm mb-1">销售量</div>
            <div className="text-white text-3xl font-bold mb-1">{stats.totalSales}</div>
            <div className="text-green-500 text-xs">+8.3%</div>
          </div>
          <div className="bg-[#121212] rounded-2xl p-5 border border-white/5">
            <div className="text-[#888888] text-sm mb-1">收入</div>
            <div className="text-yellow-500 text-3xl font-bold mb-1">¥{stats.totalRevenue}</div>
            <div className="text-green-500 text-xs">+15.2%</div>
          </div>
          <div className="bg-[#121212] rounded-2xl p-5 border border-white/5">
            <div className="text-[#888888] text-sm mb-1">转化率</div>
            <div className="text-primary text-3xl font-bold mb-1">{stats.conversionRate}%</div>
            <div className="text-green-500 text-xs">+2.1%</div>
          </div>
        </div>

        <div className="bg-[#121212] rounded-2xl p-5 border border-white/5">
          <h2 className="text-white font-semibold text-lg mb-4">趋势图表</h2>
          <div className="h-48 bg-[#1A1A1A] rounded-xl flex items-center justify-center">
            <div className="text-[#666666] text-center">
              <svg className="w-12 h-12 mx-auto mb-2 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p>图表数据加载中</p>
            </div>
          </div>
        </div>

        <div className="bg-[#121212] rounded-2xl p-5 border border-white/5">
          <h2 className="text-white font-semibold text-lg mb-4">智能体排行</h2>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-3 bg-[#1A1A1A] rounded-xl">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  i === 1 ? 'bg-yellow-500 text-black' :
                  i === 2 ? 'bg-gray-400 text-black' :
                  'bg-orange-600 text-white'
                }`}>
                  {i}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">智能体 {i}</div>
                  <div className="text-[#666666] text-xs">{100 - i * 10} 次销售</div>
                </div>
                <div className="text-yellow-500 font-semibold">¥{300 - i * 50}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataAnalyticsPage;
