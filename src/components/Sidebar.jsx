import { BarChart2, Search, Settings, Calendar, Wrench, TrendingUp, PlayCircle } from 'lucide-react';

const NAV = [
  { id: 'dashboard', icon: BarChart2, label: '대시보드' },
  { id: 'explorer', icon: Search, label: '플레이리스트 탐색' },
  { id: 'strategy', icon: TrendingUp, label: '콘텐츠 전략' },
  { id: 'channel', icon: Settings, label: '채널 설정' },
  { id: 'calendar', icon: Calendar, label: '콘텐츠 캘린더' },
  { id: 'tools', icon: Wrench, label: '제작 도구 리포트' },
];

export default function Sidebar({ active, onSelect }) {
  return (
    <aside className="w-56 bg-[#111] border-r border-[#222] flex flex-col min-h-screen fixed left-0 top-0 z-20">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-[#222]">
        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
          <PlayCircle size={18} className="text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-sm">YT Analyzer</div>
          <div className="text-gray-500 text-xs">수익 분석 플랫폼</div>
        </div>
      </div>
      <nav className="flex-1 py-4">
        {NAV.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${
              active === id
                ? 'bg-red-600/20 text-red-400 border-r-2 border-red-500'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-[#222]">
        <div className="text-xs text-gray-600">API 키 없이 데모 데이터</div>
        <div className="text-xs text-gray-600 mt-1">실제 연동 가능</div>
      </div>
    </aside>
  );
}
