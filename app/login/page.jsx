"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // If already authenticated (cookie present), redirect to home
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) router.replace('/');
      } catch (e) {}
    })();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, remember }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Erro ao efetuar login.');
      return;
    }
    if (data.forcePasswordChange) {
      router.push('/change-password');
      return;
    }
    router.push('/');
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-display mb-4">Entrar</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-brick">{error}</div>}
        <div>
          <label className="field-label">E-mail</label>
          <input
            type="email"
            className="field-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@exemplo.com"
          />
        </div>
        <div>
          <label className="field-label">Senha</label>
          <input
            type="password"
            className="field-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className="flex items-center gap-3">
          <input id="remember" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <label htmlFor="remember" className="text-sm">Lembrar de mim</label>
        </div>
        <div className="flex gap-3">
          <button className="btn-primary flex-1" type="submit">Entrar</button>
          <button type="button" className="btn-secondary flex-1" onClick={() => router.push('/signup')}>Cadastrar</button>
        </div>
        <p className="text-sm text-ink-soft">
          Ou use os botões acima para entrar ou cadastrar uma nova conta.
        </p>
      </form>
    </div>
  );
}
