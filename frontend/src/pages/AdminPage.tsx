import { Building2, Plus, Users } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { AuthUser, Role, api, toQuery } from '../api/client';
import { Field } from '../components/Field';
import { SortButton } from '../components/SortButton';

type Dashboard = { totalUsers: number; totalStores: number; totalRatings: number };
type StoreRow = { id: number; name: string; email: string; address: string; rating: number };

const emptyUser = { name: '', email: '', address: '', password: 'Admin@123', role: 'USER' as Role };
const emptyStore = { name: '', email: '', address: '', ownerId: '' };

export function AdminPage({ token }: { token: string }) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '', sortBy: 'name', order: 'ASC' });
  const [storeFilters, setStoreFilters] = useState({ name: '', email: '', address: '', sortBy: 'name', order: 'ASC' });
  const [userForm, setUserForm] = useState(emptyUser);
  const [storeForm, setStoreForm] = useState(emptyStore);
  const [message, setMessage] = useState('');

  async function load() {
    const [dash, userRows, storeRows] = await Promise.all([
      api<Dashboard>('/auth/admin/dashboard', {}, token),
      api<AuthUser[]>(`/users${toQuery(filters)}`, {}, token),
      api<StoreRow[]>(`/stores${toQuery(storeFilters)}`, {}, token),
    ]);
    setDashboard(dash);
    setUsers(userRows);
    setStores(storeRows);
  }

  useEffect(() => {
    load().catch((error) => setMessage(error.message));
  }, [filters, storeFilters]);

  function sortUsers(field: string) {
    setFilters((current) => ({
      ...current,
      sortBy: field,
      order: current.sortBy === field && current.order === 'ASC' ? 'DESC' : 'ASC',
    }));
  }

  function sortStores(field: string) {
    setStoreFilters((current) => ({
      ...current,
      sortBy: field,
      order: current.sortBy === field && current.order === 'ASC' ? 'DESC' : 'ASC',
    }));
  }

  async function createUser(event: FormEvent) {
    event.preventDefault();
    await api('/users', { method: 'POST', body: JSON.stringify(userForm) }, token);
    setUserForm(emptyUser);
    setMessage('User created.');
    await load();
  }

  async function createStore(event: FormEvent) {
    event.preventDefault();
    await api('/stores', { method: 'POST', body: JSON.stringify({ ...storeForm, ownerId: Number(storeForm.ownerId) }) }, token);
    setStoreForm(emptyStore);
    setMessage('Store created.');
    await load();
  }

  return (
    <main className="dashboard">
      <section className="metrics">
        <Metric label="Users" value={dashboard?.totalUsers ?? 0} />
        <Metric label="Stores" value={dashboard?.totalStores ?? 0} />
        <Metric label="Ratings" value={dashboard?.totalRatings ?? 0} />
      </section>

      <section className="grid two">
        <form className="panel" onSubmit={createUser}>
          <div className="section-title"><Users size={18} /><h2>Add User</h2></div>
          <Field label="Name" value={userForm.name} onChange={(name) => setUserForm({ ...userForm, name })} />
          <Field label="Email" value={userForm.email} onChange={(email) => setUserForm({ ...userForm, email })} />
          <Field label="Address" textarea value={userForm.address} onChange={(address) => setUserForm({ ...userForm, address })} />
          <Field label="Password" type="password" value={userForm.password} onChange={(password) => setUserForm({ ...userForm, password })} />
          <label className="field">
            <span>Role</span>
            <select value={userForm.role} onChange={(event) => setUserForm({ ...userForm, role: event.target.value as Role })}>
              <option value="USER">Normal User</option>
              <option value="OWNER">Store Owner</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          <button className="primary"><Plus size={16} /> Create</button>
        </form>

        <form className="panel" onSubmit={createStore}>
          <div className="section-title"><Building2 size={18} /><h2>Add Store</h2></div>
          <Field label="Name" value={storeForm.name} onChange={(name) => setStoreForm({ ...storeForm, name })} />
          <Field label="Email" value={storeForm.email} onChange={(email) => setStoreForm({ ...storeForm, email })} />
          <Field label="Address" textarea value={storeForm.address} onChange={(address) => setStoreForm({ ...storeForm, address })} />
          <Field label="Owner user id" value={storeForm.ownerId} onChange={(ownerId) => setStoreForm({ ...storeForm, ownerId })} />
          <button className="primary"><Plus size={16} /> Create</button>
        </form>
      </section>

      {message && <p className="status">{message}</p>}

      <TablePanel title="Users">
        <Filters filters={filters} setFilters={setFilters} includeRole />
        <table>
          <thead>
            <tr>
              {['name', 'email', 'address', 'role'].map((field) => (
                <th key={field}>{field}<SortButton field={field} active={filters.sortBy} order={filters.order} onSort={sortUsers} /></th>
              ))}
            </tr>
          </thead>
          <tbody>{users.map((user) => <tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td>{user.address}</td><td>{user.role}</td></tr>)}</tbody>
        </table>
      </TablePanel>

      <TablePanel title="Stores">
        <Filters filters={storeFilters} setFilters={setStoreFilters} />
        <table>
          <thead>
            <tr>
              {['name', 'email', 'address', 'rating'].map((field) => (
                <th key={field}>{field}<SortButton field={field} active={storeFilters.sortBy} order={storeFilters.order} onSort={sortStores} /></th>
              ))}
            </tr>
          </thead>
          <tbody>{stores.map((store) => <tr key={store.id}><td>{store.name}</td><td>{store.email}</td><td>{store.address}</td><td>{store.rating.toFixed(1)}</td></tr>)}</tbody>
        </table>
      </TablePanel>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}

function TablePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="panel table-panel"><h2>{title}</h2>{children}</section>;
}

function Filters({ filters, setFilters, includeRole = false }: { filters: Record<string, string>; setFilters: (value: any) => void; includeRole?: boolean }) {
  return (
    <div className="filters">
      {['name', 'email', 'address'].map((field) => (
        <input key={field} placeholder={field} value={filters[field]} onChange={(event) => setFilters({ ...filters, [field]: event.target.value })} />
      ))}
      {includeRole && (
        <select value={filters.role} onChange={(event) => setFilters({ ...filters, role: event.target.value })}>
          <option value="">All roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">Normal User</option>
          <option value="OWNER">Store Owner</option>
        </select>
      )}
    </div>
  );
}
