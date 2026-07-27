"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Flame, Clock, BookOpen } from "lucide-react";
import { formatMinutes } from "@/lib/format";
import { computeStreak, sumDuration } from "@/lib/stats";

function lastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

export default function StatsBoard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => {
        setSessions(data);
        setLoading(false);
      });
  }, []);

  const totalMinutes = useMemo(() => sumDuration(sessions), [sessions]);
  const streak = useMemo(() => computeStreak(sessions), [sessions]);

  const bySubject = useMemo(() => {
    const map = new Map();
    sessions.forEach((s) => {
      const key = s.subject.name;
      const existing = map.get(key) || { name: key, minutes: 0, color: s.subject.color };
      existing.minutes += s.duration;
      map.set(key, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.minutes - a.minutes);
  }, [sessions]);

  const dailyLast14 = useMemo(() => {
    const days = lastNDays(14);
    return days.map((d) => {
      const label = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      const minutes = sessions
        .filter((s) => new Date(s.date).toDateString() === d.toDateString())
        .reduce((acc, s) => acc + s.duration, 0);
      return { label, minutes };
    });
  }, [sessions]);

  if (loading) {
    return <p className="text-sm text-ink-soft">Carregando...</p>;
  }

  if (sessions.length === 0) {
    return (
      <div className="max-w-4xl">
        <header className="mb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-soft/70 mb-1">
            Estatísticas
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink">
            Ainda sem dados
          </h1>
        </header>
        <p className="text-sm text-ink-soft">
          Registre alguns estudos na página de Registro para ver seus gráficos aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-soft/70 mb-1">
          Estatísticas
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink">
          Seu progresso
        </h1>
      </header>

      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
        <div className="sheet p-4 md:p-5">
          <div className="flex items-center gap-2 text-gold mb-2">
            <Flame size={18} />
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Sequência</span>
          </div>
          <p className="font-display text-2xl md:text-3xl font-semibold">{streak}d</p>
        </div>
        <div className="sheet p-4 md:p-5">
          <div className="flex items-center gap-2 text-moss mb-2">
            <Clock size={18} />
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Total</span>
          </div>
          <p className="font-display text-2xl md:text-3xl font-semibold">{formatMinutes(totalMinutes)}</p>
        </div>
        <div className="sheet p-4 md:p-5">
          <div className="flex items-center gap-2 text-brick mb-2">
            <BookOpen size={18} />
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Matérias</span>
          </div>
          <p className="font-display text-2xl md:text-3xl font-semibold">{bySubject.length}</p>
        </div>
      </div>

      <section className="sheet p-5 md:p-6 mb-6">
        <h2 className="font-display text-lg font-semibold mb-4">Últimos 14 dias</h2>
        <div className="h-56 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyLast14} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8DBCF" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#4B5750" }} axisLine={{ stroke: "#D8DBCF" }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#4B5750" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                formatter={(value) => [formatMinutes(value), "Tempo estudado"]}
                contentStyle={{ borderRadius: 10, borderColor: "#D8DBCF", fontSize: 12 }}
              />
              <Bar dataKey="minutes" fill="#3D5A45" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="sheet p-5 md:p-6">
        <h2 className="font-display text-lg font-semibold mb-4">Tempo por matéria</h2>
        <div className="grid sm:grid-cols-2 gap-6 items-center">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bySubject}
                  dataKey="minutes"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {bySubject.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [formatMinutes(value), name]}
                  contentStyle={{ borderRadius: 10, borderColor: "#D8DBCF", fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2">
            {bySubject.map((s) => (
              <li key={s.name} className="flex items-center gap-2.5 text-sm">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="flex-1 truncate">{s.name}</span>
                <span className="font-mono text-xs text-ink-soft">{formatMinutes(s.minutes)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
