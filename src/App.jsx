import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PlaylistExplorer from './components/PlaylistExplorer';
import ContentStrategy from './components/ContentStrategy';
import ChannelSetup from './components/ChannelSetup';
import ContentCalendar from './components/ContentCalendar';
import ToolsReport from './components/ToolsReport';

const PAGES = {
  dashboard: Dashboard,
  explorer: PlaylistExplorer,
  strategy: ContentStrategy,
  channel: ChannelSetup,
  calendar: ContentCalendar,
  tools: ToolsReport,
};

export default function App() {
  const [page, setPage] = useState('dashboard');
  const Page = PAGES[page] || Dashboard;

  return (
    <div className="flex min-h-screen bg-[#0f0f0f]">
      <Sidebar active={page} onSelect={setPage} />
      <main className="flex-1 ml-56 p-6 overflow-auto">
        <Page />
      </main>
    </div>
  );
}
