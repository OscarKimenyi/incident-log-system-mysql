import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

const statusColors = {
  open: 'text-red-400 bg-red-500/10 border-red-500/20',
  investigating: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  resolved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  closed: 'text-slate-400 bg-slate-700/50 border-slate-600/20',
};

const severityColors = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-amber-400',
  low: 'text-blue-400',
};

export default function IncidentList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const severity = searchParams.get('severity') || '';
  const status = searchParams.get('status') || '';

  const fetchIncidents = () => {
    setLoading(true);
    api.get('/incidents', { params: { severity, status } })
      .then(r => setIncidents(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchIncidents(); }, [severity, status]);

  const setFilter = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    setSearchParams(p);
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Incidents</h1>
          <p className="text-sm text-slate-400 mt-0.5">{incidents.length} result{incidents.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/incidents/new"
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors">
          + Report Incident
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={severity} onChange={e => setFilter('severity', e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500">
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={status} onChange={e => setFilter('status', e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500">
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        {(severity || status) && (
          <button onClick={() => setSearchParams({})}
            className="px-3 py-2 text-sm text-slate-400 hover:text-white bg-slate-800 border border-slate-700 rounded-lg transition-colors">
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading…</div>
      ) : incidents.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-slate-400">No incidents match your filters.</p>
          <Link to="/incidents/new" className="mt-3 inline-block text-sm text-red-400 hover:text-red-300">
            Report the first one →
          </Link>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Severity</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Reporter</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden lg:table-cell">Assigned To</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {incidents.map(inc => (
                  <tr key={inc.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{inc.title}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`capitalize font-medium ${severityColors[inc.severity]}`}>{inc.severity}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${statusColors[inc.status]}`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-400">{inc.reporter?.name}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-400">{inc.assignee?.name ?? '—'}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-500">
                      {new Date(inc.created_at).toLocaleString('en-TZ', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', hour12: false
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/incidents/${inc.id}`}
                        className="text-xs text-red-400 hover:text-red-300 font-medium">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}