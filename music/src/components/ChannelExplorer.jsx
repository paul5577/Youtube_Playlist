import { useState, useMemo } from 'react';
import { Search, Shield, ShieldAlert, Music } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { MUSIC_PLAYLISTS, MUSIC_GENRES, MUSIC_CPM_BY_COUNTRY } from '../data/musicData';
import { fmt, usd, krw } from '../utils/musicRevenue';

function CopyrightBadge({ safe }) {
  return safe
    ? <span className="flex items-center gap-1 text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded-full"><Shield size={10}/>저작권 안전</span>
    : <span className="flex items-center gap-1 text-xs text-red-400 bg-red-900/30 px-2 py-0.5 rounded-full"><ShieldAlert size={10}/>ContentID 주의</span>;
}

function Card({ ch, onClick }) {
  const genre = MUSIC_GENRES.find(g => g.id === ch.genre);
  const data  = ch.growthChart.map((v,i) => ({ m: i+1, v }));
  return (
    <div onClick={() => onClick(ch)}
      className="bg-[#111118] rounded-xl border border-[#1e1e2e] hover:border-[#3a3a5e] transition-all cursor-pointer p-4 group">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
          style={{ background: `linear-gradient(135deg,${ch.color}aa,${ch.color})` }}>
          {ch.channelName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm truncate">{ch.channelName}</div>
          <div className="text-gray-500 text-xs truncate">{ch.title}</div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: ch.color + '33', color: ch.color }}>{genre?.emoji} {genre?.label}</span>
            <CopyrightBadge safe={ch.copyrightSafe} />
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-purple-400 font-bold text-sm">{usd(ch.revenue.totalMonthly)}</div>
          <div className="text-gray-600 text-xs">월 합산</div>
        </div>
      </div>

      {/* Revenue breakdown */}
      <div className="flex gap-1 mb-3">
        {[
          { label: '광고', val: ch.revenue.adMonthly, color: '#ef4444' },
          { label: '스트리밍', val: ch.revenue.musicMonthly, color: '#f59e0b' },
          { label: '멤버십', val: ch.revenue.membershipMonthly, color: '#10b981' },
        ].map(r => (
          <div key={r.label} className="flex-1 bg-[#0d0d14] rounded-lg p-2 text-center">
            <div className="font-semibold text-xs" style={{ color: r.color }}>{usd(r.val)}</div>
            <div className="text-gray-600 text-xs">{r.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-1.5 mb-3 text-center text-xs">
        <div className="bg-[#0d0d14] rounded-lg p-1.5">
          <div className="text-blue-400 font-semibold">{fmt(ch.subscribers)}</div>
          <div className="text-gray-600">구독자</div>
        </div>
        <div className="bg-[#0d0d14] rounded-lg p-1.5">
          <div className="text-pink-400 font-semibold">{fmt(ch.monthlyListeners)}</div>
          <div className="text-gray-600">월 청취자</div>
        </div>
        <div className="bg-[#0d0d14] rounded-lg p-1.5">
          <div className="text-orange-400 font-semibold">+{ch.growthRate}%</div>
          <div className="text-gray-600">성장률</div>
        </div>
      </div>

      <div className="h-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line type="monotone" dataKey="v" stroke={ch.color} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DetailModal({ ch, onClose }) {
  if (!ch) return null;
  const genre = MUSIC_GENRES.find(g => g.id === ch.genre);
  const country = MUSIC_CPM_BY_COUNTRY[ch.country];
  const total = ch.revenueBreakdown.ad + ch.revenueBreakdown.music + ch.revenueBreakdown.membership;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#111118] rounded-2xl border border-[#2a2a3e] w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
              style={{ background: `linear-gradient(135deg,${ch.color}88,${ch.color})` }}>
              {ch.channelName.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-white text-xl font-bold">{ch.channelName}</h2>
              <div className="text-gray-400 text-sm">{ch.channelHandle}</div>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: ch.color + '33', color: ch.color }}>{genre?.emoji} {genre?.label}</span>
                <CopyrightBadge safe={ch.copyrightSafe} />
                <span className="px-2 py-0.5 bg-[#252535] text-gray-300 rounded-full text-xs">{country?.flag} {ch.country}</span>
                <span className="px-2 py-0.5 bg-[#252535] text-gray-300 rounded-full text-xs">{ch.contentType}</span>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">✕</button>
          </div>

          {/* Revenue */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'YouTube 광고', val: ch.revenue.adMonthly, color: '#ef4444', pct: ch.revenueBreakdown.ad },
              { label: '음원/스트리밍', val: ch.revenue.musicMonthly, color: '#f59e0b', pct: ch.revenueBreakdown.music },
              { label: '멤버십/슈퍼챗', val: ch.revenue.membershipMonthly, color: '#10b981', pct: ch.revenueBreakdown.membership },
            ].map(r => (
              <div key={r.label} className="bg-[#0d0d14] rounded-xl p-3 text-center border border-[#1e1e2e]">
                <div className="text-lg font-bold" style={{ color: r.color }}>{usd(r.val)}</div>
                <div className="text-gray-500 text-xs">{krw(r.val)}</div>
                <div className="text-gray-400 text-xs mt-1">{r.label}</div>
                <div className="mt-2 h-1.5 bg-[#1e1e2e] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: r.pct + '%', background: r.color }} />
                </div>
                <div className="text-gray-600 text-xs mt-1">{r.pct}%</div>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-3 mb-5 text-center border border-purple-700/20">
            <div className="text-gray-400 text-xs mb-1">월 합산 수익</div>
            <div className="text-white text-2xl font-bold">{usd(ch.revenue.totalMonthly)}</div>
            <div className="text-purple-300 text-sm">{krw(ch.revenue.totalMonthly)}</div>
            <div className="text-gray-600 text-xs mt-1">연간 {usd(ch.revenue.totalMonthly * 12)}</div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-[#0d0d14] rounded-xl p-4 border border-[#1e1e2e]">
              <h4 className="text-gray-400 text-xs mb-3">📊 채널 지표</h4>
              <div className="space-y-2">
                {[
                  ['구독자', fmt(ch.subscribers)],
                  ['총 조회수', fmt(ch.totalViews)],
                  ['평균 조회수', fmt(ch.avgViewsPerVideo)],
                  ['첫 영상 조회수', fmt(ch.firstVideoViews)],
                  ['월 청취자(스트리밍)', fmt(ch.monthlyListeners)],
                  ['월 성장률', '+' + ch.growthRate + '%'],
                  ['참여율', ch.engagementRate + '%'],
                  ['CPM', '$' + ch.revenue.cpm],
                ].map(([k,v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-500">{k}</span>
                    <span className="text-white font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#0d0d14] rounded-xl p-4 border border-[#1e1e2e]">
              <h4 className="text-gray-400 text-xs mb-3">🎯 운영 정보</h4>
              <div className="space-y-2">
                {[
                  ['콘텐츠 유형', ch.contentType],
                  ['업로드 주기', ch.uploadFreq],
                  ['저작권 안전', ch.copyrightSafe ? '✅ 안전' : '⚠️ 주의 필요'],
                  ['영상 수', ch.videoCount + '개'],
                ].map(([k,v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-500">{k}</span>
                    <span className="text-white font-medium">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-[#1e1e2e]">
                <div className="text-gray-500 text-xs mb-1">태그</div>
                <div className="flex flex-wrap gap-1">
                  {ch.tags.map(t => (
                    <span key={t} className="px-1.5 py-0.5 bg-[#1e1e2e] text-gray-400 text-xs rounded-full">#{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0d0d14] rounded-xl p-4 mb-3 border border-[#1e1e2e]">
            <h4 className="text-white text-sm font-semibold mb-2">📋 채널 분석</h4>
            <p className="text-gray-400 text-sm">{ch.description}</p>
          </div>
          <div className="bg-[#0d0d14] rounded-xl p-4 border border-[#1e1e2e]">
            <h4 className="text-white text-sm font-semibold mb-2">🏆 성공 핵심 요인</h4>
            <p className="text-gray-400 text-sm">{ch.successKey}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChannelExplorer() {
  const [search,  setSearch]  = useState('');
  const [genre,   setGenre]   = useState('all');
  const [copy,    setCopy]    = useState('all');
  const [sortBy,  setSortBy]  = useState('revenue');
  const [minRev,  setMinRev]  = useState(0);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    return MUSIC_PLAYLISTS
      .filter(p => {
        if (genre !== 'all' && p.genre !== genre) return false;
        if (copy === 'safe' && !p.copyrightSafe) return false;
        if (copy === 'risky' && p.copyrightSafe) return false;
        if (p.revenue.totalMonthly < minRev) return false;
        if (search && !p.channelName.toLowerCase().includes(search.toLowerCase()) &&
            !p.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a,b) => {
        if (sortBy === 'revenue')    return b.revenue.totalMonthly - a.revenue.totalMonthly;
        if (sortBy === 'music')      return b.revenue.musicMonthly - a.revenue.musicMonthly;
        if (sortBy === 'views')      return b.totalViews - a.totalViews;
        if (sortBy === 'listeners')  return b.monthlyListeners - a.monthlyListeners;
        if (sortBy === 'growth')     return b.growthRate - a.growthRate;
        return 0;
      });
  }, [search, genre, copy, sortBy, minRev]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-white">🔍 음악 채널 탐색</h1>
        <p className="text-gray-500 text-sm mt-1">장르·저작권·수익별 필터로 참조 채널을 찾아보세요</p>
      </div>

      {/* Filters */}
      <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input className="w-full bg-[#0d0d14] border border-[#2a2a3e] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-purple-500"
              placeholder="채널명 검색..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="bg-[#0d0d14] border border-[#2a2a3e] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-purple-500"
            value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="revenue">합산 수익순</option>
            <option value="music">스트리밍 수익순</option>
            <option value="views">조회수순</option>
            <option value="listeners">청취자순</option>
            <option value="growth">성장률순</option>
          </select>
          <select className="bg-[#0d0d14] border border-[#2a2a3e] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-purple-500"
            value={copy} onChange={e => setCopy(e.target.value)}>
            <option value="all">저작권 전체</option>
            <option value="safe">✅ 안전만</option>
            <option value="risky">⚠️ 주의 채널</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {MUSIC_GENRES.map(g => (
            <button key={g.id} onClick={() => setGenre(g.id)}
              className={`px-2.5 py-1 rounded-full text-xs transition-all ${genre === g.id ? 'text-white' : 'bg-[#1e1e2e] text-gray-500 hover:text-gray-200'}`}
              style={genre === g.id ? { background: g.color } : {}}>
              {g.emoji} {g.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-gray-600 text-xs">최소 월 합산 수익:</span>
          <select className="bg-[#0d0d14] border border-[#2a2a3e] rounded-lg px-2 py-1 text-xs text-gray-300 focus:outline-none"
            value={minRev} onChange={e => setMinRev(Number(e.target.value))}>
            <option value={0}>전체</option>
            <option value={10000}>$10K+</option>
            <option value={50000}>$50K+</option>
            <option value={100000}>$100K+</option>
            <option value={500000}>$500K+</option>
          </select>
          <span className="text-gray-600 text-xs ml-auto">{filtered.length}개 채널</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filtered.map(ch => <Card key={ch.id} ch={ch} onClick={setSelected} />)}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-16 text-gray-700">
            <Music size={40} className="mx-auto mb-3 opacity-30" />
            <p>조건에 맞는 채널이 없습니다</p>
          </div>
        )}
      </div>
      <DetailModal ch={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
