import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '▦', roles: ['reporter', 'operator', 'admin'] },
  { path: '/incidents', label: 'Incidents', icon: '⚠', roles: ['reporter', 'operator', 'admin'] },
  { path: '/incidents/new', label: 'Report Incident', icon: '+', roles: ['reporter', 'operator', 'admin'] },
  { path: '/users', label: 'User Management', icon: '⊛', roles: ['admin'] },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleColor = {
    admin: 'bg-violet-600',
    operator: 'bg-sky-600',
    reporter: 'bg-emerald-600',
  };

  const allowed = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white font-bold text-sm">!</div>
              <div>
                <p className="font-semibold text-sm text-white leading-none">IncidentOps</p>
                <p className="text-xs text-slate-500 mt-0.5">Operations Center</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {allowed.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${active ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'}`}
                >
                  <span className="w-5 text-center">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User */}
          <div className="px-3 py-4 border-t border-slate-800">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className={`w-8 h-8 rounded-full ${roleColor[user?.role]} flex items-center justify-center text-white text-xs font-bold`}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            ☰
          </button>
          <div className="flex-1" />
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${roleColor[user?.role]} bg-opacity-20 text-white`}>
            {user?.role}
          </span>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}