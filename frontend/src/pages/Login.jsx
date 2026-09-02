import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const demoUsers = [
    { email: 'admin@incidentlog.com', label: 'Admin', color: 'bg-violet-600' },
    { email: 'alice@incidentlog.com', label: 'Operator', color: 'bg-sky-600' },
    { email: 'charlie@incidentlog.com', label: 'Reporter', color: 'bg-emerald-600' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-500 rounded-2xl mb-4">
            <span className="text-white text-2xl font-bold">!</span>
          </div>
          <h1 className="text-2xl font-bold text-white">IncidentOps</h1>
          <p className="text-slate-400 text-sm mt-1">Operations & Incident Center</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-5">Sign in to your account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500
                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500
                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-medium text-sm rounded-lg transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Demo accounts */}
        <div className="mt-4 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-500 mb-3">Demo accounts — all use password: <code className="text-slate-300">password</code></p>
          <div className="space-y-2">
            {demoUsers.map(u => (
              <button
                key={u.email}
                onClick={() => setForm({ email: u.email, password: 'password' })}
                className="w-full flex items-center gap-3 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-left"
              >
                <div className={`w-6 h-6 rounded-full ${u.color} flex items-center justify-center text-white text-xs font-bold`}>
                  {u.label[0]}
                </div>
                <div>
                  <p className="text-xs font-medium text-white">{u.label}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}