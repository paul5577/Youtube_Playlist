import { useState } from 'react';
import { Download, Plus, Trash2 } from 'lucide-react';
import { MUSIC_GENRES, MUSIC_CALENDAR_TEMPLATES } from '../data/musicData';
import { exportCSV } from '../utils/musicRevenue';

const STATUS_OPTS = ['기획중','작곡중','믹싱중','마스터링완료','편집중','예약완료','게시됨'];
const STATUS_COLOR = {
  '기획중':'bg-gray-700 text-gray-300','작곡중':'bg-blue-900/50 text-blue-300',
  '믹싱중':'bg-yellow-900/50 text-yellow-300','마스터링완료':'bg-orange-900/50 text-orange-300',
  '편집중':'bg-purple-900/50 text-purple-300','예약완료':'bg-cyan-900/50 text-cyan-300',
  '게시됨':'bg-green-900/50 text-green-300',
};

function generateRows(info, weeks) {
  const rows = [];
  const dayMap = { '월':1,'화':2,'수':3,'목':4,'금':5,'토':6,'일':0 };
  const today = new Date();
  const templates = MUSIC_CALENDAR_TEMPLATES[info.genre] || [];
  let num = 1;

  for (let w = 0; w < weeks; w++) {
    const days = info.uploadDays || ['화','금'];
    for (const day of days) {
      const d = new Date(today);
      d.setDate(today.getDate() + w * 7 + ((dayMap[day] - today.getDay() + 7) % 7));
      const tmpl = templates[(num - 1) % Math.max(templates.length, 1)];
      rows.push({
        '번호': num,
        '날짜': d.toLocaleDateString('ko-KR'),
        '요일': day,
        '콘텐츠 유형': tmpl?.type || '음악 영상',
        '제목 (초안)': `[${info.channelName || '채널명'}] ${tmpl?.type || '음악'} ${num}`,
        '영상 길이': tmpl?.duration || '3-5분',
        '썸네일 아이디어': tmpl?.hook || '핵심 키워드 + 감성 이미지',
        '키워드': info.keywords || '',
        '상태': '기획중',
        '저작권 확인': info.copyrightSafe ? '✅ 안전' : '⚠️ 확인필요',
        '스트리밍 배급': info.distroKid ? 'DistroKid' : '미정',
        'Make 자동화': 'YES',
        '메모': '',
      });
      num++;
    }
  }
  return rows;
}

