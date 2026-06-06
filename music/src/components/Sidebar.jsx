import { BarChart2, Search, TrendingUp, Settings, Calendar, Wrench, Music } from 'lucide-react';

const NAV = [
  { id: 'dashboard', icon: BarChart2,   label: '대시보드' },
  { id: 'explorer',  icon: Search,      label: '채널 탐색' },
  { id: 'revenue',   icon: TrendingUp,  label: '수익 분석기' },
  { id: 'strategy',  icon: Music,       label: '채널 전략' },
  { id: 'channel',   icon: Settings,    label: '채널 설정' },
  { id: 'calendar',  icon: Calendar,    label: '업로드 캘린더' },
  { id: 'tools',     icon: Wrench,      label: '제작 도구 리포트' },
];

export default function Sidebar({ active, onSelect }) {
  return (
    <aside className="w-56 bg-[#0d0d14] border-r border-[#1e1e2e] flex flex-col min-h-screen fixed left-0 top-0 z-20">
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-[#1e1e2e]">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}>
          <Music size={18} className="text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-sm">Music Analyzer</div>
          <div className="text-purple-400 text-xs">음악 채널 수익 분석</div>
        </div>
      </div>
      <nav className="flex-1 py-4">
        {NAV.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => onSelect(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${
              active === id
                ? 'bg-purple-600/20 text-purple-300 border-r-2 border-purple-500'
                : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
            }`}>
            <Icon size={15} />
            {label}
          </button>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-[#1e1e2e] space-y-1">
        <div className="text-xs text-gray-600">🎵 음악 채널 특화 분석</div>
        <div className="text-xs text-gray-600">저작권·스트리밍 수익 포함</div>
      </div>
    </aside>
  );
}
