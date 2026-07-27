// Calcula a sequência atual de dias consecutivos com pelo menos uma sessão de estudo.
// `sessions` deve estar ordenado ou não — a função ordena internamente por data.
export function computeStreak(sessions) {
  if (!sessions.length) return 0;

  const days = new Set(sessions.map((s) => new Date(s.date).toDateString()));
  let streak = 0;
  let cursor = new Date();

  // se não estudou hoje, a sequência pode ainda estar "viva" contando a partir de ontem
  if (!days.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function startOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

export function sumDuration(sessions) {
  return sessions.reduce((acc, s) => acc + s.duration, 0);
}
