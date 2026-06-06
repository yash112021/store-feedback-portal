import { Search, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api, toQuery } from '../api/client';
import { PasswordUpdate } from '../components/PasswordUpdate';

type StoreRow = { id: number; name: string; address: string; rating: number; userRating: number | null };

export function UserPage({ token }: { token: string }) {
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [filters, setFilters] = useState({ name: '', address: '', sortBy: 'name', order: 'ASC' });
  const [message, setMessage] = useState('');

  async function load() {
    setStores(await api<StoreRow[]>(`/stores${toQuery(filters)}`, {}, token));
  }

  useEffect(() => {
    load().catch((error) => setMessage(error.message));
  }, [filters]);

  async function rate(storeId: number, value: number) {
    await api(`/stores/${storeId}/ratings/me`, { method: 'PUT', body: JSON.stringify({ value }) }, token);
    setMessage('Rating saved.');
    await load();
  }

  return (
    <main className="dashboard">
      <PasswordUpdate token={token} />
      <section className="panel table-panel">
        <div className="section-title"><Search size={18} /><h2>Stores</h2></div>
        <div className="filters">
          <input placeholder="name" value={filters.name} onChange={(event) => setFilters({ ...filters, name: event.target.value })} />
          <input placeholder="address" value={filters.address} onChange={(event) => setFilters({ ...filters, address: event.target.value })} />
        </div>
        <div className="store-list">
          {stores.map((store) => (
            <article className="store-row" key={store.id}>
              <div>
                <h3>{store.name}</h3>
                <p>{store.address}</p>
                <p>Overall {store.rating.toFixed(1)} · Yours {store.userRating ?? 'Not rated'}</p>
              </div>
              <div className="stars" aria-label={`Rate ${store.name}`}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button key={value} title={`${value} stars`} onClick={() => rate(store.id, value)} className={value <= (store.userRating ?? 0) ? 'selected' : ''}>
                    <Star size={18} fill="currentColor" />
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
        {message && <p className="status">{message}</p>}
      </section>
    </main>
  );
}
