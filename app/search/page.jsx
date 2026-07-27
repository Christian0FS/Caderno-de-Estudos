'use client'

import { useState } from 'react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch(`/api/users?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Erro ao buscar usuários.');
      return;
    }
    setUsers(data.users || []);
  }

  async function sendRequest(userId) {
    await fetch('/api/connections/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId: userId }),
    });
    setUsers((current) => current.map((user) => user.id === userId ? { ...user, connectionStatus: 'pending-sent' } : user));
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="sheet p-6">
        <h1 className="text-2xl font-display mb-4">Buscar colegas</h1>
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            className="field-input flex-1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite um nome"
          />
          <button className="btn-primary" type="submit">Buscar</button>
        </form>
      </div>
      {error && <div className="text-brick">{error}</div>}
      {loading && <div>Buscando...</div>}
      <ul className="space-y-3">
        {users.map((user) => (
          <li key={user.id} className="sheet p-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-ink">{user.name}</div>
              <div className="text-sm text-ink-soft">{user.connectionStatus === 'none' ? 'Nenhuma conexão' : user.connectionStatus === 'accepted' ? 'Conectado' : 'Pedido pendente'}</div>
            </div>
            <div>
              {user.connectionStatus === 'none' ? (
                <button className="btn-secondary" onClick={() => sendRequest(user.id)}>Pedir conexão</button>
              ) : user.connectionStatus === 'pending-sent' ? (
                <span className="text-ink-soft">Pedido enviado</span>
              ) : user.connectionStatus === 'accepted' ? (
                <span className="text-ink-soft">Conectado</span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
