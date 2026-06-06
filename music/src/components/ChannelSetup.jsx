import { useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { MUSIC_GENRES, MUSIC_CPM_BY_COUNTRY } from '../data/musicData';
import { exportCSV } from '../utils/musicRevenue';

const LOGO_PROMPTS = {
  lofi:      ['Aesthetic anime girl studying at window, rainy night, warm lamp light, lo-fi music channel logo illustration, soft purple-blue palette, 1:1 square format',
               'Minimalist headphone icon with coffee cup and music note, pastel night sky background, lo-fi aesthetic YouTube channel logo'],
  kpop:      ['Vibrant K-pop girl group logo design, holographic gradient, star and music note elements, bold typography, Korean pop aesthetic, 1:1',
               'Neon pink and purple K-pop music channel logo, dynamic idol silhouette, Korean wave aesthetic, glossy finish'],
  classical: ['Elegant violin and treble clef logo, gold on deep navy, classical music YouTube channel, sophisticated serif typography',
               'Grand piano keys forming channel initial, marble texture, prestigious classical music brand identity'],
  cover:     ['Guitar pick with sound waves logo, warm acoustic vibe, indie music channel identity, hand-drawn style',
               'Abstract fingerboard pattern, warm wood tones, fingerstyle music YouTube channel logo'],
  edm:       ['Neon equalizer wave logo, electric blue on black, EDM music channel, futuristic rave aesthetic',
               'Circuit board + soundwave fusion, cyan and purple neon, electronic music brand identity'],
  lofi:      ['Lo-fi aesthetic girl studying, rainy window, warm lamp, music channel illustration logo, soft colors'],
  sleep:     ['Crescent moon with soft piano keys, dreamy purple gradient, sleep music YouTube channel logo, calming aesthetic',
               'Stars and musical notes floating, deep navy to purple gradient, meditation music channel identity'],
  worship:   ['Elegant cross with musical notes halo, golden light rays, worship music channel logo, reverent atmosphere',
               'Minimalist dove with musical staff, warm gold and white, CCM worship channel brand'],
  indie:     ['Vintage microphone with botanical elements, indie folk music channel logo, muted earth tones, handcrafted feel'],
  kids:      ['Colorful cartoon musical notes dancing, bright primary colors, children music YouTube channel logo, playful and cute'],
  jazz:      ['Art deco saxophone silhouette, gold on charcoal, jazz music channel logo, 1920s vintage aesthetic'],
  hiphop:    ['Bold graffiti-style music channel logo, hip-hop aesthetic, urban street art vibe, microphone icon'],
  jpop:      ['Sakura petals with music notes, pastel pink-white-blue, J-pop channel logo, kawaii Japanese aesthetic'],
};

const BANNER_PROMPTS = {
  lofi:     'YouTube channel art banner 2560x1440px, lo-fi aesthetic, cozy bedroom/cafe scene, rain on window, warm lighting, anime style, purple-blue palette, space for channel name',
  kpop:     'YouTube channel art banner 2560x1440px, K-pop theme, holographic sparkle elements, idol stage lighting, vibrant pink-purple gradient, Korean pop aesthetic',
  classical:'YouTube channel art banner 2560x1440px, classical music theme, concert hall interior, grand piano, marble columns, elegant gold accents, deep navy background',
  cover:    'YouTube channel art banner 2560x1440px, acoustic music theme, close-up guitar strings, warm bokeh lights, indie aesthetic, earth tones',
  edm:      'YouTube channel art banner 2560x1440px, EDM theme, neon lights, equalizer waves, festival crowd silhouette, electric blue-purple gradient',
  sleep:    'YouTube channel art banner 2560x1440px, sleep music theme, starry night sky, soft moon glow, peaceful bedroom, deep navy-purple gradient',
  worship:  'YouTube channel art banner 2560x1440px, worship music theme, rays of light through clouds, sacred atmosphere, warm golden tones, cross silhouette',
  kids:     'YouTube channel art banner 2560x1440px, children music theme, colorful cartoon musical instruments, rainbow background, playful and bright, cute characters',
  jazz:     'YouTube channel art banner 2560x1440px, jazz music theme, smoky nightclub, saxophone musician silhouette, vintage art deco style, warm amber lighting',
  default:  'YouTube channel art banner 2560x1440px, music channel, musical notes and sound waves, gradient background, professional design, space for channel name center',
};

function CopyBtn({ text }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); }}
      className="p-1.5 rounded-lg bg-[#1e1e2e] hover:bg-[#2a2a3e] text-gray-500 hover:text-white transition-all flex-shrink-0">
      {ok ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
    </button>
  );
}

