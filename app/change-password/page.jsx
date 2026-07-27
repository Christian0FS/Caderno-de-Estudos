'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!password || !confirm) return setError('Preencha as duas senhas.');
    if (password !== confirm) return setError('As senhas não batem.');
    if (password.length < 8) return setError('A senha deve ter pelo menos 8 caracteres.');

    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Erro ao alterar a senha.');
      return;
    }

    setSuccess('Senha alterada com sucesso. Redirecionando...');
    setTimeout(() => router.push('/'), 1200);
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-display mb-4">Trocar senha</h1>
      <p className="text-ink-soft mb-4">É necessário atualizar sua senha antes de continuar.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-brick">{error}</div>}
        {success && <div className="text-moss">{success}</div>}
        <div>
          <label className="field-label">Nova senha</label>
          <input type="password" className="field-input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Confirme a nova senha</label>
          <input type="password" className="field-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <div>
          <button className="btn-primary" type="submit">Salvar senha</button>
        </div>
      </form>
    </div>
  );
}
