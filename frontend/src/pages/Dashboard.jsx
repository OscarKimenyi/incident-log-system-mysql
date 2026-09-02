import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const statusConfig = {
  open: { label: 'Open', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  investigating: { label: 'Investigating', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  resolved: { label: 'Resolved', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  closed: { label: 'Closed', color: 'text-slate-400', bg: 'bg-slate-700/50 border-slate-600/20' },
};

const severityConfig = {
  critical: { label: 'Critical', color: 'text-red-400' },
  high: { label: 'High', color: 'text-orange-400' },
  medium: { label: 'Medium', color: 'text-amber-400' },
  low: { label: 'Low', color: 'text-blue-400' },
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400">Loading dashboard…</div>
  );

  const total = Object.values(data.counts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Operational overview</p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([status, cfg]) => (
          <Link to={`/incidents?status=${status}`} key={status}
            className={`border rounded-xl p-4 hover:border-opacity-60 transition-colors ${cfg.bg}`}>
            <p className={`text-2xl font-bold ${cfg.color}`}>{data.counts[status]}</p>
            <p className="text-sm text-slate-400 mt-1">{cfg.label}</p>
          </Link>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">By Severity</h2>
          <div className="space-y-3">
            {Object.entries(severityConfig).map(([sev, cfg]) => {
              const count = data.bySeverity[sev];
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={sev}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`font-medium ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-slate-400">{count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${cfg.color.replace('text-', 'bg-')}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Recent Incidents</h2>
            <Link to="/incidents" className="text-xs text-red-400 hover:text-red-300">View all</Link>
          </div>
          <div className="space-y-3">
            {data.recent.length === 0 && (
              <p className="text-sm text-slate-500">No incidents yet.</p>
            )}
            {data.recent.map(inc => (
              <Link to={`/incidents/${inc.id}`} key={inc.id}
                className="block px-3 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-white font-medium truncate">{inc.title}</p>
                  <span className={`text-xs font-medium capitalize shrink-0 ${severityConfig[inc.severity]?.color}`}>
                    {inc.severity}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs capitalize ${statusConfig[inc.status]?.color}`}>{inc.status}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-500">{inc.reporter?.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}