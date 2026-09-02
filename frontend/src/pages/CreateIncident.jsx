import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CreateIncident() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', severity: 'medium' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/incidents', form);
      navigate(`/incidents/${data.id}`);
    } catch (err) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : err.response?.data?.message || 'Failed to create incident.';
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/incidents')} className="text-slate-400 hover:text-white text-sm">← Back</button>
        <div>
          <h1 className="text-xl font-bold text-white">Report Incident</h1>
          <p className="text-sm text-slate-400 mt-0.5">Fill in the details to create a new incident</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        {error && (
          <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Title <span className="text-red-400">*</span></label>
            <input
              type="text" required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Brief, descriptive title"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500
                focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Severity <span className="text-red-400">*</span></label>
            <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white
                focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="low">Low — minor issue, no immediate impact</option>
              <option value="medium">Medium — noticeable impact, manageable</option>
              <option value="high">High — significant impact on operations</option>
              <option value="critical">Critical — system down or major failure</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Description <span className="text-red-400">*</span></label>
            <textarea
              required rows={5}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe what happened, when it started, what systems are affected, and any steps already taken…"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500
                focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="px-5 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
              {loading ? 'Reporting…' : 'Report Incident'}
            </button>
            <button type="button" onClick={() => navigate('/incidents')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}