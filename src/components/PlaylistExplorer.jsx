import { useState, useMemo } from 'react';
import { Search, TrendingUp, Eye, DollarSign, Users, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { MOCK_PLAYLISTS, CATEGORIES, COUNTRIES } from '../data/mockData';
import { formatNumber, formatCurrency, formatKRW } from '../utils/revenue';

function PlaylistCard({ playlist, onClick }) {
  const growthData = playlist.growthChart.map((v, i) => ({ m: i + 1, v }));

  return (
    <div
      onClick={() => onClick(playlist)}
      className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] hover:border-[#444] transition-all cursor-pointer p-4 group"
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
          style={{ background: playlist.thumbnailColor }}
        >
          {playlist.channelName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm leading-tight truncate">{playlist.channelName}</div>
          <div className="text-gray-400 text-xs mt-0.5 truncate">{playlist.title}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-600 text-xs">{COUNTRIES.find(c => c.code === playlist.country)?.flag} {playlist.country}</span>
            <span className="text-gray-600 text-xs">·</span>
            <span className="text-gray-600 text-xs">{CATEGORIES.find(c => c.id === playlist.category)?.emoji} {CATEGORIES.find(c => c.id === playlist.category)?.label}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-green-400 font-bold text-sm">{formatCurrency(playlist.revenueData.monthly)}</div>
          <div className="text-gray-600 text-xs">월 수익</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="bg-[#111] rounded-lg p-2">
          <div className="text-blue-400 font-semibold text-xs">{formatNumber(playlist.subscribers)}</div>
          <div className="text-gray-600 text-xs">구독자</div>
        </div>
        <div className="bg-[#111] rounded-lg p-2">
          <div className="text-purple-400 font-semibold text-xs">{formatNumber(playlist.avgViewsPerVideo)}</div>
          <div className="text-gray-600 text-xs">평균 조회수</div>
        </div>
        <div className="bg-[#111] rounded-lg p-2">
          <div className="text-orange-400 font-semibold text-xs">{playlist.engagementRate}%</div>
          <div className="text-gray-600 text-xs">참여율</div>
        </div>
      </div>

      <div className="h-12">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={growthData}>
            <Line type="monotone" dataKey="v" stroke={playlist.thumbnailColor} strokeWidth={2} dot={false} />
            <Tooltip
              contentStyle={{ background: '#1f1f1f', border: '1px solid #333', borderRadius: 8, fontSize: 11 }}
              formatter={v => [v + '%', '성장도']}
              labelFormatter={l => `${l}개월`}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-1 mt-2">
        {playlist.tags.slice(0, 3).map(tag => (
          <span key={tag} className="px-2 py-0.5 bg-[#252525] text-gray-400 text-xs rounded-full">#{tag}</span>
        ))}
      </div>
    </div>
  );
}

function PlaylistDetail({ playlist, onClose }) {
  if (!playlist) return null;
  const country = COUNTRIES.find(c => c.code === playlist.country);
  const category = CATEGORIES.find(c => c.id === playlist.category);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1a1a1a] rounded-2xl border border-[#333] w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
              style={{ background: playlist.thumbnailColor }}
            >
              {playlist.channelName.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-white text-xl font-bold">{playlist.channelName}</h2>
              <p className="text-gray-400 text-sm">{playlist.title}</p>
              <div className="flex gap-3 mt-2">
                <span className="px-2 py-0.5 bg-[#252525] text-gray-300 text-xs rounded-full">{country?.flag} {country?.label}</span>
                <span className="px-2 py-0.5 bg-[#252525] text-gray-300 text-xs rounded-full">{category?.emoji} {category?.label}</span>
                <span className="px-2 py-0.5 bg-[#252525] text-gray-300 text-xs rounded-full">영상 {playlist.videoCount}개</span>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
          </div>

          {/* Revenue Detail */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: '월 수익', value: formatCurrency(playlist.revenueData.monthly), sub: formatKRW(playlist.revenueData.monthly), color: 'text-green-400' },
              { label: '연간 수익', value: formatCurrency(playlist.revenueData.yearly), sub: formatKRW(playlist.revenueData.yearly), color: 'text-green-300' },
              { label: '영상당 수익', value: formatCurrency(playlist.revenueData.perVideo), sub: 'per video', color: 'text-yellow-400' },
              { label: 'CPM', value: '$' + playlist.revenueData.cpm, sub: '1000회당', color: 'text-blue-400' },
            ].map(item => (
              <div key={item.label} className="bg-[#111] rounded-xl p-3 text-center">
                <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
                <div className="text-gray-500 text-xs">{item.sub}</div>
                <div className="text-gray-600 text-xs mt-1">{item.label}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="bg-[#111] rounded-xl p-4 mb-4">
            <h3 className="text-white font-semibold mb-2">📋 채널 분석</h3>
            <p className="text-gray-400 text-sm">{playlist.description}</p>
          </div>

          <div className="bg-[#111] rounded-xl p-4 mb-4">
            <h3 className="text-white font-semibold mb-2">🎯 성공 요인</h3>
            <p className="text-gray-400 text-sm">{playlist.whySuccessful}</p>
          </div>

          <div className="bg-[#111] rounded-xl p-4 mb-4">
            <h3 className="text-white font-semibold mb-3">📈 주요 지표</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['첫 영상 조회수', formatNumber(playlist.firstVideoViews)],
                ['평균 조회수', formatNumber(playlist.avgViewsPerVideo)],
                ['총 조회수', formatNumber(playlist.totalViews)],
                ['구독자 수', formatNumber(playlist.subscribers)],
                ['월간 성장률', '+' + playlist.growthRate + '%'],
                ['참여율', playlist.engagementRate + '%'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-500 text-sm">{k}</span>
                  <span className="text-white text-sm font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-xl p-4 border border-red-800/30">
            <h3 className="text-white font-semibold mb-2">💡 참조 채널로 시작하기</h3>
            <p className="text-gray-300 text-sm">이 채널을 벤치마킹하려면 <strong>콘텐츠 전략</strong> 탭에서 유사 채널 제안을 받아보세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlaylistExplorer() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [country, setCountry] = useState('all');
  const [sortBy, setSortBy] = useState('revenue');
  const [minRevenue, setMinRevenue] = useState(0);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    return MOCK_PLAYLISTS
      .filter(p => {
        if (category !== 'all' && p.category !== category) return false;
        if (country !== 'all' && p.country !== country) return false;
        if (p.revenueData.monthly < minRevenue) return false;
        if (search && !p.channelName.toLowerCase().includes(search.toLowerCase()) &&
            !p.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'revenue') return b.revenueData.monthly - a.revenueData.monthly;
        if (sortBy === 'views') return b.totalViews - a.totalViews;
        if (sortBy === 'subscribers') return b.subscribers - a.subscribers;
        if (sortBy === 'growth') return b.growthRate - a.growthRate;
        if (sortBy === 'engagement') return b.engagementRate - a.engagementRate;
        return 0;
      });
  }, [search, category, country, sortBy, minRevenue]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">🔍 플레이리스트 탐색</h1>
        <p className="text-gray-400 text-sm mt-1">카테고리·국가·수익별 필터링으로 참조 채널을 찾아보세요</p>
      </div>

      {/* Filters */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              className="w-full bg-[#111] border border-[#333] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
              placeholder="채널명 또는 플레이리스트 검색..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-red-500"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="revenue">수익순</option>
            <option value="views">조회수순</option>
            <option value="subscribers">구독자순</option>
            <option value="growth">성장률순</option>
            <option value="engagement">참여율순</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs transition-all ${
                category === cat.id ? 'bg-red-600 text-white' : 'bg-[#252525] text-gray-400 hover:text-white'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex gap-2">
            {COUNTRIES.map(c => (
              <button
                key={c.code}
                onClick={() => setCountry(c.code)}
                className={`px-2 py-1 rounded-lg text-xs transition-all ${
                  country === c.code ? 'bg-blue-600 text-white' : 'bg-[#252525] text-gray-400 hover:text-white'
                }`}
              >
                {c.flag} {c.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-gray-500 text-xs">최소 월 수익:</span>
            <select
              className="bg-[#111] border border-[#333] rounded-lg px-2 py-1 text-xs text-gray-300 focus:outline-none"
              value={minRevenue}
              onChange={e => setMinRevenue(Number(e.target.value))}
            >
              <option value={0}>전체</option>
              <option value={1000}>$1K+</option>
              <option value={10000}>$10K+</option>
              <option value={50000}>$50K+</option>
              <option value={100000}>$100K+</option>
            </select>
          </div>
        </div>
      </div>

      <div className="text-gray-500 text-xs">{filtered.length}개 결과</div>

      <div className="grid grid-cols-2 gap-4">
        {filtered.map(playlist => (
          <PlaylistCard key={playlist.id} playlist={playlist} onClick={setSelected} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-16 text-gray-600">
            <Globe size={40} className="mx-auto mb-3 opacity-30" />
            <p>해당 조건의 플레이리스트가 없습니다</p>
          </div>
        )}
      </div>

      <PlaylistDetail playlist={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
