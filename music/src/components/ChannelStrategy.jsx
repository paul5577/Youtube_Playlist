import { useState } from 'react';
import { CheckCircle, AlertTriangle, Zap, TrendingUp, Shield } from 'lucide-react';
import { MUSIC_GENRES, GENRE_STRATEGY, MUSIC_PLAYLISTS, GENRE_REVENUE_PROFILE } from '../data/musicData';

export default function ChannelStrategy() {
  const [genre, setGenre] = useState('lofi');
  const [scale, setScale] = useState('new');

  const strategy = GENRE_STRATEGY[genre];
  const genreInfo = MUSIC_GENRES.find(g => g.id === genre);
  const profile = GENRE_REVENUE_PROFILE[genre] || {};
  const refChannels = MUSIC_PLAYLISTS.filter(p => p.genre === genre).slice(0, 3);

  const revenueEstimate = {
    new:    { monthly3: 80,   monthly12: 1200  },
    grow:   { monthly3: 1500, monthly12: 18000 },
    stable: { monthly3: 15000, monthly12: 180000 },
  }[scale];

  if (!strategy) return (
    <div className="flex items-center justify-center h-64 text-gray-600">
      해당 장르의 전략 데이터를 준비 중입니다
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">🎯 음악 채널 전략</h1>
        <p className="text-gray-500 text-sm mt-1">장르별 맞춤 전략 · 첫 영상 팁 · 저작권 안내</p>
      </div>

      {/* Genre selector */}
      <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {MUSIC_GENRES.filter(g => g.id !== 'all' && GENRE_STRATEGY[g.id]).map(g => (
            <button key={g.id} onClick={() => setGenre(g.id)}
              className={`px-3 py-1.5 rounded-xl text-xs transition-all ${genre === g.id ? 'text-white font-semibold' : 'bg-[#1e1e2e] text-gray-500 hover:text-gray-200'}`}
              style={genre === g.id ? { background: g.color } : {}}>
              {g.emoji} {g.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {[['new','신규 채널 (0~1K)'],['grow','성장 중 (1K~50K)'],['stable','안정 운영 (50K+)']].map(([k,l]) => (
            <button key={k} onClick={() => setScale(k)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${scale === k ? 'bg-purple-600 text-white' : 'bg-[#1e1e2e] text-gray-500 hover:text-gray-200'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Strategy Highlight */}
      <div className="rounded-xl p-4 border" style={{ background: genreInfo?.color + '15', borderColor: genreInfo?.color + '40' }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{genreInfo?.emoji}</span>
          <span className="text-white font-bold text-lg">{genreInfo?.label}</span>
        </div>
        <p className="text-gray-300 text-sm">{strategy.hook}</p>
        <div className="flex gap-2 mt-3 flex-wrap">
          <span className={`px-2.5 py-1 rounded-full text-xs ${profile.copyrightRisk === '낮음' ? 'bg-green-900/40 text-green-300' : profile.copyrightRisk?.includes('높음') ? 'bg-red-900/40 text-red-300' : 'bg-yellow-900/40 text-yellow-300'}`}>
            {profile.copyrightRisk === '낮음' ? '✅' : profile.copyrightRisk?.includes('높음') ? '🚨' : '⚠️'} 저작권 {profile.copyrightRisk}
          </span>
          {profile.liveFriendly && <span className="px-2.5 py-1 rounded-full text-xs bg-blue-900/40 text-blue-300">📺 라이브 적합</span>}
          {profile.shorts && <span className="px-2.5 py-1 rounded-full text-xs bg-pink-900/40 text-pink-300">📱 Shorts 적합</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* First video */}
        <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Zap size={15} className="text-yellow-400" /> 첫 영상 핵심 전략
          </h3>
          <div className="space-y-2">
            {strategy.firstVideoTip.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle size={13} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{tip}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-[#0d0d14] rounded-lg p-3 border border-[#1e1e2e]">
            <div className="text-gray-500 text-xs">업로드 전략</div>
            <div className="text-white text-sm font-medium mt-1">{strategy.uploadTip}</div>
          </div>
        </div>

        {/* Revenue Projection */}
        <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <TrendingUp size={15} className="text-green-400" /> 수익 예상
          </h3>
          <div className="space-y-3">
            {[
              { period: '3개월 후', val: revenueEstimate.monthly3 },
              { period: '12개월 후', val: revenueEstimate.monthly12 },
            ].map(item => (
              <div key={item.period} className="bg-[#0d0d14] rounded-xl p-3 border border-[#1e1e2e]">
                <div className="text-gray-500 text-xs mb-1">{item.period} · 예상 월 합산 수익</div>
                <div className="text-green-400 text-xl font-bold">${item.val.toLocaleString()}</div>
                <div className="text-gray-600 text-xs">₩{Math.round(item.val * 1350).toLocaleString()}</div>
              </div>
            ))}
            <div className="text-gray-700 text-xs">* 광고+스트리밍 합산 추정치. 실제는 달라질 수 있음</div>
          </div>
          <div className="mt-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3">
            <div className="text-yellow-400 text-xs font-semibold mb-1">💡 수익 극대화 팁</div>
            <div className="text-gray-300 text-xs">{strategy.revenueHack}</div>
          </div>
        </div>

        {/* Content Ideas */}
        <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4">
          <h3 className="text-white font-semibold mb-3">🎵 추천 콘텐츠 아이디어</h3>
          <div className="space-y-2">
            {strategy.contentIdeas.map((idea, i) => (
              <div key={i} className="bg-[#0d0d14] rounded-lg p-2.5 text-gray-300 text-sm flex items-center gap-2">
                <span style={{ color: genreInfo?.color }}>▸</span> {idea}
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Shield size={15} className="text-blue-400" /> 저작권 & 수익화 가이드
          </h3>
          <div className={`rounded-lg p-3 mb-3 ${profile.copyrightRisk === '낮음' ? 'bg-green-900/20 border border-green-700/30' : profile.copyrightRisk?.includes('높음') ? 'bg-red-900/20 border border-red-700/30' : 'bg-yellow-900/20 border border-yellow-700/30'}`}>
            <div className="text-white text-sm font-semibold mb-1">현재 선택 장르: {strategy.copyright}</div>
          </div>
          <div className="space-y-2 text-sm">
            {profile.contentId && (
              <div className="flex items-start gap-2 text-red-300">
                <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" />
                <span>ContentID 적용 시 광고 수익이 원곡자에게 이전될 수 있습니다</span>
              </div>
            )}
            {profile.liveFriendly && (
              <div className="flex items-start gap-2 text-blue-300">
                <CheckCircle size={13} className="mt-0.5 flex-shrink-0" />
                <span>라이브 스트리밍으로 24시간 조회수 누적 가능</span>
              </div>
            )}
            {!profile.contentId && (
              <div className="flex items-start gap-2 text-green-300">
                <CheckCircle size={13} className="mt-0.5 flex-shrink-0" />
                <span>자체 창작/저작권 만료 음악 → 100% 수익 보유</span>
              </div>
            )}
            <div className="flex items-start gap-2 text-gray-300">
              <CheckCircle size={13} className="text-purple-400 mt-0.5 flex-shrink-0" />
              <span>DistroKid으로 스트리밍 배급 → 추가 수익 창출 권장</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reference channels */}
      {refChannels.length > 0 && (
        <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4">
          <h3 className="text-white font-semibold mb-4">🔖 참조 채널</h3>
          <div className="grid grid-cols-3 gap-3">
            {refChannels.map(ch => (
              <div key={ch.id} className="bg-[#0d0d14] rounded-xl p-4 border border-[#1e1e2e]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ background: ch.color }}>{ch.channelName.charAt(0)}</div>
                  <div>
                    <div className="text-white text-sm font-medium">{ch.channelName}</div>
                    <div className="text-gray-600 text-xs">{ch.country} · {ch.uploadFreq}</div>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  {[
                    ['월 합산 수익', '$' + ch.revenue.totalMonthly.toLocaleString(), 'text-purple-400'],
                    ['스트리밍 수익', '$' + ch.revenue.musicMonthly.toLocaleString(), 'text-yellow-400'],
                    ['성장률', '+' + ch.growthRate + '%', 'text-green-400'],
                  ].map(([k,v,c]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-gray-600">{k}</span>
                      <span className={`font-medium ${c}`}>{v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-gray-600 text-xs leading-relaxed">{ch.successKey.slice(0,70)}...</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
