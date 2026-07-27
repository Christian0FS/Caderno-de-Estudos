"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";

const FIRED_KEY = "estudo:lembretes-disparados";
const DISMISSED_KEY = "estudo:banner-dispensado";

function getFiredToday() {
  try {
    const raw = localStorage.getItem(FIRED_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const today = new Date().toDateString();
    return parsed.day === today ? parsed.ids : [];
  } catch {
    return [];
  }
}

function markFired(id) {
  const today = new Date().toDateString();
  const ids = getFiredToday();
  localStorage.setItem(FIRED_KEY, JSON.stringify({ day: today, ids: [...ids, id] }));
}

export default function ReminderWatcher() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (Notification.permission === "default" && !dismissed) {
      setShowBanner(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    async function check() {
      if (Notification.permission !== "granted") return;
      try {
        const res = await fetch("/api/schedule", { cache: "no-store" });
        if (!res.ok) return;
        const items = await res.json();

        const now = new Date();
        const todayDow = now.getDay();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const firedToday = getFiredToday();

        for (const item of items) {
          const isToday = item.recurring
            ? item.dayOfWeek === todayDow
            : item.date && new Date(item.date).toDateString() === now.toDateString();
          if (!isToday) continue;

          const [h, m] = item.startTime.split(":").map(Number);
          const startMinutes = h * 60 + m;
          const diff = nowMinutes - startMinutes;

          // dispara se estamos dentro da janela de 0-1 minuto após o horário marcado
          if (diff >= 0 && diff <= 1 && !firedToday.includes(item.id)) {
            new Notification("Hora de estudar 📚", {
              body: `${item.subject?.name || "Estudo"} — ${item.title || "bloco de estudo"} às ${item.startTime}`,
              tag: `estudo-${item.id}`,
            });
            markFired(item.id);
          }
        }
      } catch {
        // silencioso — não interrompe a navegação por falha de rede
      }
    }

    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md sheet px-4 py-3 flex items-center gap-3">
      <Bell size={18} className="text-gold shrink-0" />
      <p className="text-sm text-ink flex-1">
        Ativar avisos no navegador para os horários da sua agenda?
      </p>
      <button
        className="btn-primary !px-3 !py-1.5 text-xs"
        onClick={() => {
          Notification.requestPermission().finally(() => setShowBanner(false));
        }}
      >
        Ativar
      </button>
      <button
        aria-label="Dispensar"
        onClick={() => {
          localStorage.setItem(DISMISSED_KEY, "1");
          setShowBanner(false);
        }}
        className="text-ink-soft hover:text-ink"
      >
        <X size={16} />
      </button>
    </div>
  );
}
