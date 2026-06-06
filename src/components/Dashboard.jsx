import { TrendingUp, DollarSign, Eye, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { MOCK_PLAYLISTS, CATEGORIES } from '../data/mockData';
import { formatNumber, formatCurrency } from '../utils/revenue';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const totalRevenue = MOCK_PLAYLISTS.reduce((s, p) => s + p.revenueData.yearly, 0);
  const totalViews = MOCK_PLAYLISTS.reduce((s, p) => s + p.totalViews, 0);
  const totalSubscribers = MOCK_PLAYLISTS.reduce((s, p) => s + p.subscribers, 0);
  const avgEngagement = (MOCK_PLAYLISTS.reduce((s, p) => s + p.engagementRate, 0) / MOCK_PLAYLISTS.length).toFixed(1);

  const categoryRevenue = CATEGORIES.filter(c => c.id !== 'all').map(cat => {
    const playlists = MOCK_PLAYLISTS.filter(p => p.category === cat.id);
    const revenue = playlists.reduce((s, p) => s + p.revenueData.monthly, 0);
    return { name: cat.label, revenue, count: playlists.length };
  }).filter(c => c.revenue > 0).sort((a, b) => b.revenue - a.revenue);

  const topChannels = [...MOCK_PLAYLISTS]
    .sort((a, b) => b.revenueData.yearly - a.revenueData.yearly)
    .slice(0, 5);

  const categoryPie = categoryRevenue.map(c => ({ name: c.name, value: c.revenue }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">📊 대시보드</h1>
        <p className="text-gray-400 text-sm mt-1">분석 중인 플레이리스트 {MOCK_PLAYLISTS.length}개의 종합 현황</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '총 연간 수익 (합산)', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: '총 누적 조회수', value: formatNumber(totalViews), icon: Eye, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: '총 구독자', value: formatNumber(totalSubscribers), icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { label: '평균 참여율', value: avgEngagement + '%', icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-400/10' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]">
            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Category Revenue Bar */}
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]">
          <h3 className="text-white font-semibold mb-4">카테고리별 월 수익</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryRevenue}>
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => '$' + (v/1000).toFixed(0) + 'K'} />
              <Tooltip
                contentStyle={{ background: '#1f1f1f', border: '1px solid #333', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
                formatter={v => ['$' + v.toLocaleString(), '월 수익']}
              />
              <Bar dataKey="revenue" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 Channels */}
        <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]">
          <h3 className="text-white font-semibold mb-4">TOP 5 수익 채널</h3>
          <div className="space-y-3">
            {topChannels.map((ch, i) => (
              <div key={ch.id} className="flex items-center gap-3">
                <div className="text-gray-500 text-sm w-4">{i + 1}</div>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: ch.thumbnailColor }}
                >
                  {ch.channelName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{ch.channelName}</div>
                  <div className="text-gray-500 text-xs">{ch.country} · {ch.category}</div>
                </div>
                <div className="text-green-400 text-sm font-semibold">{formatCurrency(ch.revenueData.monthly)}/월</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Pie */}
      <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]">
        <h3 className="text-white font-semibold mb-4">카테고리별 수익 비율</h3>
        <div className="flex items-center gap-8">
          <ResponsiveContainer width={220} height={180}>
            <PieChart>
              <Pie data={categoryPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                {categoryPie.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1f1f1f', border: '1px solid #333', borderRadius: 8 }}
                formatter={v => ['$' + v.toLocaleString(), '월 수익']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 flex-1">
            {categoryPie.map((c, i) => (
              <div key={c.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-gray-400 text-xs">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
