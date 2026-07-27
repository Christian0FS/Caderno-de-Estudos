'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) return setError('As senhas não batem.');

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Erro ao cadastrar.');
      return;
    }
    router.push('/');
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-display mb-4">Cadastro</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-brick">{error}</div>}
        <div>
          <label className="field-label">Nome</label>
          <input
            className="field-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
          />
        </div>
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
            placeholder="mínimo 8 caracteres"
          />
        </div>
        <div>
          <label className="field-label">Confirme a senha</label>
          <input
            type="password"
            className="field-input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repita a senha"
          />
        </div>
        <div>
          <button className="btn-primary" type="submit">Criar conta</button>
        </div>
        <p className="text-sm text-ink-soft">
          Já tem conta? <a href="/login" className="text-moss hover:underline">Entrar</a>
        </p>
      </form>
    </div>
  );
}
