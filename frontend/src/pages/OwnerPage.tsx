import { Star, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { PasswordUpdate } from '../components/PasswordUpdate';

type OwnerDashboard = {
  store: { name: string; email: string; address: string };
  averageRating: number;
  ratings: Array<{ id: number; value: number; user: { name: string; email: string; address: string } }>;
};

export function OwnerPage({ token }: { token: string }) {
  const [dashboard, setDashboard] = useState<OwnerDashboard | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api<OwnerDashboard>('/stores/owner/dashboard', {}, token).then(setDashboard).catch((error) => setMessage(error.message));
  }, [token]);

  return (
    <main className="dashboard">
      <PasswordUpdate token={token} />
      <section className="metrics">
        <div className="metric"><span>Average rating</span><strong>{dashboard?.averageRating.toFixed(1) ?? '0.0'}</strong></div>
        <div className="metric"><span>Submitted ratings</span><strong>{dashboard?.ratings.length ?? 0}</strong></div>
      </section>
      <section className="panel table-panel">
        <div className="section-title"><Users size={18} /><h2>Rating Users</h2></div>
        {dashboard?.store && <p className="muted">{dashboard.store.name} · {dashboard.store.address}</p>}
        <table>
          <thead><tr><th>User</th><th>Email</th><th>Address</th><th>Rating</th></tr></thead>
          <tbody>
            {dashboard?.ratings.map((rating) => (
              <tr key={rating.id}>
                <td>{rating.user.name}</td>
                <td>{rating.user.email}</td>
                <td>{rating.user.address}</td>
                <td><span className="rating-cell"><Star size={15} fill="currentColor" /> {rating.value}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {message && <p className="status">{message}</p>}
      </section>
    </main>
  );
}
