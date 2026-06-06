import { LogOut, ShieldCheck, Store } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { AuthUser, Role, api } from './api/client';
import { Field } from './components/Field';
import { AdminPage } from './pages/AdminPage';
import { OwnerPage } from './pages/OwnerPage';
import { UserPage } from './pages/UserPage';

type AuthState = {
  accessToken: string;
  user: AuthUser;
};

export function App() {
  const [auth, setAuth] = useState<AuthState | null>(() => {
    const saved = localStorage.getItem('auth');
    return saved ? JSON.parse(saved) : null;
  });
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  function saveAuth(next: AuthState) {
    localStorage.setItem('auth', JSON.stringify(next));
    setAuth(next);
  }

  function logout() {
    localStorage.removeItem('auth');
    setAuth(null);
  }

  const page = useMemo(() => {
    if (!auth) return null;
    if (auth.user.role === 'ADMIN') return <AdminPage token={auth.accessToken} />;
    if (auth.user.role === 'OWNER') return <OwnerPage token={auth.accessToken} />;
    return <UserPage token={auth.accessToken} />;
  }, [auth]);

  if (!auth) {
    return <AuthScreen mode={mode} setMode={setMode} onAuth={saveAuth} />;
  }

  return (
    <div>
      <header className="topbar">
        <div className="brand">
          <Store size={24} />
          <div>
            <strong>Store Ratings</strong>
            <span>{roleLabel(auth.user.role)}</span>
          </div>
        </div>
        <div className="account">
          <span>{auth.user.name}</span>
          <button className="secondary" onClick={logout}><LogOut size={16} /> Logout</button>
        </div>
      </header>
      {page}
    </div>
  );
}

function AuthScreen({ mode, setMode, onAuth }: { mode: 'login' | 'signup'; setMode: (mode: 'login' | 'signup') => void; onAuth: (auth: AuthState) => void }) {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const payload = mode === 'signup' ? form : { email: form.email, password: form.password };
      const result = await api<AuthState>(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(payload) });
      onAuth(result);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to continue.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-panel">
        <div className="brand auth-brand">
          <ShieldCheck size={30} />
          <div>
            <strong>Store Ratings</strong>
            <span>Role based rating platform</span>
          </div>
        </div>
        <div className="tabs" role="tablist">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Signup</button>
        </div>
        <form onSubmit={submit}>
          {mode === 'signup' && (
            <>
              <Field label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
              <Field label="Address" textarea value={form.address} onChange={(address) => setForm({ ...form, address })} />
            </>
          )}
          <Field label="Email" value={form.email} onChange={(email) => setForm({ ...form, email })} />
          <Field label="Password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} />
          <button className="primary full" disabled={busy}>{busy ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}</button>
        </form>
        {message && <p className="status error">{message}</p>}
      </section>
    </main>
  );
}

function roleLabel(role: Role) {
  if (role === 'ADMIN') return 'System Administrator';
  if (role === 'OWNER') return 'Store Owner';
  return 'Normal User';
}
