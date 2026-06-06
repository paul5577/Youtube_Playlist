import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MUSIC_GENRES, MUSIC_CPM_BY_COUNTRY, GENRE_REVENUE_PROFILE } from '../data/musicData';
import { calcRevenue, calcStreamingRevenue, usd, krw, fmt } from '../utils/musicRevenue';

export default function RevenueAnalyzer() {
  const [genre,     setGenre]     = useState('lofi');
  const [country,   setCountry]   = useState('KR');
  const [views,     setViews]     = useState(100000);
  const [listeners, setListeners] = useState(50000);
  const [videos,    setVideos]    = useState(4);

  const g     = GENRE_REVENUE_PROFILE[genre] || {};
  const c     = MUSIC_CPM_BY_COUNTRY[country] || MUSIC_CPM_BY_COUNTRY['US'];
  const cpm   = (c.cpm * (g.cpmMult || 1)).toFixed(2);

  const adRev      = calcRevenue(views * videos, genre, country);
  const streamRev  = calcStreamingRevenue(listeners, country);
  const totalRev   = adRev + streamRev;

  // 수익 시뮬레이션 (3/6/12개월)
  const projection = [3, 6, 12].map(months => ({
    period: months + '개월',
    ad: Math.round(adRev * months * (1 + months * 0.03)),
    streaming: Math.round(streamRev * months * (1 + months * 0.05)),
  }));

  // 국가별 비교
  const countryCompare = Object.entries(MUSIC_CPM_BY_COUNTRY).map(([code, info]) => ({
    name: info.flag + ' ' + info.label,
    ad: calcRevenue(views * videos, genre, code),
    streaming: calcStreamingRevenue(listeners, code),
  })).sort((a, b) => (b.ad + b.streaming) - (a.ad + a.streaming));

  // 장르별 비교
  const genreCompare = MUSIC_GENRES.filter(g => g.id !== 'all').map(gen => ({
    name: gen.emoji + ' ' + gen.label,
    revenue: calcRevenue(views * videos, gen.id, country),
    color: gen.color,
  })).sort((a,b) => b.revenue - a.revenue);

  const genreInfo = MUSIC_GENRES.find(g => g.id === genre);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">💰 수익 시뮬레이터</h1>
        <p className="text-gray-500 text-sm mt-1">장르·국가·조회수를 입력하면 광고+스트리밍 수익을 계산해드립니다</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* 입력 */}
        <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4 space-y-4">
          <h3 className="text-white font-semibold">⚙️ 조건 설정</h3>

          <div>
            <label className="text-gray-500 text-xs mb-2 block">음악 장르</label>
            <div className="grid grid-cols-2 gap-1">
              {MUSIC_GENRES.filter(g => g.id !== 'all').map(g => (
                <button key={g.id} onClick={() => setGenre(g.id)}
                  className={`px-2 py-1.5 rounded-lg text-xs text-left transition-all ${genre === g.id ? 'text-white' : 'bg-[#1e1e2e] text-gray-500 hover:text-gray-300'}`}
                  style={genre === g.id ? { background: g.color } : {}}>
                  {g.emoji} {g.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-gray-500 text-xs mb-2 block">타겟 국가</label>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(MUSIC_CPM_BY_COUNTRY).map(([code, info]) => (
                <button key={code} onClick={() => setCountry(code)}
                  className={`px-2 py-1.5 rounded-lg text-xs transition-all ${country === code ? 'bg-purple-600 text-white' : 'bg-[#1e1e2e] text-gray-500 hover:text-gray-300'}`}>
                  {info.flag} {info.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-gray-500 text-xs mb-1 block">영상당 월 조회수</label>
              <input type="range" min={1000} max={10000000} step={1000} value={views}
                onChange={e => setViews(Number(e.target.value))}
                className="w-full accent-purple-500" />
              <div className="text-purple-400 text-sm font-semibold text-center">{fmt(views)}</div>
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">월 스트리밍 청취자</label>
              <input type="range" min={0} max={5000000} step={1000} value={listeners}
                onChange={e => setListeners(Number(e.target.value))}
                className="w-full accent-yellow-500" />
              <div className="text-yellow-400 text-sm font-semibold text-center">{fmt(listeners)}</div>
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">월 업로드 영상 수</label>
              <input type="range" min={1} max={30} step={1} value={videos}
                onChange={e => setVideos(Number(e.target.value))}
                className="w-full accent-green-500" />
              <div className="text-green-400 text-sm font-semibold text-center">{videos}개/월</div>
            </div>
          </div>
        </div>

        {/* 결과 */}
        <div className="col-span-2 space-y-4">
          {/* 주요 결과 */}
          <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4">
            <h3 className="text-white font-semibold mb-4">📊 예상 월 수익 — <span style={{ color: genreInfo?.color }}>{genreInfo?.emoji} {genreInfo?.label}</span> · {MUSIC_CPM_BY_COUNTRY[country]?.flag} {MUSIC_CPM_BY_COUNTRY[country]?.label}</h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'YouTube 광고', val: adRev, sub: `CPM $${cpm}`, color: '#ef4444' },
                { label: '스트리밍 수익', val: streamRev, sub: `${fmt(listeners)} 청취자`, color: '#f59e0b' },
                { label: '월 합산', val: totalRev, sub: krw(totalRev), color: '#7c3aed' },
                { label: '연간 예상', val: totalRev * 12, sub: krw(totalRev * 12), color: '#10b981' },
              ].map(item => (
                <div key={item.label} className="bg-[#0d0d14] rounded-xl p-3 text-center border border-[#1e1e2e]">
                  <div className="text-lg font-bold" style={{ color: item.color }}>{usd(item.val)}</div>
                  <div className="text-gray-600 text-xs">{item.sub}</div>
                  <div className="text-gray-500 text-xs mt-1">{item.label}</div>
                </div>
              ))}
            </div>

            {/* 저작권 정보 */}
            <div className={`mt-3 rounded-lg p-2.5 flex items-center gap-2 text-sm ${g.copyrightRisk === '낮음' ? 'bg-green-900/20 border border-green-700/30' : g.copyrightRisk === '높음' || g.copyrightRisk === '매우높음' ? 'bg-red-900/20 border border-red-700/30' : 'bg-yellow-900/20 border border-yellow-700/30'}`}>
              <span>{g.copyrightRisk === '낮음' ? '✅' : g.copyrightRisk === '높음' || g.copyrightRisk === '매우높음' ? '🚨' : '⚠️'}</span>
              <div>
                <span className="text-white font-medium">저작권 리스크: {g.copyrightRisk}</span>
                {g.contentId && <span className="ml-2 text-gray-400 text-xs">· ContentID 적용 시 광고 수익 원곡자에게 이전됨</span>}
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              {[
                { label: '라이브 스트리밍 적합', val: g.liveFriendly },
                { label: 'YouTube Shorts 적합', val: g.shorts },
              ].map(item => (
                <span key={item.label} className={`px-2.5 py-1 rounded-full text-xs ${item.val ? 'bg-green-900/30 text-green-400' : 'bg-[#1e1e2e] text-gray-600'}`}>
                  {item.val ? '✅' : '❌'} {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* 성장 예상 */}
          <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4">
            <h3 className="text-white font-semibold mb-3">📈 성장 시뮬레이션</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={projection}>
                <XAxis dataKey="period" tick={{ fill:'#555', fontSize:11 }} />
                <YAxis tick={{ fill:'#555', fontSize:11 }} tickFormatter={v => '$'+(v/1000).toFixed(0)+'K'} />
                <Tooltip contentStyle={{ background:'#1a1a2e', border:'1px solid #333', borderRadius:8 }}
                  formatter={(v, name) => [usd(v), name === 'ad' ? '광고 수익' : '스트리밍 수익']} />
                <Bar dataKey="ad" fill="#ef4444" radius={[4,4,0,0]} name="ad" />
                <Bar dataKey="streaming" fill="#f59e0b" radius={[4,4,0,0]} name="streaming" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 국가별 비교 */}
      <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4">
        <h3 className="text-white font-semibold mb-4">🌍 국가별 수익 비교 (같은 조회수 기준)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-600 text-xs">
                <th className="text-left py-2 px-3">국가</th>
                <th className="text-right py-2 px-3">CPM</th>
                <th className="text-right py-2 px-3">광고 수익</th>
                <th className="text-right py-2 px-3">스트리밍 수익</th>
                <th className="text-right py-2 px-3">합산</th>
                <th className="px-3">비율</th>
              </tr>
            </thead>
            <tbody>
              {countryCompare.map((row, i) => {
                const total = row.ad + row.streaming;
                const max = countryCompare[0].ad + countryCompare[0].streaming;
                return (
                  <tr key={row.name} className="border-t border-[#1e1e2e] hover:bg-[#0d0d14]">
                    <td className="py-2 px-3 text-gray-300">{row.name}</td>
                    <td className="py-2 px-3 text-right text-gray-400">${(MUSIC_CPM_BY_COUNTRY[Object.keys(MUSIC_CPM_BY_COUNTRY)[i]]?.cpm || 0).toFixed(2)}</td>
                    <td className="py-2 px-3 text-right text-red-400">{usd(row.ad)}</td>
                    <td className="py-2 px-3 text-right text-yellow-400">{usd(row.streaming)}</td>
                    <td className="py-2 px-3 text-right text-purple-400 font-bold">{usd(total)}</td>
                    <td className="py-2 px-3">
                      <div className="h-2 bg-[#1e1e2e] rounded-full w-24">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: Math.round(total/max*100)+'%' }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 장르별 비교 */}
      <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4">
        <h3 className="text-white font-semibold mb-4">🎼 장르별 광고 수익 비교 (같은 조회수 기준)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={genreCompare} layout="vertical">
            <XAxis type="number" tick={{ fill:'#555', fontSize:10 }} tickFormatter={v => '$'+(v/1000).toFixed(0)+'K'} />
            <YAxis type="category" dataKey="name" tick={{ fill:'#777', fontSize:10 }} width={90} />
            <Tooltip contentStyle={{ background:'#1a1a2e', border:'1px solid #333', borderRadius:8 }}
              formatter={v => [usd(v), '광고 수익']} />
            <Bar dataKey="revenue" radius={[0,4,4,0]}>
              {genreCompare.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
