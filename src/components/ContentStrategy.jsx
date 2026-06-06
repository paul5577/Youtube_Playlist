import { useState } from 'react';
import { Lightbulb, TrendingUp, Target, Zap, CheckCircle } from 'lucide-react';
import { MOCK_PLAYLISTS, CATEGORIES, COUNTRIES } from '../data/mockData';
import { formatNumber, formatCurrency } from '../utils/revenue';

const STRATEGY_BY_CATEGORY = {
  finance: {
    firstVideoTips: [
      '"월 00만원으로 시작하는 투자" 같은 구체적 숫자 제목',
      '자신의 실제 투자 성과나 실수 스토리로 신뢰 구축',
      '초보자가 가장 궁금해하는 "어디서 시작해야?" 주제',
      '썸네일에 금액 숫자 크게 표시',
    ],
    contentIdeas: [
      '월급 200만원 재테크 로드맵', '주식 vs 부동산 비교 분석', '절약 챌린지 30일',
      '직장인 세금 환급 완전정복', 'ISA 계좌 완벽 가이드', '배당주 포트폴리오 공개',
    ],
    growthHacks: ['매달 포트폴리오 공개로 꾸준한 관심 유지', '구독자 Q&A로 참여율 높이기', '시즌별 절세 콘텐츠'],
    bestPostTime: '화/목 오후 7-9시',
    avgCPM: 3.2,
  },
  education: {
    firstVideoTips: [
      '"10분 만에 이해하는..." 형식의 시간 효율성 강조',
      '학생·취준생 타겟의 실용적 주제',
      '애니메이션이나 도표로 복잡한 내용 쉽게',
      '시리즈 형식으로 재방문 유도',
    ],
    contentIdeas: [
      '공부법 완전정복', '집중력 높이는 방법', '자격증 합격 로드맵',
      '영어 30일 마스터', '코딩 입문 가이드', '독서법 혁신',
    ],
    growthHacks: ['시험 시즌에 맞춘 콘텐츠', '체크리스트 PDF 무료 배포', '스터디 챌린지 참여 유도'],
    bestPostTime: '일/월 오전 10시-오후 2시',
    avgCPM: 2.8,
  },
  tech: {
    firstVideoTips: [
      '최신 제품 언박싱+리뷰 (검색 유입 즉시)',
      '"vs" 비교 콘텐츠로 구매 결정 도움',
      '문제해결 튜토리얼 ("ERROR 해결" 등)',
      '영상 초반 3초 안에 결론 제시',
    ],
    contentIdeas: [
      '가성비 스마트폰 TOP 5', 'ChatGPT 활용법 완전정복', '노트북 선택 가이드',
      'AI 도구 비교 리뷰', '스마트홈 셋업', '코딩 없이 앱 만들기',
    ],
    growthHacks: ['제품 출시 타이밍에 맞춘 리뷰', '협찬 + 독립 리뷰 병행으로 신뢰', '커뮤니티 질문 콘텐츠화'],
    bestPostTime: '수/금 오후 6-8시',
    avgCPM: 4.2,
  },
  cooking: {
    firstVideoTips: [
      '가장 검색량 많은 요리로 시작 (김치찌개, 파스타 등)',
      '탑뷰(위에서 아래) 촬영 + ASMR 사운드',
      '"5분 완성" "10재료 이하" 같은 쉬움 강조',
      '음식 완성 장면을 첫 3초에 배치',
    ],
    contentIdeas: [
      '자취생 일주일 식단', '1만원으로 5일 도시락', '에어프라이어 레시피 100선',
      '헬스 식단 실제로 먹어보기', '편의점 음식 업그레이드', '세계 음식 따라하기',
    ],
    growthHacks: ['재료비 공개로 실용성 강조', '구독자 레시피 챌린지', '계절 재료 활용'],
    bestPostTime: '금/토 오전 11시-오후 1시',
    avgCPM: 2.4,
  },
  lifestyle: {
    firstVideoTips: [
      '일상 루틴 공개 (기상부터 잠들기까지)',
      '개인 스토리+변화 비포/애프터',
      '1달/30일 챌린지 포맷',
      '인물 클로즈업+감성 BGM',
    ],
    contentIdeas: [
      '미니멀리즘 생활 30일', '새벽 5시 기상 챌린지', '도파민 디톡스 1주일',
      '월 100만원으로 살기', '제로웨이스트 챌린지', '독서 50권 후기',
    ],
    growthHacks: ['시리즈 포맷으로 구독 유도', '댓글 대화 적극 참여', 'Vlog+정보 혼합 포맷'],
    bestPostTime: '일/월 오전 8-10시',
    avgCPM: 2.0,
  },
};

