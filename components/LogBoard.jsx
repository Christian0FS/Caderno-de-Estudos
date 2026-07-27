"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, BookPlus } from "lucide-react";
import { formatMinutes, formatDate } from "@/lib/format";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function LogBoard() {
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");

  const [newSubjectName, setNewSubjectName] = useState("");
  const [showNewSubject, setShowNewSubject] = useState(false);

  const [form, setForm] = useState({
    subjectId: "",
    date: todayISO(),
    duration: "",
    content: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function loadAll() {
    setLoading(true);
    const [subjRes, sessRes] = await Promise.all([
      fetch("/api/subjects"),
      fetch("/api/sessions"),
    ]);
    const subjData = await subjRes.json();
    const sessData = await sessRes.json();
    setSubjects(subjData);
    setSessions(sessData);
    setForm((f) => ({ ...f, subjectId: f.subjectId || subjData[0]?.id || "" }));
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const filtered = useMemo(() => {
    if (filterSubject === "all") return sessions;
    return sessions.filter((s) => s.subjectId === Number(filterSubject));
  }, [sessions, filterSubject]);

  async function handleAddSubject(e) {
    e.preventDefault();
    const name = newSubjectName.trim();
    if (!name) return;
    const res = await fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setSubjects((s) => [...s, data].sort((a, b) => a.name.localeCompare(b.name)));
    setForm((f) => ({ ...f, subjectId: data.id }));
    setNewSubjectName("");
    setShowNewSubject(false);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.subjectId) {
      setError("Crie ou selecione uma matéria primeiro.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Erro ao salvar.");
      return;
    }
    setSessions((s) => [data, ...s]);
    setForm((f) => ({ ...f, duration: "", content: "", notes: "" }));
  }

  async function handleDelete(id) {
    setSessions((s) => s.filter((x) => x.id !== id));
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
  }

  return (
    <div className="max-w-4xl">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-soft/70 mb-1">
          Registro
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink">
          O que você estudou?
        </h1>
      </header>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="sheet p-5 md:p-6 mb-8 space-y-4">
        {error && (
          <p className="text-sm text-brick bg-brick/10 border border-brick/30 rounded-sheet px-3 py-2">
            {error}
          </p>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="subject">Matéria</label>
            {!showNewSubject ? (
              <div className="flex gap-2">
                <select
                  id="subject"
                  className="field-input"
                  value={form.subjectId}
                  onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                >
                  {subjects.length === 0 && <option value="">Nenhuma matéria ainda</option>}
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewSubject(true)}
                  className="btn-secondary !px-3"
                  aria-label="Nova matéria"
                  title="Nova matéria"
                >
                  <BookPlus size={16} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  autoFocus
                  className="field-input"
                  placeholder="Nome da nova matéria"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                />
                <button type="button" onClick={handleAddSubject} className="btn-primary !px-3">
                  <Plus size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewSubject(false)}
                  className="btn-secondary !px-3"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="field-label" htmlFor="date">Data</label>
            <input
              id="date"
              type="date"
              className="field-input"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="duration">Duração (minutos)</label>
          <input
            id="duration"
            type="number"
            min="1"
            className="field-input"
            placeholder="ex: 90"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="field-label" htmlFor="content">O que você estudou</label>
          <textarea
            id="content"
            className="field-input min-h-[90px]"
            placeholder="ex: Regra da cadeia e derivadas de funções compostas"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="field-label" htmlFor="notes">Observações (opcional)</label>
          <input
            id="notes"
            className="field-input"
            placeholder="ex: revisar exercícios 5-10 amanhã"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <button type="submit" disabled={submitting} className="btn-primary">
          <Plus size={16} /> {submitting ? "Salvando..." : "Salvar registro"}
        </button>
      </form>

      {/* Lista */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold">Histórico</h2>
        <select
          className="field-input !w-auto text-xs"
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
        >
          <option value="all">Todas as matérias</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-ink-soft">Carregando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-ink-soft">Nenhum registro por aqui ainda.</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((s) => (
            <li key={s.id} className="sheet p-4 flex items-start gap-3">
              <span
                className="h-2.5 w-2.5 rounded-full mt-1.5 shrink-0"
                style={{ backgroundColor: s.subject.color }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
                  <span className="text-sm font-semibold">{s.subject.name}</span>
                  <span className="text-xs text-ink-soft font-mono">
                    {formatDate(s.date)} · {formatMinutes(s.duration)}
                  </span>
                </div>
                <p className="text-sm text-ink">{s.content}</p>
                {s.notes && <p className="text-xs text-ink-soft mt-1 italic">{s.notes}</p>}
              </div>
              <button
                onClick={() => handleDelete(s.id)}
                aria-label="Excluir registro"
                className="text-ink-soft hover:text-brick shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
