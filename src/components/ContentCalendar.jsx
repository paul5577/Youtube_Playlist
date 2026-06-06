import { useState } from 'react';
import { Download, Plus, Trash2, Calendar } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { exportToCSV, generateContentCalendar } from '../utils/export';

const STATUS_OPTIONS = ['기획중', '스크립트작성', '촬영예정', '촬영완료', '편집중', '예약완료', '게시됨'];
const STATUS_COLORS = {
  '기획중': 'bg-gray-700 text-gray-300',
  '스크립트작성': 'bg-blue-900/50 text-blue-300',
  '촬영예정': 'bg-yellow-900/50 text-yellow-300',
  '촬영완료': 'bg-orange-900/50 text-orange-300',
  '편집중': 'bg-purple-900/50 text-purple-300',
  '예약완료': 'bg-cyan-900/50 text-cyan-300',
  '게시됨': 'bg-green-900/50 text-green-300',
};

export default function ContentCalendar() {
  const [channelInfo, setChannelInfo] = useState({
    channelName: '',
    category: 'finance',
    keywords: '',
    uploadDays: ['화', '금'],
    weeks: 12,
  });

  const [rows, setRows] = useState([]);
  const [generated, setGenerated] = useState(false);

  const toggleDay = (day) => {
    setChannelInfo(prev => ({
      ...prev,
      uploadDays: prev.uploadDays.includes(day)
        ? prev.uploadDays.filter(d => d !== day)
        : [...prev.uploadDays, day],
    }));
  };

  const generate = () => {
    const generated = generateContentCalendar(channelInfo, channelInfo.weeks);
    setRows(generated);
    setGenerated(true);
  };

  const updateRow = (i, key, value) => {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [key]: value } : r));
  };

  const addRow = () => {
    const last = rows[rows.length - 1];
    setRows(prev => [...prev, {
      '번호': (last?.['번호'] || prev.length) + 1,
      '날짜': '',
      '요일': '',
      '제목 (초안)': '',
      '서브타이틀': '',
      '키워드': channelInfo.keywords,
      '설명문구': '',
      '썸네일 아이디어': '',
      '상태': '기획중',
      '조회수 목표': '10,000+',
      'Make 자동화': 'YES',
      '메모': '',
    }]);
  };

  const removeRow = (i) => {
    setRows(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleExport = () => {
    exportToCSV(rows, `콘텐츠캘린더_${channelInfo.channelName || 'YouTube'}_${channelInfo.weeks}주.csv`);
  };

  const category = CATEGORIES.find(c => c.id === channelInfo.category);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">📅 콘텐츠 캘린더</h1>
          <p className="text-gray-400 text-sm mt-1">업로드 일정표 생성 → Make.com 연동용 CSV 내보내기</p>
        </div>
        {generated && (
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm transition-all"
          >
            <Download size={14} />
            CSV 내보내기 ({rows.length}개)
          </button>
        )}
      </div>

      {/* Config */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-white font-semibold mb-3">설정</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-gray-400 text-xs mb-1 block">채널 이름</label>
              <input
                className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                placeholder="채널 이름 입력"
                value={channelInfo.channelName}
                onChange={e => setChannelInfo(p => ({ ...p, channelName: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">카테고리</label>
              <select
                className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                value={channelInfo.category}
                onChange={e => setChannelInfo(p => ({ ...p, category: e.target.value }))}
              >
                {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">주요 키워드</label>
              <input
                className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                placeholder="재테크, 주식, 부동산"
                value={channelInfo.keywords}
                onChange={e => setChannelInfo(p => ({ ...p, keywords: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-gray-400 text-xs mb-2 block">업로드 요일 (복수 선택)</label>
              <div className="flex gap-2 flex-wrap">
                {['월', '화', '수', '목', '금', '토', '일'].map(day => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`w-9 h-9 rounded-lg text-sm transition-all ${
                      channelInfo.uploadDays.includes(day) ? 'bg-red-600 text-white' : 'bg-[#252525] text-gray-400 hover:text-white'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">생성 기간 (주)</label>
              <select
                className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                value={channelInfo.weeks}
                onChange={e => setChannelInfo(p => ({ ...p, weeks: Number(e.target.value) }))}
              >
                {[4, 8, 12, 24, 52].map(w => (
                  <option key={w} value={w}>{w}주 ({Math.round(w * channelInfo.uploadDays.length)}개 영상)</option>
                ))}
              </select>
            </div>
            <button
              onClick={generate}
              className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Calendar size={14} />
              캘린더 생성
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {generated && rows.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
            <h3 className="text-white font-semibold">📋 콘텐츠 일정표 ({rows.length}개)</h3>
            <button
              onClick={addRow}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#252525] hover:bg-[#333] text-gray-300 rounded-lg text-xs transition-all"
            >
              <Plus size={12} /> 행 추가
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#111] text-gray-500">
                  <th className="px-3 py-2 text-left w-8">#</th>
                  <th className="px-3 py-2 text-left w-24">날짜</th>
                  <th className="px-3 py-2 text-left min-w-48">제목 (초안)</th>
                  <th className="px-3 py-2 text-left min-w-32">썸네일 아이디어</th>
                  <th className="px-3 py-2 text-left w-28">상태</th>
                  <th className="px-3 py-2 text-left w-24">조회수 목표</th>
                  <th className="px-3 py-2 text-left min-w-32">메모</th>
                  <th className="px-3 py-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-t border-[#222] hover:bg-[#1f1f1f]">
                    <td className="px-3 py-2 text-gray-500">{row['번호']}</td>
                    <td className="px-3 py-2">
                      <input
                        className="w-full bg-transparent text-gray-300 focus:outline-none focus:text-white"
                        value={row['날짜']}
                        onChange={e => updateRow(i, '날짜', e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="w-full bg-transparent text-gray-300 focus:outline-none focus:text-white"
                        value={row['제목 (초안)']}
                        onChange={e => updateRow(i, '제목 (초안)', e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="w-full bg-transparent text-gray-300 focus:outline-none focus:text-white"
                        value={row['썸네일 아이디어']}
                        onChange={e => updateRow(i, '썸네일 아이디어', e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        className={`rounded px-1.5 py-0.5 text-xs border-0 focus:outline-none ${STATUS_COLORS[row['상태']] || 'bg-gray-700 text-gray-300'}`}
                        value={row['상태']}
                        onChange={e => updateRow(i, '상태', e.target.value)}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="w-full bg-transparent text-gray-300 focus:outline-none focus:text-white"
                        value={row['조회수 목표']}
                        onChange={e => updateRow(i, '조회수 목표', e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="w-full bg-transparent text-gray-300 focus:outline-none focus:text-white"
                        value={row['메모']}
                        onChange={e => updateRow(i, '메모', e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button onClick={() => removeRow(i)} className="text-gray-600 hover:text-red-400 transition-all">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Make.com Guide */}
      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4">
        <h3 className="text-white font-semibold mb-3">🔄 Make.com 연동 가이드</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-gray-300 text-sm font-medium mb-2">자동화 시나리오</h4>
            <div className="space-y-2">
              {[
                { step: '1', title: 'Google Sheets 트리거', desc: '새 행이 추가되면 자동 감지' },
                { step: '2', title: 'YouTube Upload', desc: '영상 파일 + 메타데이터 자동 업로드' },
                { step: '3', title: '설명 + 태그 자동 입력', desc: 'CSV의 설명문구와 키워드 사용' },
                { step: '4', title: 'SNS 공유', desc: 'Instagram/Twitter 자동 포스팅' },
                { step: '5', title: '완료 알림', desc: 'Gmail/Slack으로 결과 발송' },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">{item.step}</div>
                  <div>
                    <div className="text-white text-xs font-medium">{item.title}</div>
                    <div className="text-gray-500 text-xs">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-gray-300 text-sm font-medium mb-2">필요한 Make.com 모듈</h4>
            <div className="space-y-1.5">
              {[
                'Google Sheets - Watch Rows',
                'YouTube - Upload a Video',
                'YouTube - Update Video',
                'Instagram - Create a Post',
                'Twitter - Create a Tweet',
                'Gmail - Send an Email',
                'Google Drive - Upload a File',
              ].map((mod, i) => (
                <div key={i} className="bg-[#111] rounded px-3 py-1.5 text-gray-400 text-xs">{mod}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
