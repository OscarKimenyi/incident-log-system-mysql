import { useEffect, useState } from 'react';
import api from '../api/axios';

const roleColors = {
  admin: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  operator: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  reporter: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'reporter' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = () => {
    api.get('/users').then(r => setUsers(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => {
    setEditUser(null);
    setForm({ name: '', email: '', password: '', role: 'reporter' });
    setError('');
    setShowForm(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSubmitting(true);
    try {
      if (editUser) {
        const payload = { name: form.name, email: form.email, role: form.role };
        if (form.password) payload.password = form.password;
        await api.patch(`/users/${editUser.id}`, payload);
      } else {
        await api.post('/users', form);
      }
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : err.response?.data?.message || 'Operation failed.';
      setError(msg);
    } finally { setSubmitting(false); }
  };

  const toggleActive = async (u) => {
    await api.patch(`/users/${u.id}`, { is_active: !u.is_active });
    fetchUsers();
  };

  const deleteUser = async (u) => {
    if (!confirm(`Delete user "${u.name}"? This cannot be undone.`)) return;
    await api.delete(`/users/${u.id}`);
    fetchUsers();
  };

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">User Management</h1>
          <p className="text-sm text-slate-400 mt-0.5">{users.length} users registered</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors">
          + Add User
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-5">
              {editUser ? 'Edit User' : 'Create User'}
            </h2>
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Jane Smith' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'jane@example.com' },
                { label: editUser ? 'New Password (leave blank to keep)' : 'Password', key: 'password', type: 'password', placeholder: '••••••' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">{f.label}</label>
                  <input type={f.type} value={form[f.key]} placeholder={f.placeholder}
                    required={f.key !== 'password' || !editUser}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500
                      focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white
                    focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="reporter">Reporter</option>
                  <option value="operator">Operator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                  {submitting ? 'Saving…' : editUser ? 'Save Changes' : 'Create User'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
                          {u.name[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-slate-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${roleColors[u.role]}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs font-medium ${u.is_active ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(u)}
                          className="text-xs text-slate-400 hover:text-white transition-colors">Edit</button>
                        <button onClick={() => toggleActive(u)}
                          className={`text-xs transition-colors ${u.is_active ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'}`}>
                          {u.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button onClick={() => deleteUser(u)}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}