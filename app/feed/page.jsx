'use client'

import { useEffect, useState } from 'react';

export default function FeedPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch('/api/feed');
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erro ao carregar feed.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setSessions(data.sessions || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-display">Feed de estudos</h1>
      {loading && <div>Carregando...</div>}
      {error && <div className="text-brick">{error}</div>}
      {!loading && sessions.length === 0 && <div className="text-ink-soft">Nenhuma atividade compartilhada pelos seus contatos.</div>}
      <ul className="space-y-3">
        {sessions.map((s) => (
          <li key={s.id} className="sheet p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-ink-soft">{s.user.name} • {s.subject.name}</div>
                <div className="mt-1 text-ink">{s.content}</div>
                <div className="mt-2 text-sm text-ink-soft">{s.duration} minutos • {new Date(s.date).toLocaleString('pt-BR')}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
