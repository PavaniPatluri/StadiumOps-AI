import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Lock, User, Eye, EyeOff, Shield, Activity, Car } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

const DEMO_ACCOUNTS = [
  { username: 'admin', password: 'admin123', role: 'Administrator', color: 'text-purple-400' },
  { username: 'security', password: 'security123', role: 'Security Officer', color: 'text-orange-400' },
  { username: 'medical', password: 'medical123', role: 'Medical Staff', color: 'text-red-400' },
  { username: 'operations', password: 'ops123', role: 'Operations Manager', color: 'text-blue-400' },
  { username: 'volunteer', password: 'vol123', role: 'Volunteer', color: 'text-green-400' },
];

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(username, password);
      setAuth(res.data.user, res.data.access_token);
      toast.success(`Welcome back, ${res.data.user.full_name}!`);
      navigate('/');
    } catch (err: any) {
      // Use mock auth for demo
      const mock = DEMO_ACCOUNTS.find(a => a.username === username && a.password === password);
      if (mock) {
        const mockUser = {
          id: 1, email: `${username}@stadiumops.com`, username,
          full_name: mock.role, role: username as any, is_active: true,
          created_at: new Date().toISOString()
        };
        setAuth(mockUser, 'mock-token-' + username);
        toast.success(`Welcome, ${mock.role}! (Demo Mode)`);
        navigate('/');
      } else {
        toast.error('Invalid credentials. Try a demo account below.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4 shadow-lg shadow-blue-600/25">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">StadiumOps AI</h1>
          <p className="text-slate-400 text-sm mt-1">Smart Stadium & Tournament Operations</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="input-field w-full pl-9"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field w-full pl-9 pr-9"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Signing in...</>
              ) : (
                <>Sign In</>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px bg-slate-700" />
              <span className="text-xs text-slate-500 px-2">Demo Accounts</span>
              <div className="flex-1 h-px bg-slate-700" />
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {DEMO_ACCOUNTS.map(account => (
                <button
                  key={account.username}
                  onClick={() => { setUsername(account.username); setPassword(account.password); }}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 transition-colors text-left"
                >
                  <span className={`text-xs font-medium ${account.color}`}>{account.role}</span>
                  <span className="text-xs text-slate-500 font-mono">{account.username}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feature badges */}
        <div className="flex items-center justify-center gap-3 mt-6">
          {[
            { icon: Shield, label: 'Secure' },
            { icon: Activity, label: 'Live Data' },
            { icon: Car, label: 'Real-time' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
