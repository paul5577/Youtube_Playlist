import { useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { CATEGORIES, COUNTRIES } from '../data/mockData';
import { exportToCSV } from '../utils/export';

const LOGO_PROMPTS = {
  finance: [
    'Minimalist gold coin with upward arrow, dark navy background, professional financial brand logo, 1:1 ratio',
    'Abstract stock chart forming letter initial, gradient gold-to-white, modern finance YouTube channel logo',
    'Bold typography with dollar sign integrated, clean white on deep blue, trust and growth concept',
  ],
  tech: [
    'Circuit board pattern forming channel initial, neon blue on black, futuristic tech YouTube logo',
    'Abstract pixel/voxel design, gradient purple-to-cyan, modern technology brand identity',
    'Geometric hexagon with tech icon inside, minimal flat design, white and electric blue',
  ],
  education: [
    'Open book with lightbulb emerging, warm gradient orange-to-yellow, educational YouTube channel',
    'Pencil forming infinity symbol, playful yet professional, gradient blue-to-purple',
    'Minimalist graduation cap with star, clean white background, modern education brand',
  ],
  cooking: [
    'Chef hat with fork and spoon, warm red-orange palette, appetizing food channel logo',
    'Abstract flame/fire shaped as letter, golden-orange gradient, culinary YouTube brand',
    'Minimalist plate with swirl design, earthy tones, modern food content creator logo',
  ],
  fitness: [
    'Abstract human figure in motion, bold red on black, energy and power concept',
    'Dumbbell forming channel initial, gradient gray-to-orange, fitness motivation logo',
    'Lightning bolt + shield combination, dark background, strength and health brand',
  ],
  lifestyle: [
    'Leaf/nature element with soft gradient, warm pastel tones, lifestyle vlog channel',
    'Sun and mountain silhouette, minimalist style, travel and adventure brand identity',
    'Circle frame with lifestyle elements, soft pink-to-lavender, personal brand logo',
  ],
  default: [
    'Bold letter logo, gradient color scheme, modern YouTube channel identity, professional design',
    'Abstract geometric shape, vibrant colors, memorable brand mark for content creator',
    'Clean minimalist icon, versatile design works on all backgrounds, YouTube optimized',
  ],
};

const BANNER_PROMPTS = {
  finance: 'YouTube channel art banner, financial theme, stock market graphs, professional dark blue background, gold accents, 2560x1440px, text space on right side, modern minimalist design',
  tech: 'YouTube channel art banner, technology theme, circuit boards and digital elements, dark background with neon accents, futuristic aesthetic, 2560x1440px',
  education: 'YouTube channel art banner, education theme, books and learning icons, warm friendly colors, inspiring atmosphere, clean design, 2560x1440px',
  cooking: 'YouTube channel art banner, food/cooking theme, ingredients and kitchen tools, warm appetizing colors, 2560x1440px, inviting and delicious feel',
  default: 'YouTube channel art banner, clean modern design, 2560x1440px, space for channel name on center, professional content creator style',
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="p-1.5 rounded-lg bg-[#252525] hover:bg-[#333] text-gray-400 hover:text-white transition-all flex-shrink-0">
      {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
    </button>
  );
}

export default function ChannelSetup() {
  const [form, setForm] = useState({
    channelName: '',
    channelHandle: '',
    category: 'finance',
    targetCountry: 'KR',
    targetLanguage: '한국어',
    description: '',
    keywords: '',
    uploadSchedule: '매주 화/금 오후 7시',
    websiteUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    emailBusiness: '',
    monetizationGoal: '구독자 1,000명 + 시청시간 4,000시간',
    membershipTier: '',
    sponsorTarget: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const logoPrompts = LOGO_PROMPTS[form.category] || LOGO_PROMPTS.default;
  const bannerPrompt = BANNER_PROMPTS[form.category] || BANNER_PROMPTS.default;
  const category = CATEGORIES.find(c => c.id === form.category);

  const handleExport = () => {
    const rows = [
      { 항목: '채널 이름', 내용: form.channelName },
      { 항목: '채널 핸들', 내용: form.channelHandle },
      { 항목: '카테고리', 내용: category?.label },
      { 항목: '타겟 국가', 내용: COUNTRIES.find(c => c.code === form.targetCountry)?.label },
      { 항목: '주요 언어', 내용: form.targetLanguage },
      { 항목: '채널 설명', 내용: form.description },
      { 항목: '채널 키워드', 내용: form.keywords },
      { 항목: '업로드 주기', 내용: form.uploadSchedule },
      { 항목: '웹사이트', 내용: form.websiteUrl },
      { 항목: 'Instagram', 내용: form.instagramUrl },
      { 항목: 'Twitter/X', 내용: form.twitterUrl },
      { 항목: '비즈니스 이메일', 내용: form.emailBusiness },
      { 항목: '수익화 목표', 내용: form.monetizationGoal },
      { 항목: '멤버십 등급', 내용: form.membershipTier },
      { 항목: '스폰서 목표', 내용: form.sponsorTarget },
      { 항목: '로고 프롬프트 1', 내용: logoPrompts[0] },
      { 항목: '로고 프롬프트 2', 내용: logoPrompts[1] },
      { 항목: '배너 프롬프트', 내용: bannerPrompt },
    ];
    exportToCSV(rows, '채널설정_' + (form.channelName || 'YouTube') + '.csv');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">⚙️ 채널 설정</h1>
          <p className="text-gray-400 text-sm mt-1">채널 정보 입력 → 디자인 프롬프트 자동 생성 → CSV 내보내기</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm transition-all"
        >
          <Download size={14} />
          CSV 내보내기
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: Form */}
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
            <h3 className="text-white font-semibold mb-3">📋 기본 정보</h3>
            <div className="space-y-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">채널 이름</label>
                <input
                  className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                  placeholder="예: 달라달라, 부자되는 습관"
                  value={form.channelName}
                  onChange={e => set('channelName', e.target.value)}
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">채널 핸들 (@)</label>
                <input
                  className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                  placeholder="@yourhandle"
                  value={form.channelHandle}
                  onChange={e => set('channelHandle', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">카테고리</label>
                  <select
                    className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                    value={form.category}
                    onChange={e => set('category', e.target.value)}
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">타겟 국가</label>
                  <select
                    className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                    value={form.targetCountry}
                    onChange={e => set('targetCountry', e.target.value)}
                  >
                    {COUNTRIES.filter(c => c.code !== 'all').map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">채널 설명 (YouTube About)</label>
                <textarea
                  className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500 h-20 resize-none"
                  placeholder="채널의 가치 제안, 업로드 주기, 구독해야 할 이유를 명확히"
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">채널 키워드 (쉼표로 구분)</label>
                <input
                  className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                  placeholder="재테크, 주식투자, 부동산, 절약"
                  value={form.keywords}
                  onChange={e => set('keywords', e.target.value)}
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">업로드 일정</label>
                <input
                  className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                  placeholder="매주 화/금 오후 7시"
                  value={form.uploadSchedule}
                  onChange={e => set('uploadSchedule', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
            <h3 className="text-white font-semibold mb-3">🔗 링크 설정</h3>
            <div className="space-y-3">
              {[
                { key: 'websiteUrl', label: '웹사이트', placeholder: 'https://yoursite.com' },
                { key: 'instagramUrl', label: 'Instagram', placeholder: 'https://instagram.com/...' },
                { key: 'twitterUrl', label: 'Twitter/X', placeholder: 'https://twitter.com/...' },
                { key: 'emailBusiness', label: '비즈니스 이메일', placeholder: 'business@yourdomain.com' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-gray-400 text-xs mb-1 block">{field.label}</label>
                  <input
                    className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={e => set(field.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Monetization */}
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
            <h3 className="text-white font-semibold mb-3">💰 수익화 계획</h3>
            <div className="space-y-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">수익화 목표</label>
                <input
                  className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                  placeholder="구독자 1,000명 + 시청시간 4,000시간"
                  value={form.monetizationGoal}
                  onChange={e => set('monetizationGoal', e.target.value)}
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">멤버십 등급 계획</label>
                <textarea
                  className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500 h-16 resize-none"
                  placeholder="실버: ₩990 (뱃지+이모티콘), 골드: ₩2,990 (독점 영상)"
                  value={form.membershipTier}
                  onChange={e => set('membershipTier', e.target.value)}
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">목표 스폰서 분야</label>
                <input
                  className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                  placeholder="금융앱, 교육플랫폼, 생산성 도구"
                  value={form.sponsorTarget}
                  onChange={e => set('sponsorTarget', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Design Prompts */}
        <div className="space-y-4">
          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
            <h3 className="text-white font-semibold mb-3">🎨 로고 디자인 AI 프롬프트</h3>
            <p className="text-gray-500 text-xs mb-3">Midjourney, DALL-E 3, Stable Diffusion에 복사해서 사용하세요</p>
            <div className="space-y-3">
              {logoPrompts.map((prompt, i) => (
                <div key={i} className="bg-[#111] rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-gray-400 text-xs leading-relaxed flex-1">{prompt}</div>
                    <CopyButton text={prompt} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
            <h3 className="text-white font-semibold mb-3">🖼️ 채널 배너 프롬프트</h3>
            <div className="bg-[#111] rounded-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="text-gray-400 text-xs leading-relaxed flex-1">{bannerPrompt}</div>
                <CopyButton text={bannerPrompt} />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
            <h3 className="text-white font-semibold mb-3">📌 채널 설정 체크리스트</h3>
            <div className="space-y-2">
              {[
                '채널 이름 · 핸들 설정',
                '프로필 사진 업로드 (800x800px)',
                '채널 배너 업로드 (2560x1440px)',
                '채널 설명 작성 (검색 키워드 포함)',
                '채널 링크 5개 추가',
                '채널 트레일러 영상 설정',
                '섹션 구성 (재생목록 정리)',
                '수익화 신청 (요건 충족 후)',
                'YouTube Studio 알림 설정',
                'Make.com 연동 설정',
              ].map((item, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-red-500" />
                  <span className="text-gray-400 text-sm">{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-xl border border-green-700/30 p-4">
            <h3 className="text-white font-semibold mb-2">🚀 Make.com 연동 준비</h3>
            <p className="text-gray-300 text-sm">CSV 내보내기 후 Make.com의 YouTube 모듈에서:</p>
            <div className="mt-2 space-y-1">
              {[
                'Google Sheets → YouTube 제목/설명 자동 채우기',
                '예약 업로드 스케줄 자동화',
                '업로드 완료 → SNS 자동 공유',
                '댓글 알림 → Slack/Gmail 발송',
              ].map((item, i) => (
                <div key={i} className="text-gray-400 text-xs flex items-center gap-2">
                  <span className="text-green-400">✓</span> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
