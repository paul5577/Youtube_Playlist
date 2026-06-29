import { useCallback, useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Film, UploadCloud, Play, RefreshCw, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const STEP_LABELS = {
  thumbnail: '썸네일 생성',
  video: '영상 생성',
  upload: '업로드',
  all: '전체 실행',
};

function fileUrl(playlist, filePath) {
  if (!filePath) return null;
  return `/api/playlists/${encodeURIComponent(playlist)}/file?path=${encodeURIComponent(filePath)}`;
}

function StatusBadge({ status }) {
  const map = {
    uploaded: 'bg-green-600/20 text-green-400',
    ready: 'bg-gray-600/20 text-gray-300',
    '': 'bg-gray-600/20 text-gray-300',
  };
  const cls = map[status] || (status?.startsWith('error') ? 'bg-red-600/20 text-red-400' : 'bg-yellow-600/20 text-yellow-400');
  return <span className={`text-xs px-2 py-1 rounded ${cls}`}>{status || 'ready'}</span>;
}

function RowCard({ playlist, row, onRefreshRows }) {
  const [job, setJob] = useState(null); // { step, jobId, status, logs, result, error }
  const pollRef = useRef(null);

  useEffect(() => () => clearInterval(pollRef.current), []);

  function pollJob(step, jobId) {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      const res = await fetch(`/api/jobs/${jobId}`);
      const data = await res.json();
      setJob({ step, jobId, ...data });
      if (data.status === 'done' || data.status === 'error') {
        clearInterval(pollRef.current);
        if (data.status === 'done' && step === 'all') onRefreshRows?.();
      }
    }, 1500);
  }

  async function runStep(step) {
    setJob({ step, status: 'running', logs: ['요청 중...'] });
    const body = {};
    if (step === 'video' && job?.result?.backgroundImage) body.backgroundImage = job.result.backgroundImage;
    if (step === 'upload') {
      body.videoPath = job?.result?.videoPath;
      body.thumbnailPath = job?.result?.thumbnailPath;
    }

    try {
      const res = await fetch(`/api/playlists/${encodeURIComponent(playlist)}/rows/${row._row}/${step}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      pollJob(step, data.jobId);
    } catch (err) {
      setJob({ step, status: 'error', error: err.message, logs: [err.message] });
    }
  }

  const running = job?.status === 'running';
  const thumbPreview = fileUrl(playlist, job?.result?.thumbnailPath);

  return (
    <div className="bg-[#161616] border border-[#262626] rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-white font-medium text-sm">{row.title || `(제목 없음 - 행 ${row._row})`}</div>
          <div className="text-gray-500 text-xs mt-1">행 {row._row} · {row.scheduledDate}</div>
        </div>
        <StatusBadge status={row.status} />
      </div>

      {thumbPreview && (
        <img src={thumbPreview} alt="thumbnail" className="rounded-lg w-full max-w-xs object-cover border border-[#262626]" />
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => runStep('thumbnail')}
          disabled={running}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-200 hover:bg-white/10 disabled:opacity-50"
        >
          <ImageIcon size={14} /> 썸네일 생성
        </button>
        <button
          onClick={() => runStep('video')}
          disabled={running}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-200 hover:bg-white/10 disabled:opacity-50"
        >
          <Film size={14} /> 영상 생성
        </button>
        <button
          onClick={() => runStep('upload')}
          disabled={running || !job?.result?.videoPath}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-200 hover:bg-white/10 disabled:opacity-50"
          title={!job?.result?.videoPath ? '먼저 영상을 생성하세요' : ''}
        >
          <UploadCloud size={14} /> 업로드
        </button>
        <button
          onClick={() => runStep('all')}
          disabled={running}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 disabled:opacity-50"
        >
          <Play size={14} /> 전체 실행
        </button>
      </div>

      {job && (
        <div className="bg-black/30 rounded-lg p-3 text-xs font-mono text-gray-400 max-h-32 overflow-auto">
          <div className="flex items-center gap-2 mb-1 text-gray-300">
            {job.status === 'running' && <Loader2 size={12} className="animate-spin" />}
            {job.status === 'done' && <CheckCircle2 size={12} className="text-green-400" />}
            {job.status === 'error' && <XCircle size={12} className="text-red-400" />}
            {STEP_LABELS[job.step] || job.step}
          </div>
          {(job.logs || []).map((l, i) => <div key={i}>{l}</div>)}
          {job.error && <div className="text-red-400">{job.error}</div>}
          {job.status === 'done' && job.result?.videoUrl && (
            <a href={job.result.videoUrl} target="_blank" rel="noreferrer" className="text-blue-400 underline">
              {job.result.videoUrl}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function PlaylistPublish() {
  const [playlists, setPlaylists] = useState([]);
  const [selected, setSelected] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/playlists')
      .then((r) => r.json())
      .then((data) => {
        setPlaylists(data.playlists || []);
        if (data.playlists?.length) setSelected(data.playlists[0].name);
      })
      .catch((err) => setError(err.message));
  }, []);

  const loadRows = useCallback(async () => {
    if (!selected) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/playlists/${encodeURIComponent(selected)}/rows`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load rows');
      setRows(data.rows || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selected]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional data fetch on playlist change
    loadRows();
  }, [loadRows]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-white text-xl font-semibold">플레이리스트 퍼블리시</h1>
          <p className="text-gray-500 text-sm mt-1">구글시트 일정 → 썸네일/영상 생성 → 비공개 업로드</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="bg-[#161616] border border-[#262626] text-gray-200 text-sm rounded-lg px-3 py-2"
          >
            {playlists.length === 0 && <option value="">설정된 플레이리스트 없음</option>}
            {playlists.map((p) => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={loadRows}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-white/5 text-gray-200 hover:bg-white/10"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> 새로고침
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-600/10 border border-red-600/30 text-red-400 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      {playlists.length === 0 && !error && (
        <div className="text-gray-500 text-sm">
          <code className="text-gray-300">scripts/playlist-publish/config/playlists.json</code> 설정이 필요합니다.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((row) => (
          <RowCard key={row._row} playlist={selected} row={row} onRefreshRows={loadRows} />
        ))}
      </div>
    </div>
  );
}
