import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const statusFlow = {
  open: 'investigating',
  investigating: 'resolved',
  resolved: 'closed',
};

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

const fmt = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-TZ', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
};

export default function IncidentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [operators, setOperators] = useState([]);
  const [assignTo, setAssignTo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchIncident = () => {
    setLoading(true);
    setError('');
    api.get(`/incidents/${id}`)
      .then(r => setIncident(r.data))
      .catch(err => {
        if (err.response?.status === 403) {
          setError('You do not have permission to view this incident.');
        } else if (err.response?.status === 404) {
          setError('Incident not found.');
        } else {
          setError('Failed to load incident. Please try again.');
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIncident();
    if (user?.role === 'admin') {
      api.get('/users/operators')
        .then(r => setOperators(r.data))
        .catch(() => { });
    }
  }, [id]);

  const advanceStatus = async () => {
    const next = statusFlow[incident?.status];
    if (!next) return;
    setSubmitting(true);
    setActionError('');
    try {
      const { data } = await api.patch(`/incidents/${id}/status`, {
        status: next,
        comment: statusComment || null,
      });
      setIncident(data);
      setStatusComment('');
    } catch (e) {
      setActionError(e.response?.data?.message || 'Failed to update status.');
    } finally {
      setSubmitting(false);
    }
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    setActionError('');
    try {
      const { data } = await api.post(`/incidents/${id}/comment`, { comment });
      setIncident(data);
      setComment('');
    } catch (e) {
      setActionError(e.response?.data?.message || 'Failed to add comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const doAssign = async () => {
    if (!assignTo) return;
    setSubmitting(true);
    setActionError('');
    try {
      const { data } = await api.patch(`/incidents/${id}/assign`, {
        assigned_to: assignTo,
      });
      setIncident(data);
      setAssignTo('');
    } catch (e) {
      setActionError(e.response?.data?.message || 'Failed to assign incident.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading incident…</p>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center">
        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-red-400 text-xl">!</span>
        </div>
        <h2 className="text-white font-semibold mb-2">Something went wrong</h2>
        <p className="text-slate-400 text-sm mb-5">{error}</p>
        <button
          onClick={() => navigate('/incidents')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors"
        >
          ← Back to Incidents
        </button>
      </div>
    );
  }

  // ── Guard: incident must exist by now ──
  if (!incident) return null;

  const canUpdateStatus =
    ['operator', 'admin'].includes(user?.role) && incident.status !== 'closed';
  const nextStatus = statusFlow[incident.status] ?? null;
  const updates = Array.isArray(incident.updates) ? incident.updates : [];

  return (
    <div className="max-w-4xl space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start gap-4 flex-wrap">
        <button
          onClick={() => navigate('/incidents')}
          className="mt-1 text-slate-400 hover:text-white text-sm transition-colors"
        >
          ← Back
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white break-words">{incident.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${statusColors[incident.status] ?? ''}`}>
              {incident.status}
            </span>
            <span className={`text-sm font-medium capitalize ${severityColors[incident.severity] ?? 'text-slate-400'}`}>
              {incident.severity}
            </span>
            <span className="text-sm text-slate-500">#{incident.id}</span>
            <span className="text-sm text-slate-500">
              by {incident.reporter?.name ?? 'Unknown'}
            </span>
            {incident.assignee && (
              <span className="text-sm text-slate-500">→ {incident.assignee.name}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Action error banner ── */}
      {actionError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Description */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3">Description</h2>
            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
              {incident.description}
            </p>
            <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-500 flex flex-wrap gap-3">
              <span>Reported {fmt(incident.created_at)}</span>
              {incident.assignee && (
                <span>· Assigned to {incident.assignee.name}</span>
              )}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4">
              Activity Timeline
              <span className="ml-2 text-xs font-normal text-slate-500">
                ({updates.length} {updates.length === 1 ? 'entry' : 'entries'})
              </span>
            </h2>

            {updates.length === 0 ? (
              <p className="text-sm text-slate-500">No activity recorded yet.</p>
            ) : (
              <div className="space-y-1">
                {updates.map((update, i) => (
                  <div key={update.id ?? i} className="flex gap-3">
                    {/* Timeline dot + line */}
                    <div className="flex flex-col items-center pt-1">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${update.type === 'status_change' ? 'bg-amber-400' :
                          update.type === 'assignment' ? 'bg-violet-400' :
                            'bg-slate-500'
                        }`} />
                      {i < updates.length - 1 && (
                        <div className="w-px flex-1 bg-slate-800 mt-1 mb-1 min-h-[1rem]" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="pb-4 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                        <span className="font-medium text-slate-300">
                          {update.user?.name ?? 'System'}
                        </span>

                        {update.type === 'status_change' && (
                          <span>
                            {update.old_status
                              ? <>changed status from <strong className="text-slate-400">{update.old_status}</strong> → <strong className="text-slate-400">{update.new_status}</strong></>
                              : <>opened incident as <strong className="text-slate-400">{update.new_status}</strong></>
                            }
                          </span>
                        )}
                        {update.type === 'assignment' && <span>made an assignment</span>}
                        {update.type === 'comment' && <span>left a comment</span>}

                        <span className="text-slate-600">·</span>
                        <span>{fmt(update.created_at)}</span>
                      </div>

                      {update.comment && (
                        <p className="mt-1.5 text-sm text-slate-300 bg-slate-800 rounded-lg px-3 py-2 break-words">
                          {update.comment}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Comment */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3">Add Comment</h2>
            <textarea
              rows={3}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Write a comment…"
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm
                text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
            <button
              onClick={addComment}
              disabled={submitting || !comment.trim()}
              className="mt-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50
                text-white text-sm font-medium rounded-lg transition-colors"
            >
              Post Comment
            </button>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">

          {/* Status Update */}
          {canUpdateStatus && nextStatus ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-white mb-3">Update Status</h2>
              <p className="text-xs text-slate-400 mb-3">
                Next status:{' '}
                <span className="text-white font-medium capitalize">{nextStatus}</span>
              </p>
              <textarea
                rows={2}
                value={statusComment}
                onChange={e => setStatusComment(e.target.value)}
                placeholder="Optional note…"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm
                  text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none mb-2"
              />
              <button
                onClick={advanceStatus}
                disabled={submitting}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50
                  text-white text-sm font-medium rounded-lg transition-colors capitalize"
              >
                Mark as {nextStatus}
              </button>
            </div>
          ) : incident.status === 'closed' ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-slate-400 text-sm">✓</span>
              </div>
              <p className="text-sm text-slate-400">This incident is closed.</p>
            </div>
          ) : null}

          {/* Assign — Admin only */}
          {user?.role === 'admin' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-white mb-3">Assign Incident</h2>
              {operators.length === 0 ? (
                <p className="text-xs text-slate-500">No operators available.</p>
              ) : (
                <>
                  <select
                    value={assignTo}
                    onChange={e => setAssignTo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm
                      text-white focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
                  >
                    <option value="">Select operator…</option>
                    {operators.map(op => (
                      <option key={op.id} value={op.id}>
                        {op.name} ({op.role})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={doAssign}
                    disabled={submitting || !assignTo}
                    className="w-full py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50
                      text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Assign
                  </button>
                </>
              )}
            </div>
          )}

          {/* Meta info */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-xs space-y-2.5">
            {[
              { label: 'Incident ID', value: `#${incident.id}` },
              { label: 'Severity', value: incident.severity, cls: `capitalize font-medium ${severityColors[incident.severity] ?? ''}` },
              { label: 'Status', value: incident.status, cls: 'capitalize text-white' },
              { label: 'Reporter', value: incident.reporter?.name ?? '—' },
              { label: 'Assignee', value: incident.assignee?.name ?? '—' },
              { label: 'Created', value: fmt(incident.created_at) },
              { label: 'Last updated', value: fmt(incident.updated_at) },
            ].map(row => (
              <div key={row.label} className="flex justify-between gap-2">
                <span className="text-slate-500 shrink-0">{row.label}</span>
                <span className={`text-white text-right break-all ${row.cls ?? ''}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}