import { useState } from 'react';
import { Star, ExternalLink, Download } from 'lucide-react';
import { TOOLS_REPORT } from '../data/mockData';
import { exportToCSV } from '../utils/export';

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={10} className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
      ))}
    </div>
  );
}

export default function ToolsReport() {
  const [activeTab, setActiveTab] = useState('manual');

  const current = TOOLS_REPORT[activeTab];

  const handleExport = () => {
    const all = ['manual', 'semiAuto', 'fullyAuto'].flatMap(key => {
      const section = TOOLS_REPORT[key];
      return section.tools.map(tool => ({
        '제작방식': section.title,
        '도구명': tool.name,
        '용도': tool.purpose,
        '가격': tool.price,
        '평점': tool.rating + '/5',
        'URL': tool.url,
      }));
    });
    exportToCSV(all, '유튜브_제작도구_리포트.csv');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">🛠️ 제작 도구 리포트</h1>
          <p className="text-gray-400 text-sm mt-1">수동 → 반자동 → 완전자동, 상황에 맞는 도구를 선택하세요</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm transition-all"
        >
          <Download size={14} />
          전체 리포트 다운로드
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-3">
        {[
          { key: 'manual', label: '✋ 수동 제작', sub: '완전 창작 통제', color: 'border-orange-500' },
          { key: 'semiAuto', label: '⚡ 반자동 제작', sub: 'AI 도구 활용', color: 'border-blue-500' },
          { key: 'fullyAuto', label: '🤖 완전 자동화', sub: '시스템 운영', color: 'border-purple-500' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 p-4 rounded-xl border-2 transition-all text-left ${
              activeTab === tab.key
                ? `${tab.color} bg-[#1a1a1a]`
                : 'border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#444]'
            }`}
          >
            <div className="text-white font-semibold text-sm">{tab.label}</div>
            <div className="text-gray-500 text-xs mt-0.5">{tab.sub}</div>
          </button>
        ))}
      </div>

      {/* Current Section */}
      <div className="grid grid-cols-3 gap-4">
        {/* Info */}
        <div className="space-y-3">
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
            <div className="text-4xl mb-2">{current.icon}</div>
            <h3 className="text-white font-bold text-lg">{current.title}</h3>
            <p className="text-gray-400 text-sm mt-1">{current.description}</p>
            <div className="mt-3 py-2 px-3 bg-[#111] rounded-lg">
              <div className="text-gray-500 text-xs">영상당 제작 시간</div>
              <div className="text-white font-semibold">{current.timePerVideo}</div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
            <h4 className="text-green-400 font-semibold text-sm mb-2">✅ 장점</h4>
            <div className="space-y-1">
              {current.pros.map((p, i) => (
                <div key={i} className="text-gray-300 text-xs flex items-start gap-1.5">
                  <span className="text-green-400 mt-0.5">+</span> {p}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
            <h4 className="text-red-400 font-semibold text-sm mb-2">⚠️ 단점</h4>
            <div className="space-y-1">
              {current.cons.map((c, i) => (
                <div key={i} className="text-gray-300 text-xs flex items-start gap-1.5">
                  <span className="text-red-400 mt-0.5">−</span> {c}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="col-span-2">
          <div className="grid grid-cols-2 gap-3">
            {current.tools.map(tool => (
              <div key={tool.name} className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4 hover:border-[#444] transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-white font-semibold text-sm">{tool.name}</div>
                    <StarRating rating={tool.rating} />
                  </div>
                  <a
                    href={`https://${tool.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-400 transition-all"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
                <div className="text-gray-400 text-xs mb-2">{tool.purpose}</div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    tool.price === '무료' ? 'bg-green-900/50 text-green-400' : 'bg-[#252525] text-gray-400'
                  }`}>
                    {tool.price}
                  </span>
                  <span className="text-gray-600 text-xs">{tool.url}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendation by Situation */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-white font-semibold mb-4">🎯 상황별 추천 세트</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              situation: '💸 예산 0원 (완전 무료 시작)',
              tools: ['DaVinci Resolve (편집)', 'Audacity (음성)', 'Canva Free (썸네일)', 'OBS Studio (녹화)', 'ChatGPT Free (스크립트)', 'VidIQ Free (SEO)'],
              monthly: '₩0',
            },
            {
              situation: '⚡ 효율 최우선 (월 5-10만원)',
              tools: ['CapCut Pro (편집+자막)', 'ElevenLabs (AI음성)', 'Canva Pro (썸네일)', 'ChatGPT Plus (스크립트)', 'VidIQ Pro (분석)', 'Descript (AI편집)'],
              monthly: '≈ $60/월',
            },
            {
              situation: '🤖 완전자동 (다채널 운영)',
              tools: ['Synthesia/HeyGen (AI영상)', 'Make.com (자동화)', 'Jasper AI (대량콘텐츠)', 'Invideo AI (영상생성)', 'Airtable (DB관리)', 'n8n (셀프 자동화)'],
              monthly: '≈ $100-150/월',
            },
          ].map(item => (
            <div key={item.situation} className="bg-[#111] rounded-xl p-4">
              <div className="text-white text-sm font-semibold mb-3">{item.situation}</div>
              <div className="space-y-1 mb-3">
                {item.tools.map((t, i) => (
                  <div key={i} className="text-gray-400 text-xs flex items-center gap-1.5">
                    <span className="text-blue-400">▸</span> {t}
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-[#222]">
                <span className="text-gray-500 text-xs">예상 월 비용: </span>
                <span className="text-green-400 text-xs font-semibold">{item.monthly}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-white font-semibold mb-4">📋 반자동 제작 워크플로우 (추천)</h3>
        <div className="flex items-start gap-2 overflow-x-auto pb-2">
          {[
            { step: '1', title: '기획', tool: 'ChatGPT', action: '키워드 분석 + 스크립트 초안', time: '30분' },
            { step: '2', title: '스크립트', tool: 'Claude AI', action: '스크립트 정제 + SEO 최적화', time: '20분' },
            { step: '3', title: '녹음/음성', tool: 'ElevenLabs', action: 'AI 보이스 또는 직접 녹음', time: '15분' },
            { step: '4', title: '영상 편집', tool: 'CapCut', action: 'AI 자동 편집 + 자막 생성', time: '45분' },
            { step: '5', title: '썸네일', tool: 'Canva Pro', action: 'AI 배경 제거 + 템플릿 수정', time: '15분' },
            { step: '6', title: 'SEO', tool: 'VidIQ', action: '제목/태그/설명 최적화', time: '10분' },
            { step: '7', title: '업로드', tool: 'Make.com', action: '자동 예약 업로드 + SNS 공유', time: '5분' },
          ].map((item, i, arr) => (
            <div key={item.step} className="flex items-center gap-2 flex-shrink-0">
              <div className="bg-[#111] rounded-xl p-3 w-36">
                <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold mb-2">{item.step}</div>
                <div className="text-white text-xs font-semibold">{item.title}</div>
                <div className="text-blue-400 text-xs">{item.tool}</div>
                <div className="text-gray-500 text-xs mt-1 leading-tight">{item.action}</div>
                <div className="text-yellow-400 text-xs mt-1">{item.time}</div>
              </div>
              {i < arr.length - 1 && <div className="text-gray-600 text-lg flex-shrink-0">→</div>}
            </div>
          ))}
        </div>
        <div className="mt-3 text-gray-500 text-xs">총 제작 시간: 약 2.5시간 / 영상 (반자동 기준)</div>
      </div>
    </div>
  );
}