export default function UploadCalendar() {
  const [info, setInfo] = useState({
    channelName: '', genre: 'lofi', keywords: '',
    uploadDays: ['화','금'], weeks: 12,
    copyrightSafe: true, distroKid: false,
  });
  const [rows, setRows] = useState([]);
  const [generated, setGenerated] = useState(false);

  const toggleDay = d => setInfo(p => ({
    ...p, uploadDays: p.uploadDays.includes(d) ? p.uploadDays.filter(x => x !== d) : [...p.uploadDays, d]
  }));

  const gen = () => { setRows(generateRows(info, info.weeks)); setGenerated(true); };
  const upd = (i, k, v) => setRows(r => r.map((row, idx) => idx === i ? { ...row, [k]: v } : row));
  const del = i => setRows(r => r.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">📅 업로드 캘린더</h1>
          <p className="text-gray-500 text-sm mt-1">음악 영상 업로드 일정 → Make.com 연동 CSV</p>
        </div>
        {generated && (
          <button onClick={() => exportCSV(rows, `음악캘린더_${info.channelName || 'Music'}_${info.weeks}주.csv`)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm transition-all">
            <Download size={14} /> CSV 내보내기 ({rows.length}개)
          </button>
        )}
      </div>

      {/* Config */}
      <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-gray-500 text-xs mb-1 block">채널 이름</label>
              <input className="w-full bg-[#0d0d14] border border-[#2a2a3e] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-purple-500"
                placeholder="채널 이름" value={info.channelName} onChange={e => setInfo(p => ({...p, channelName: e.target.value}))} />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">음악 장르</label>
              <select className="w-full bg-[#0d0d14] border border-[#2a2a3e] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                value={info.genre} onChange={e => setInfo(p => ({...p, genre: e.target.value}))}>
                {MUSIC_GENRES.filter(g => g.id !== 'all').map(g => (
                  <option key={g.id} value={g.id}>{g.emoji} {g.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">키워드</label>
              <input className="w-full bg-[#0d0d14] border border-[#2a2a3e] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-purple-500"
                placeholder="lofi, 공부음악, 집중" value={info.keywords} onChange={e => setInfo(p => ({...p, keywords: e.target.value}))} />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-gray-500 text-xs mb-2 block">업로드 요일</label>
              <div className="flex gap-1.5 flex-wrap">
                {['월','화','수','목','금','토','일'].map(d => (
                  <button key={d} onClick={() => toggleDay(d)}
                    className={`w-9 h-9 rounded-lg text-sm transition-all ${info.uploadDays.includes(d) ? 'bg-purple-600 text-white' : 'bg-[#1e1e2e] text-gray-500 hover:text-gray-200'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">생성 기간</label>
              <select className="w-full bg-[#0d0d14] border border-[#2a2a3e] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                value={info.weeks} onChange={e => setInfo(p => ({...p, weeks: Number(e.target.value)}))}>
                {[4,8,12,24,52].map(w => <option key={w} value={w}>{w}주 (~{w * info.uploadDays.length}개)</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-gray-500 text-xs mb-2 block">추가 설정</label>
              <div className="space-y-2">
                {[
                  { k:'copyrightSafe', l:'저작권 안전 음악 사용' },
                  { k:'distroKid', l:'DistroKid 배급 예정' },
                ].map(f => (
                  <label key={f.k} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-purple-500" checked={info[f.k]} onChange={e => setInfo(p => ({...p, [f.k]: e.target.checked}))} />
                    <span className="text-gray-400 text-sm">{f.l}</span>
                  </label>
                ))}
              </div>
            </div>
            <button onClick={gen}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold transition-all">
              🎵 캘린더 생성
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {generated && rows.length > 0 && (
        <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e2e]">
            <h3 className="text-white font-semibold">📋 업로드 일정표 ({rows.length}개)</h3>
            <button onClick={() => setRows(r => [...r, { ...rows[rows.length-1], '번호': rows.length+1, '제목 (초안)':'새 영상', '상태':'기획중' }])}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#1e1e2e] hover:bg-[#2a2a3e] text-gray-300 rounded-lg text-xs transition-all">
              <Plus size={12} /> 행 추가
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#0d0d14] text-gray-600">
                  {['#','날짜','유형','제목','길이','썸네일','상태','저작권','메모',''].map(h => (
                    <th key={h} className="px-3 py-2 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-t border-[#1e1e2e] hover:bg-[#0d0d14]">
                    <td className="px-3 py-2 text-gray-600">{row['번호']}</td>
                    <td className="px-3 py-2 text-gray-400 whitespace-nowrap">{row['날짜']}</td>
                    <td className="px-3 py-2 text-gray-400 whitespace-nowrap">{row['콘텐츠 유형']}</td>
                    <td className="px-3 py-2 min-w-40">
                      <input className="w-full bg-transparent text-gray-300 focus:outline-none" value={row['제목 (초안)']} onChange={e => upd(i,'제목 (초안)',e.target.value)} />
                    </td>
                    <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{row['영상 길이']}</td>
                    <td className="px-3 py-2 min-w-28">
                      <input className="w-full bg-transparent text-gray-300 focus:outline-none" value={row['썸네일 아이디어']} onChange={e => upd(i,'썸네일 아이디어',e.target.value)} />
                    </td>
                    <td className="px-3 py-2">
                      <select className={`rounded px-1.5 py-0.5 text-xs border-0 focus:outline-none ${STATUS_COLOR[row['상태']] || 'bg-gray-700 text-gray-300'}`}
                        value={row['상태']} onChange={e => upd(i,'상태',e.target.value)}>
                        {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{row['저작권 확인']}</td>
                    <td className="px-3 py-2 min-w-24">
                      <input className="w-full bg-transparent text-gray-300 focus:outline-none" value={row['메모']} onChange={e => upd(i,'메모',e.target.value)} />
                    </td>
                    <td className="px-3 py-2">
                      <button onClick={() => del(i)} className="text-gray-700 hover:text-red-400 transition-all"><Trash2 size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Make.com guide */}
      <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4">
        <h3 className="text-white font-semibold mb-4">🔄 Make.com 음악 채널 자동화</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-gray-300 text-sm font-medium mb-3">업로드 자동화 플로우</h4>
            <div className="space-y-2">
              {[
                { n:'1', t:'Google Sheets 트리거', d:'새 행 추가 → 자동 감지' },
                { n:'2', t:'Google Drive 파일 읽기', d:'음악/썸네일 파일 로드' },
                { n:'3', t:'YouTube 동영상 업로드', d:'제목+설명+태그 자동 입력' },
                { n:'4', t:'DistroKid API', d:'스트리밍 플랫폼 자동 배급' },
                { n:'5', t:'SNS 자동 공유', d:'Instagram/Twitter 포스팅' },
                { n:'6', t:'Gmail 완료 알림', d:'업로드 결과 이메일 발송' },
              ].map(s => (
                <div key={s.n} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">{s.n}</div>
                  <div>
                    <div className="text-white text-xs font-medium">{s.t}</div>
                    <div className="text-gray-600 text-xs">{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-gray-300 text-sm font-medium mb-3">음악 채널 특화 자동화 팁</h4>
            <div className="space-y-2">
              {[
                { icon:'🎵', tip:'오디오 파일명을 시트에 미리 입력 → Make가 Drive에서 자동 찾음' },
                { icon:'🏷️', tip:'장르별 태그 템플릿을 시트에 저장 → 자동 적용' },
                { icon:'🖼️', tip:'Midjourney로 썸네일 생성 → Drive 저장 → Make 연동' },
                { icon:'📱', tip:'Shorts 버전 별도 시트로 관리 → 자동 업로드' },
                { icon:'🎤', tip:'라이브 스트리밍 예약은 YouTube API로 직접 스케줄링' },
                { icon:'💰', tip:'DistroKid Webhook으로 스트리밍 수익 자동 집계' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 bg-[#0d0d14] rounded-lg p-2 border border-[#1e1e2e]">
                  <span>{item.icon}</span>
                  <span className="text-gray-400 text-xs">{item.tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
