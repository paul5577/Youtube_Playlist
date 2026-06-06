import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChannelExplorer from './components/ChannelExplorer';
import RevenueAnalyzer from './components/RevenueAnalyzer';
import ChannelStrategy from './components/ChannelStrategy';
import ChannelSetup from './components/ChannelSetup';
import UploadCalendar from './components/UploadCalendar';
import ToolsReport from './components/ToolsReport';

const PAGES = {
  dashboard: Dashboard,
  explorer:  ChannelExplorer,
  revenue:   RevenueAnalyzer,
  strategy:  ChannelStrategy,
  channel:   ChannelSetup,
  calendar:  UploadCalendar,
  tools:     ToolsReport,
};

export default function App() {
  const [page, setPage] = useState('dashboard');
  const Page = PAGES[page] || Dashboard;
  return (
    <div className="flex min-h-screen bg-[#0a0a0f]">
      <Sidebar active={page} onSelect={setPage} />
      <main className="flex-1 ml-56 p-6 overflow-auto">
        <Page />
      </main>
    </div>
  );
}
