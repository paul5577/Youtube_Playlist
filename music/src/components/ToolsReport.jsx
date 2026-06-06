import { useState } from 'react';
import { Star, ExternalLink, Download } from 'lucide-react';
import { MUSIC_TOOLS } from '../data/musicData';
import { exportCSV } from '../utils/musicRevenue';

const TAB_LABELS = {
  recording:     { label: '🎙️ 녹음/DAW',        color: '#7c3aed' },
  aiMusic:       { label: '🤖 AI 음악 생성',     color: '#ec4899' },
  videoEdit:     { label: '🎬 영상 편집',         color: '#0ea5e9' },
  distribution:  { label: '📀 유통/저작권',       color: '#10b981' },
  thumbnail:     { label: '🎨 썸네일/아트',       color: '#f59e0b' },
  growth:        { label: '📈 SEO/성장',          color: '#ef4444' },
};

function Stars({ n }) {
  return <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} size={10} className={i<=n?'text-yellow-400 fill-yellow-400':'text-gray-700'} />)}</div>;
}

export default function ToolsReport() {
  const [tab, setTab] = useState('recording');

  const section = MUSIC_TOOLS[tab];
  const tabInfo  = TAB_LABELS[tab];

  const handleExport = () => {
    const all = Object.entries(MUSIC_TOOLS).flatMap(([key, sec]) =>
      sec.tools.map(t => ({
        '카테고리': TAB_LABELS[key]?.label || key,
        '도구명': t.name,
        '용도': t.purpose,
        '가격': t.price,
        '평점': t.rating + '/5',
        '호환 OS': t.os || '-',
      }))
    );
    exportCSV(all, '음악채널_제작도구_리포트.csv');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">🛠️ 음악 채널 제작 도구</h1>
          <p className="text-gray-500 text-sm mt-1">음악 제작부터 유통까지 전 과정 도구 총정리</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm transition-all">
          <Download size={14} /> 전체 리포트 다운
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(TAB_LABELS).map(([key, info]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-3 py-2 rounded-xl text-sm transition-all border ${tab === key ? 'text-white border-transparent' : 'bg-[#111118] border-[#1e1e2e] text-gray-500 hover:text-gray-200'}`}
            style={tab === key ? { background: info.color } : {}}>
            {info.label}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-3 gap-3">
        {section.tools.map(tool => (
          <div key={tool.name} className="bg-[#111118] rounded-xl border border-[#1e1e2e] hover:border-[#2a2a3e] transition-all p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-white font-semibold text-sm">{tool.name}</div>
                <Stars n={tool.rating} />
              </div>
              <a href={`https://${tool.url || ''}`} target="_blank" rel="noopener noreferrer"
                className="text-gray-700 hover:text-blue-400 transition-all">
                <ExternalLink size={12} />
              </a>
            </div>
            <div className="text-gray-500 text-xs mb-3">{tool.purpose}</div>
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-0.5 rounded-full ${tool.price === '무료' ? 'bg-green-900/40 text-green-400' : 'bg-[#1e1e2e] text-gray-500'}`}>
                {tool.price}
              </span>
              {tool.os && <span className="text-gray-700 text-xs">{tool.os}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Workflow by type */}
      <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4">
        <h3 className="text-white font-semibold mb-4">🎵 음악 채널 유형별 추천 스택</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              type: '☕ Lo-fi / Ambient 채널',
              budget: '월 $20~30',
              stack: ['Suno AI / Udio (AI 음악 생성)', 'CapCut (비주얼라이저 영상)', 'Canva (썸네일)', 'DistroKid (스트리밍 배급)', 'Make.com (자동 업로드)'],
              tip: 'AI 생성 음악 → 저작권 100% 소유 → 완전 자동화 가능',
              color: 'border-purple-500/30 bg-purple-900/10',
            },
            {
              type: '🎸 커버송 / 연주 채널',
              budget: '월 $50~100',
              stack: ['Reaper / GarageBand (녹음)', 'DaVinci Resolve (영상 편집)', 'iZotope RX (노이즈 제거)', 'VidIQ (SEO)', 'Canva Pro (썸네일)'],
              tip: 'ContentID 대비 → 멤버십+라이브 수익 집중',
              color: 'border-green-500/30 bg-green-900/10',
            },
            {
              type: '🎤 오리지널 아티스트 채널',
              budget: '월 $80~150',
              stack: ['Logic Pro / Ableton (제작)', 'DistroKid (배급)', 'Adobe Premiere (MV)', 'Midjourney (아트워크)', 'Chartmetric (분석)'],
              tip: '자체 저작권 100% → 스트리밍 수익 최대화 핵심',
              color: 'border-pink-500/30 bg-pink-900/10',
            },
          ].map(item => (
            <div key={item.type} className={`rounded-xl border p-4 ${item.color}`}>
              <div className="text-white font-semibold text-sm mb-1">{item.type}</div>
              <div className="text-gray-500 text-xs mb-3">예산: {item.budget}</div>
              <div className="space-y-1 mb-3">
                {item.stack.map((s, i) => (
                  <div key={i} className="text-gray-400 text-xs flex items-center gap-1.5">
                    <span className="text-purple-400">▸</span> {s}
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-white/10 text-gray-500 text-xs">{item.tip}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Production workflow */}
      <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4">
        <h3 className="text-white font-semibold mb-4">⚡ 음악 영상 제작 워크플로우 (반자동 기준)</h3>
        <div className="flex items-start gap-2 overflow-x-auto pb-2">
          {[
            { n:'1', title:'음악 기획', tool:'ChatGPT', action:'장르/무드 기획 + 트렌드 분석', time:'30분' },
            { n:'2', title:'음악 제작', tool:'Suno AI / DAW', action:'AI 생성 또는 직접 작곡/믹싱', time:'1-4시간' },
            { n:'3', title:'마스터링', tool:'LANDR / iZotope', action:'AI 자동 마스터링', time:'10분' },
            { n:'4', title:'비주얼 제작', tool:'CapCut + Canva', action:'비주얼라이저 + 썸네일', time:'30분' },
            { n:'5', title:'SEO 최적화', tool:'VidIQ', action:'제목/태그/설명 최적화', time:'15분' },
            { n:'6', title:'스트리밍 배급', tool:'DistroKid', action:'Spotify/Apple Music 배급 신청', time:'10분' },
            { n:'7', title:'자동 업로드', tool:'Make.com', action:'YouTube 예약 + SNS 공유', time:'5분' },
          ].map((s, i, arr) => (
            <div key={s.n} className="flex items-center gap-2 flex-shrink-0">
              <div className="bg-[#0d0d14] rounded-xl p-3 w-32 border border-[#1e1e2e]">
                <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold mb-2">{s.n}</div>
                <div className="text-white text-xs font-semibold">{s.title}</div>
                <div className="text-purple-400 text-xs">{s.tool}</div>
                <div className="text-gray-600 text-xs mt-1 leading-tight">{s.action}</div>
                <div className="text-yellow-400 text-xs mt-1">{s.time}</div>
              </div>
              {i < arr.length - 1 && <div className="text-gray-700 text-lg flex-shrink-0">→</div>}
            </div>
          ))}
        </div>
        <div className="mt-3 text-gray-600 text-xs">총 소요 시간: AI 사용 시 약 2-3시간 / 직접 제작 시 5-8시간</div>
      </div>
    </div>
  );
}