const getDefaultStrategy = () => ({
  firstVideoTips: ['카테고리에 맞는 첫 영상 구성', '명확한 썸네일과 제목', '인트로 30초 이내'],
  contentIdeas: ['트렌딩 주제', '연관 키워드', '시리즈 기획'],
  growthHacks: ['꾸준한 업로드', '커뮤니티 활동', 'SNS 연동'],
  bestPostTime: '화/금 오후 7시',
  avgCPM: 2.0,
});

export default function ContentStrategy() {
  const [selectedCategory, setSelectedCategory] = useState('finance');
  const [selectedCountry, setSelectedCountry] = useState('KR');
  const [channelScale, setChannelScale] = useState('new');

  const strategy = STRATEGY_BY_CATEGORY[selectedCategory] || getDefaultStrategy();
  const refPlaylists = MOCK_PLAYLISTS.filter(p => p.category === selectedCategory).slice(0, 3);
  const country = COUNTRIES.find(c => c.code === selectedCountry);
  const category = CATEGORIES.find(c => c.id === selectedCategory);

  const revenueProjection = {
    new: { views3m: 5000, views12m: 50000, revenue3m: 80, revenue12m: 800 },
    growing: { views3m: 50000, views12m: 500000, revenue3m: 800, revenue12m: 8000 },
    established: { views3m: 500000, views12m: 5000000, revenue3m: 8000, revenue12m: 80000 },
  }[channelScale];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">🎯 콘텐츠 전략</h1>
        <p className="text-gray-400 text-sm mt-1">카테고리별 최적 전략과 참조 채널 제안</p>
      </div>

      {/* Config */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <div className="text-gray-500 text-xs mb-2">목표 카테고리</div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    selectedCategory === cat.id ? 'bg-red-600 text-white' : 'bg-[#252525] text-gray-400 hover:text-white'
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-2">타겟 국가</div>
            <div className="flex gap-2 flex-wrap">
              {COUNTRIES.slice(0, 6).map(c => (
                <button
                  key={c.code}
                  onClick={() => setSelectedCountry(c.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    selectedCountry === c.code ? 'bg-blue-600 text-white' : 'bg-[#252525] text-gray-400 hover:text-white'
                  }`}
                >
                  {c.flag} {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-2">채널 단계</div>
            <div className="flex gap-2">
              {[['new', '신규 (0~1K)'], ['growing', '성장중 (1K~10K)'], ['established', '안정 (10K+)']].map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setChannelScale(k)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    channelScale === k ? 'bg-purple-600 text-white' : 'bg-[#252525] text-gray-400 hover:text-white'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* First Video Tips */}
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Zap size={16} className="text-yellow-400" />
            첫 영상 전략 (가장 중요!)
          </h3>
          <div className="space-y-2">
            {strategy.firstVideoTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{tip}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3">
            <div className="text-yellow-400 text-xs font-semibold">⏰ 최적 업로드 시간</div>
            <div className="text-white text-sm mt-1">{strategy.bestPostTime}</div>
          </div>
        </div>

        {/* Revenue Projection */}
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-400" />
            수익 예상 ({category?.label} · {country?.label})
          </h3>
          <div className="space-y-3">
            {[
              { period: '3개월 후', views: revenueProjection.views3m, revenue: revenueProjection.revenue3m },
              { period: '12개월 후', views: revenueProjection.views12m, revenue: revenueProjection.revenue12m },
            ].map(item => (
              <div key={item.period} className="bg-[#111] rounded-lg p-3">
                <div className="text-gray-400 text-xs mb-2">{item.period}</div>
                <div className="flex justify-between">
                  <div>
                    <div className="text-blue-400 font-semibold">{formatNumber(item.views)}</div>
                    <div className="text-gray-600 text-xs">월 조회수</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-semibold">{formatCurrency(item.revenue)}</div>
                    <div className="text-gray-600 text-xs">월 예상 수익</div>
                  </div>
                </div>
              </div>
            ))}
            <div className="text-gray-600 text-xs">* 예상치는 평균 CPM ${strategy.avgCPM} 기준. 실제 수익은 다를 수 있음.</div>
          </div>
        </div>

        {/* Content Ideas */}
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Lightbulb size={16} className="text-orange-400" />
            추천 콘텐츠 아이디어
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {strategy.contentIdeas.map((idea, i) => (
              <div key={i} className="bg-[#111] rounded-lg p-2.5 text-gray-300 text-xs">
                📹 {idea}
              </div>
            ))}
          </div>
        </div>

        {/* Growth Hacks */}
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Target size={16} className="text-purple-400" />
            성장 가속 전략
          </h3>
          <div className="space-y-2">
            {strategy.growthHacks.map((hack, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-purple-400 text-xs mt-0.5">▸</span>
                <span className="text-gray-300 text-sm">{hack}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reference Channels */}
      {refPlaylists.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
          <h3 className="text-white font-semibold mb-4">🔖 참조 채널 ({category?.label})</h3>
          <div className="grid grid-cols-3 gap-4">
            {refPlaylists.map(pl => (
              <div key={pl.id} className="bg-[#111] rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ background: pl.thumbnailColor }}
                  >
                    {pl.channelName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{pl.channelName}</div>
                    <div className="text-gray-500 text-xs">{pl.country} · {formatNumber(pl.subscribers)} 구독</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-xs">월 수익</span>
                    <span className="text-green-400 text-xs font-medium">{formatCurrency(pl.revenueData.monthly)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-xs">평균 조회수</span>
                    <span className="text-blue-400 text-xs">{formatNumber(pl.avgViewsPerVideo)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-xs">성장률</span>
                    <span className="text-orange-400 text-xs">+{pl.growthRate}%/월</span>
                  </div>
                </div>
                <div className="mt-3 text-gray-500 text-xs leading-relaxed">{pl.whySuccessful.slice(0, 80)}...</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Creation Method Recommendation */}
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-700/30 p-4">
        <h3 className="text-white font-semibold mb-3">🤖 제작 방식 추천</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { title: '신규 채널', rec: '반자동 추천', reason: '시간 효율+퀄리티 균형. CapCut + ChatGPT + Canva 조합으로 시작.', color: 'border-yellow-500/30 bg-yellow-900/10' },
            { title: '성장 채널', rec: '수동+반자동', reason: '차별화된 퀄리티 필요. Premiere Pro + AI 스크립트 작성 조합.', color: 'border-green-500/30 bg-green-900/10' },
            { title: '다채널 운영', rec: '완전 자동화', reason: 'Make.com + AI 보이스 + 자동 업로드로 규모 확장.', color: 'border-blue-500/30 bg-blue-900/10' },
          ].map(item => (
            <div key={item.title} className={`rounded-xl border p-3 ${item.color}`}>
              <div className="text-gray-400 text-xs mb-1">{item.title}</div>
              <div className="text-white font-semibold text-sm mb-2">✅ {item.rec}</div>
              <div className="text-gray-400 text-xs">{item.reason}</div>
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-xs mt-3">상세 도구 정보는 <strong className="text-white">제작 도구 리포트</strong> 탭에서 확인하세요.</p>
      </div>
    </div>
  );
}
