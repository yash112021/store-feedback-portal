import { KeyRound } from 'lucide-react';
import { useState } from 'react';
import { api } from '../api/client';
import { Field } from './Field';

export function PasswordUpdate({ token }: { token: string }) {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      await api('/users/me/password', { method: 'PATCH', body: JSON.stringify({ password }) }, token);
      setPassword('');
      setMessage('Password updated.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel compact" onSubmit={submit}>
      <div className="section-title">
        <KeyRound size={18} />
        <h2>Password</h2>
      </div>
      <Field label="New password" type="password" value={password} onChange={setPassword} />
      <button className="primary" disabled={busy}>{busy ? 'Updating...' : 'Update'}</button>
      {message && <p className="status">{message}</p>}
    </form>
  );
}
