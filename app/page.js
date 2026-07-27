import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { computeStreak, startOfWeek, sumDuration } from "@/lib/stats";
import { formatMinutes, formatDate, DAY_NAMES } from "@/lib/format";
import { Flame, Clock, NotebookPen, CalendarRange, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  const todayDow = now.getDay();

  const [allSessions, recentSessions, scheduleToday] = await Promise.all([
    prisma.studySession.findMany({ select: { date: true, duration: true } }),
    prisma.studySession.findMany({
      include: { subject: true },
      orderBy: { date: "desc" },
      take: 5,
    }),
    prisma.scheduleItem.findMany({
      where: {
        OR: [
          { recurring: true, dayOfWeek: todayDow },
          { recurring: false, date: { gte: new Date(now.toDateString()) } },
        ],
      },
      include: { subject: true },
      orderBy: { startTime: "asc" },
    }),
  ]);

  const weekStart = startOfWeek();
  const weekSessions = allSessions.filter((s) => new Date(s.date) >= weekStart);
  const weekMinutes = sumDuration(weekSessions);
  const streak = computeStreak(allSessions);

  const todayItems = scheduleToday.filter((item) =>
    item.recurring
      ? item.dayOfWeek === todayDow
      : new Date(item.date).toDateString() === now.toDateString()
  );

  return (
    <div className="max-w-5xl">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-soft/70 mb-1">
          {DAY_NAMES[todayDow]}, {formatDate(now)}
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink">
          O que você vai estudar hoje?
        </h1>
      </header>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8">
        <div className="sheet p-4 md:p-5">
          <div className="flex items-center gap-2 text-gold mb-2">
            <Flame size={18} />
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Sequência
            </span>
          </div>
          <p className="font-display text-2xl md:text-3xl font-semibold">
            {streak} {streak === 1 ? "dia" : "dias"}
          </p>
        </div>
        <div className="sheet p-4 md:p-5">
          <div className="flex items-center gap-2 text-moss mb-2">
            <Clock size={18} />
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Esta semana
            </span>
          </div>
          <p className="font-display text-2xl md:text-3xl font-semibold">
            {formatMinutes(weekMinutes)}
          </p>
        </div>
        <div className="sheet p-4 md:p-5 col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 text-brick mb-2">
            <CalendarRange size={18} />
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Blocos hoje
            </span>
          </div>
          <p className="font-display text-2xl md:text-3xl font-semibold">{todayItems.length}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Agenda de hoje */}
        <section className="sheet p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Agenda de hoje</h2>
            <Link href="/calendar" className="text-xs font-semibold text-moss hover:underline inline-flex items-center gap-1">
              ver agenda <ArrowRight size={14} />
            </Link>
          </div>
          {todayItems.length === 0 ? (
            <p className="text-sm text-ink-soft">
              Nada marcado para hoje. Que tal criar um bloco de estudo?
            </p>
          ) : (
            <ul className="space-y-2">
              {todayItems.map((item) => (
                <li key={item.id} className="flex items-center gap-3 rounded-sheet border border-line px-3 py-2.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.subject.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.subject.name}</p>
                    {item.title && <p className="text-xs text-ink-soft truncate">{item.title}</p>}
                  </div>
                  <span className="font-mono text-xs text-ink-soft shrink-0">
                    {item.startTime}–{item.endTime}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Registros recentes */}
        <section className="sheet p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Últimos registros</h2>
            <Link href="/log" className="text-xs font-semibold text-moss hover:underline inline-flex items-center gap-1">
              ver todos <ArrowRight size={14} />
            </Link>
          </div>
          {recentSessions.length === 0 ? (
            <p className="text-sm text-ink-soft">
              Você ainda não registrou nenhum conteúdo estudado.
            </p>
          ) : (
            <ul className="space-y-2">
              {recentSessions.map((s) => (
                <li key={s.id} className="rounded-sheet border border-line px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-sm font-medium">{s.subject.name}</span>
                    <span className="font-mono text-xs text-ink-soft shrink-0">
                      {formatMinutes(s.duration)}
                    </span>
                  </div>
                  <p className="text-xs text-ink-soft truncate">{s.content}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="flex flex-wrap gap-3 mt-8">
        <Link href="/log" className="btn-primary">
          <NotebookPen size={16} /> Registrar estudo
        </Link>
        <Link href="/calendar" className="btn-secondary">
          <CalendarRange size={16} /> Montar agenda
        </Link>
      </div>
    </div>
  );
}
