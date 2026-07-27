'use client'

import { useEffect, useState } from 'react';

export default function ConnectionsPage() {
  const [connections, setConnections] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch('/api/connections');
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error || 'Erro ao carregar conexões.');
        return;
      }
      setConnections(data.connections || []);
      setIncoming(data.incoming || []);
    }
    load();
  }, []);

  async function accept(connectionId) {
    await fetch('/api/connections/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectionId }),
    });
    setConnections((list) => list.map((item) => item.id === connectionId ? { ...item, status: 'accepted' } : item));
    setIncoming((list) => list.filter((item) => item.id !== connectionId));
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-display">Minhas conexões</h1>
      {loading && <div>Carregando conexões...</div>}
      {error && <div className="text-brick">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2">
        <section className="sheet p-4">
          <h2 className="font-semibold mb-3">Pedidos recebidos</h2>
          {incoming.length === 0 && <div className="text-ink-soft">Nenhum pedido pendente.</div>}
          <ul className="space-y-3">
            {incoming.map((conn) => (
              <li key={conn.id} className="rounded-sheet border border-line p-3">
                <div className="flex items-center justify-between gap-3">
                  <span>{conn.from.name}</span>
                  <button className="btn-primary" onClick={() => accept(conn.id)}>Aceitar</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className="sheet p-4">
          <h2 className="font-semibold mb-3">Conexões</h2>
          {connections.length === 0 && <div className="text-ink-soft">Nenhuma conexão aceita ainda.</div>}
          <ul className="space-y-3">
            {connections.map((conn) => (
              <li key={conn.id} className="rounded-sheet border border-line p-3">
                <div className="flex items-center justify-between gap-3">
                  <span>{conn.peer.name}</span>
                  <span className="text-sm text-ink-soft">{conn.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
