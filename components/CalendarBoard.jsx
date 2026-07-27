"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { DAY_NAMES, DAY_SHORT, formatDate } from "@/lib/format";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function CalendarBoard() {
  const [subjects, setSubjects] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    subjectId: "",
    title: "",
    recurring: true,
    dayOfWeek: "1",
    date: todayISO(),
    startTime: "19:00",
    endTime: "20:00",
  });
  const [submitting, setSubmitting] = useState(false);

  async function loadAll() {
    setLoading(true);
    const [subjRes, itemsRes] = await Promise.all([
      fetch("/api/subjects"),
      fetch("/api/schedule"),
    ]);
    const subjData = await subjRes.json();
    const itemsData = await itemsRes.json();
    setSubjects(subjData);
    setItems(itemsData);
    setForm((f) => ({ ...f, subjectId: f.subjectId || subjData[0]?.id || "" }));
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const byDay = useMemo(() => {
    const map = Array.from({ length: 7 }, () => []);
    items
      .filter((i) => i.recurring)
      .forEach((i) => map[i.dayOfWeek].push(i));
    map.forEach((day) => day.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    return map;
  }, [items]);

  const upcomingSpecific = useMemo(() => {
    const now = new Date(new Date().toDateString());
    return items
      .filter((i) => !i.recurring && new Date(i.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [items]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.subjectId) {
      setError("Cadastre uma matéria na página de Registro primeiro.");
      return;
    }
    if (form.startTime >= form.endTime) {
      setError("O horário de término precisa ser depois do início.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        dayOfWeek: form.recurring ? Number(form.dayOfWeek) : undefined,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error || "Erro ao salvar.");
      return;
    }
    setItems((s) => [...s, data]);
    setForm((f) => ({ ...f, title: "" }));
  }

  async function handleDelete(id) {
    setItems((s) => s.filter((x) => x.id !== id));
    await fetch(`/api/schedule/${id}`, { method: "DELETE" });
  }

  return (
    <div className="max-w-6xl">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-soft/70 mb-1">
          Agenda
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink">
          Sua semana de estudos
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
            <label className="field-label" htmlFor="cal-subject">Matéria</label>
            <select
              id="cal-subject"
              className="field-input"
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
            >
              {subjects.length === 0 && <option value="">Nenhuma matéria ainda</option>}
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="cal-title">Título (opcional)</label>
            <input
              id="cal-title"
              className="field-input"
              placeholder="ex: revisão para a prova"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={form.recurring}
              onChange={() => setForm({ ...form, recurring: true })}
            />
            Toda semana
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={!form.recurring}
              onChange={() => setForm({ ...form, recurring: false })}
            />
            Data específica
          </label>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {form.recurring ? (
            <div>
              <label className="field-label" htmlFor="cal-day">Dia da semana</label>
              <select
                id="cal-day"
                className="field-input"
                value={form.dayOfWeek}
                onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
              >
                {DAY_NAMES.map((d, idx) => (
                  <option key={d} value={idx}>{d}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="field-label" htmlFor="cal-date">Data</label>
              <input
                id="cal-date"
                type="date"
                className="field-input"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          )}
          <div>
            <label className="field-label" htmlFor="cal-start">Início</label>
            <input
              id="cal-start"
              type="time"
              className="field-input"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="cal-end">Término</label>
            <input
              id="cal-end"
              type="time"
              className="field-input"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary">
          <Plus size={16} /> {submitting ? "Salvando..." : "Adicionar à agenda"}
        </button>
      </form>

      {/* Grade semanal — estilo caderno de horários */}
      {loading ? (
        <p className="text-sm text-ink-soft">Carregando...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 mb-8">
          {DAY_NAMES.map((name, idx) => (
            <div key={name} className="sheet p-3 flex flex-col">
              <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft border-b border-line pb-2 mb-2">
                {DAY_SHORT[idx]}
              </p>
              <div className="space-y-2 flex-1">
                {byDay[idx].length === 0 ? (
                  <p className="text-xs text-ink-soft/50 italic">livre</p>
                ) : (
                  byDay[idx].map((item) => (
                    <div
                      key={item.id}
                      className="rounded-sheet border-l-[3px] bg-paper-alt px-2.5 py-2 group relative"
                      style={{ borderLeftColor: item.subject.color }}
                    >
                      <p className="text-xs font-semibold truncate pr-4">{item.subject.name}</p>
                      {item.title && (
                        <p className="text-[11px] text-ink-soft truncate">{item.title}</p>
                      )}
                      <p className="font-mono text-[11px] text-ink-soft mt-0.5">
                        {item.startTime}–{item.endTime}
                      </p>
                      <button
                        onClick={() => handleDelete(item.id)}
                        aria-label="Remover bloco"
                        className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 text-ink-soft hover:text-brick transition-opacity"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Datas específicas futuras */}
      {upcomingSpecific.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-semibold mb-3">Datas marcadas</h2>
          <ul className="space-y-2">
            {upcomingSpecific.map((item) => (
              <li key={item.id} className="sheet p-3.5 flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.subject.color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {item.subject.name}
                    {item.title ? ` — ${item.title}` : ""}
                  </p>
                  <p className="font-mono text-xs text-ink-soft">
                    {formatDate(item.date)} · {item.startTime}–{item.endTime}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  aria-label="Remover"
                  className="text-ink-soft hover:text-brick shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
