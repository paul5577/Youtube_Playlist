import { MUSIC_PLAYLISTS, MUSIC_GENRES, REVENUE_TYPES } from '../data/musicData';
import { fmt, usd } from '../utils/musicRevenue';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';

const COLORS = ['#7c3aed','#ec4899','#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6','#0ea5e9'];

export default function Dashboard() {
  const totalAdRev  = MUSIC_PLAYLISTS.reduce((s,p) => s + p.revenue.adMonthly, 0);
  const totalMusRev = MUSIC_PLAYLISTS.reduce((s,p) => s + p.revenue.musicMonthly, 0);
  const totalMemRev = MUSIC_PLAYLISTS.reduce((s,p) => s + p.revenue.membershipMonthly, 0);
  const totalRev    = totalAdRev + totalMusRev + totalMemRev;
  const totalViews  = MUSIC_PLAYLISTS.reduce((s,p) => s + p.totalViews, 0);
  const totalSubs   = MUSIC_PLAYLISTS.reduce((s,p) => s + p.subscribers, 0);

  // 장르별 월 수익
  const genreData = MUSIC_GENRES.filter(g => g.id !== 'all').map(g => {
    const pl = MUSIC_PLAYLISTS.filter(p => p.genre === g.id);
    return { name: g.label, revenue: pl.reduce((s,p) => s + p.revenue.totalMonthly, 0), color: g.color };
  }).filter(d => d.revenue > 0).sort((a,b) => b.revenue - a.revenue);

  // 수익 구성 파이
  const revPie = [
    { name: 'YouTube 광고', value: totalAdRev, color: '#ef4444' },
    { name: '음원/스트리밍', value: totalMusRev, color: '#f59e0b' },
    { name: '멤버십/후원', value: totalMemRev, color: '#10b981' },
  ];

  // 저작권 안전 vs 위험 비율
  const safeCount   = MUSIC_PLAYLISTS.filter(p => p.copyrightSafe).length;
  const unsafeCount = MUSIC_PLAYLISTS.length - safeCount;

  const top5 = [...MUSIC_PLAYLISTS].sort((a,b) => b.revenue.totalMonthly - a.revenue.totalMonthly).slice(0,5);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">🎵 음악 채널 대시보드</h1>
        <p className="text-gray-500 text-sm mt-1">분석 채널 {MUSIC_PLAYLISTS.length}개 · 광고+스트리밍+멤버십 통합 수익</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '총 월 수익 (합산)', value: usd(totalRev), sub: '광고+스트리밍+멤버십', color: 'text-purple-400', bg: 'bg-purple-900/20' },
          { label: '총 조회수', value: fmt(totalViews), sub: '누적', color: 'text-blue-400', bg: 'bg-blue-900/20' },
          { label: '총 구독자', value: fmt(totalSubs), sub: '합산', color: 'text-pink-400', bg: 'bg-pink-900/20' },
          { label: '저작권 안전 채널', value: `${safeCount}/${MUSIC_PLAYLISTS.length}`, sub: '리스크 낮음', color: 'text-green-400', bg: 'bg-green-900/20' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-white/5`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 text-xs mt-0.5">{s.sub}</div>
            <div className="text-gray-400 text-xs mt-2">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* 장르별 수익 */}
        <div className="col-span-2 bg-[#111118] rounded-xl border border-[#1e1e2e] p-4">
          <h3 className="text-white font-semibold mb-4">🎼 장르별 월 수익</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={genreData}>
              <XAxis dataKey="name" tick={{ fill: '#555', fontSize: 10 }} />
              <YAxis tick={{ fill: '#555', fontSize: 10 }} tickFormatter={v => '$' + (v/1000).toFixed(0) + 'K'} />
              <Tooltip contentStyle={{ background:'#1a1a2e', border:'1px solid #333', borderRadius:8 }}
                formatter={v => ['$' + v.toLocaleString(), '월 수익']} />
              <Bar dataKey="revenue" radius={[4,4,0,0]}>
                {genreData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 수익 구조 파이 */}
        <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4">
          <h3 className="text-white font-semibold mb-3">💰 수익 구조</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={revPie} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                {revPie.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background:'#1a1a2e', border:'1px solid #333', borderRadius:8 }}
                formatter={v => ['$' + v.toLocaleString(), '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {revPie.map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-gray-400 text-xs">{d.name}</span>
                </div>
                <span className="text-white text-xs font-medium">{usd(d.value)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[#2a2a3e] text-center">
            <div className="text-gray-500 text-xs">스트리밍 수익 비율</div>
            <div className="text-yellow-400 font-bold text-lg">
              {Math.round(totalMusRev / totalRev * 100)}%
            </div>
            <div className="text-gray-600 text-xs">광고 수익만이 전부가 아님!</div>
          </div>
        </div>
      </div>

      {/* TOP 5 + 저작권 경고 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4">
          <h3 className="text-white font-semibold mb-4">🏆 TOP 5 수익 채널</h3>
          <div className="space-y-3">
            {top5.map((ch, i) => (
              <div key={ch.id} className="flex items-center gap-3">
                <div className="text-gray-600 text-sm w-4 flex-shrink-0">{i+1}</div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: ch.color }}>{ch.channelName.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{ch.channelName}</div>
                  <div className="text-gray-600 text-xs">{MUSIC_GENRES.find(g=>g.id===ch.genre)?.emoji} {MUSIC_GENRES.find(g=>g.id===ch.genre)?.label}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-purple-400 font-bold text-sm">{usd(ch.revenue.totalMonthly)}</div>
                  <div className="text-gray-600 text-xs">광고+스트리밍</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 핵심 인사이트 */}
        <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4">
          <h3 className="text-white font-semibold mb-4">💡 핵심 인사이트</h3>
          <div className="space-y-3">
            {[
              { icon:'🎙️', title: '스트리밍 수익이 광고보다 클 수 있다', desc: 'Hillsong, YOASOBI는 스트리밍이 광고의 1.5-2배', color: 'border-yellow-500/30 bg-yellow-900/10' },
              { icon:'😴', title: '수면음악 = 숨겨진 유튜브 프리미엄 금광', desc: '8시간 시청 → YouTube Premium 수익 폭발', color: 'border-blue-500/30 bg-blue-900/10' },
              { icon:'☕', title: 'Lo-fi 라이브 = 가장 효율적인 음악 채널', desc: '영상 1개로 24시간 무한 조회수 누적', color: 'border-purple-500/30 bg-purple-900/10' },
              { icon:'⚠️', title: 'K-pop/J-pop 팬채널은 저작권 위험', desc: 'ContentID로 수익 원곡자에게 이전됨', color: 'border-red-500/30 bg-red-900/10' },
            ].map(item => (
              <div key={item.title} className={`rounded-lg border p-2.5 ${item.color}`}>
                <div className="flex items-start gap-2">
                  <span className="text-base">{item.icon}</span>
                  <div>
                    <div className="text-white text-xs font-semibold">{item.title}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{item.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