export default function ChannelSetup() {
  const [form, setForm] = useState({
    channelName: '', channelHandle: '', genre: 'lofi', country: 'KR',
    language: '한국어', description: '', keywords: '', uploadSchedule: '매주 화/금',
    website: '', instagram: '', twitter: '', email: '',
    monetizationGoal: '구독자 1,000명 + 시청시간 4,000시간',
    membershipPlan: '', sponsorTarget: '', distroKid: false, contentId: false,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const genreInfo = MUSIC_GENRES.find(g => g.id === form.genre);
  const logoPrompts = LOGO_PROMPTS[form.genre] || LOGO_PROMPTS['default'] || [];
  const bannerPrompt = BANNER_PROMPTS[form.genre] || BANNER_PROMPTS['default'];

  const handleExport = () => {
    const rows = [
      { 항목: '채널 이름', 내용: form.channelName },
      { 항목: '채널 핸들', 내용: form.channelHandle },
      { 항목: '음악 장르', 내용: genreInfo?.label },
      { 항목: '타겟 국가', 내용: MUSIC_CPM_BY_COUNTRY[form.country]?.label },
      { 항목: '주요 언어', 내용: form.language },
      { 항목: '채널 설명', 내용: form.description },
      { 항목: '채널 키워드', 내용: form.keywords },
      { 항목: '업로드 주기', 내용: form.uploadSchedule },
      { 항목: '웹사이트', 내용: form.website },
      { 항목: 'Instagram', 내용: form.instagram },
      { 항목: 'Twitter/X', 내용: form.twitter },
      { 항목: '이메일', 내용: form.email },
      { 항목: '수익화 목표', 내용: form.monetizationGoal },
      { 항목: '멤버십 계획', 내용: form.membershipPlan },
      { 항목: '스폰서 목표', 내용: form.sponsorTarget },
      { 항목: 'DistroKid 배급', 내용: form.distroKid ? '예정' : '미정' },
      { 항목: 'ContentID 등록', 내용: form.contentId ? '예정' : '미정' },
      { 항목: '로고 프롬프트 1', 내용: logoPrompts[0] || '' },
      { 항목: '로고 프롬프트 2', 내용: logoPrompts[1] || '' },
      { 항목: '배너 프롬프트', 내용: bannerPrompt },
    ];
    exportCSV(rows, `음악채널설정_${form.channelName || 'Music'}.csv`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">⚙️ 음악 채널 설정</h1>
          <p className="text-gray-500 text-sm mt-1">채널 정보 입력 → AI 디자인 프롬프트 자동 생성 → CSV 내보내기</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm transition-all">
          <Download size={14} /> CSV 내보내기
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left */}
        <div className="space-y-4">
          <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4 space-y-3">
            <h3 className="text-white font-semibold">🎵 기본 정보</h3>
            {[
              { k:'channelName', l:'채널 이름', ph:'예: SleepMelody, KoreanLofi' },
              { k:'channelHandle', l:'채널 핸들 (@)', ph:'@yourmusic' },
              { k:'language', l:'주요 언어', ph:'한국어, 영어, 일본어' },
              { k:'uploadSchedule', l:'업로드 주기', ph:'매주 화/금 오후 8시' },
            ].map(f => (
              <div key={f.k}>
                <label className="text-gray-500 text-xs mb-1 block">{f.l}</label>
                <input className="w-full bg-[#0d0d14] border border-[#2a2a3e] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-purple-500"
                  placeholder={f.ph} value={form[f.k]} onChange={e => set(f.k, e.target.value)} />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-gray-500 text-xs mb-1 block">음악 장르</label>
                <select className="w-full bg-[#0d0d14] border border-[#2a2a3e] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  value={form.genre} onChange={e => set('genre', e.target.value)}>
                  {MUSIC_GENRES.filter(g => g.id !== 'all').map(g => (
                    <option key={g.id} value={g.id}>{g.emoji} {g.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-500 text-xs mb-1 block">타겟 국가</label>
                <select className="w-full bg-[#0d0d14] border border-[#2a2a3e] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  value={form.country} onChange={e => set('country', e.target.value)}>
                  {Object.entries(MUSIC_CPM_BY_COUNTRY).map(([code, info]) => (
                    <option key={code} value={code}>{info.flag} {info.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">채널 설명</label>
              <textarea className="w-full bg-[#0d0d14] border border-[#2a2a3e] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-purple-500 h-20 resize-none"
                placeholder="채널 소개, 음악 스타일, 업로드 주기 포함" value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">채널 키워드</label>
              <input className="w-full bg-[#0d0d14] border border-[#2a2a3e] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-purple-500"
                placeholder="lofi, 공부음악, 집중, 카페음악" value={form.keywords} onChange={e => set('keywords', e.target.value)} />
            </div>
          </div>

          <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4 space-y-3">
            <h3 className="text-white font-semibold">🔗 링크 & 수익화</h3>
            {[
              { k:'website', l:'웹사이트', ph:'https://yoursite.com' },
              { k:'instagram', l:'Instagram', ph:'https://instagram.com/...' },
              { k:'twitter', l:'Twitter/X', ph:'@yourhandle' },
              { k:'email', l:'비즈니스 이메일', ph:'music@yourdomain.com' },
              { k:'monetizationGoal', l:'수익화 목표', ph:'1,000 구독자 + 4,000시간' },
              { k:'sponsorTarget', l:'목표 스폰서', ph:'악기 브랜드, 음악 앱, DAW 회사' },
            ].map(f => (
              <div key={f.k}>
                <label className="text-gray-500 text-xs mb-1 block">{f.l}</label>
                <input className="w-full bg-[#0d0d14] border border-[#2a2a3e] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-purple-500"
                  placeholder={f.ph} value={form[f.k]} onChange={e => set(f.k, e.target.value)} />
              </div>
            ))}
            <div className="flex gap-4 pt-1">
              {[
                { k:'distroKid', l:'DistroKid 스트리밍 배급 예정' },
                { k:'contentId', l:'YouTube ContentID 등록 예정' },
              ].map(f => (
                <label key={f.k} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-purple-500" checked={form[f.k]} onChange={e => set(f.k, e.target.checked)} />
                  <span className="text-gray-400 text-xs">{f.l}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4">
            <h3 className="text-white font-semibold mb-2">🎨 AI 로고 프롬프트</h3>
            <p className="text-gray-600 text-xs mb-3">Midjourney / DALL-E 3 / Stable Diffusion에 복사해서 사용</p>
            <div className="space-y-2">
              {(logoPrompts.length ? logoPrompts : ['로고 프롬프트를 생성 중입니다']).map((p, i) => (
                <div key={i} className="bg-[#0d0d14] rounded-lg p-3 border border-[#1e1e2e]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-gray-400 text-xs leading-relaxed flex-1">{p}</div>
                    <CopyBtn text={p} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4">
            <h3 className="text-white font-semibold mb-2">🖼️ 채널 배너 프롬프트</h3>
            <div className="bg-[#0d0d14] rounded-lg p-3 border border-[#1e1e2e]">
              <div className="flex items-start justify-between gap-2">
                <div className="text-gray-400 text-xs leading-relaxed flex-1">{bannerPrompt}</div>
                <CopyBtn text={bannerPrompt} />
              </div>
            </div>
          </div>

          <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4">
            <h3 className="text-white font-semibold mb-3">📌 음악 채널 체크리스트</h3>
            <div className="space-y-1.5">
              {[
                '채널 이름 · 핸들 설정',
                '프로필 사진 (800x800px AI 생성)',
                '채널 배너 (2560x1440px)',
                '채널 설명 (음악 장르+키워드 포함)',
                '채널 트레일러 영상 (30초 요약)',
                '재생목록 섹션 구성',
                'DistroKid 음원 배급 신청',
                'YouTube ContentID 등록',
                '수익화 신청 (요건 충족 후)',
                'Make.com 업로드 자동화 설정',
                'Spotify for Artists 클레임',
                'Apple Music for Artists 등록',
              ].map((item, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="accent-purple-500" />
                  <span className="text-gray-400 text-sm">{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-700/30 p-4">
            <h3 className="text-white font-semibold mb-2">🎵 음악 채널 수익 다각화</h3>
            <div className="space-y-1.5 text-xs text-gray-300">
              {['YouTube 광고 수익 (CPM × 조회수)','Spotify/Apple Music 스트리밍','YouTube ContentID 수익','채널 멤버십 + 슈퍼챗','악기/DAW 브랜드 스폰서','악보/샘플팩 판매','온라인 음악 레슨','NFT 음악 발매 (선택)'].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-purple-400">♪</span> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
