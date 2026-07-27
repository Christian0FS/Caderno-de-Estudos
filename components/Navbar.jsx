"use client";

import { useState } from "react";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, NotebookPen, CalendarRange, BarChart3, Menu, X } from "lucide-react";
import { Moon, Sun, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

const links = [
  { href: "/", label: "Painel", icon: LayoutDashboard },
  { href: "/log", label: "Registro", icon: NotebookPen },
  { href: "/calendar", label: "Agenda", icon: CalendarRange },
  { href: "/stats", label: "Estatísticas", icon: BarChart3 },
  { href: "/feed", label: "Feed", icon: LayoutDashboard },
  { href: "/search", label: "Buscar", icon: NotebookPen },
  { href: "/connections", label: "Conexões", icon: BarChart3 },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved) {
        setTheme(saved);
      } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!theme) return;
    try {
      if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
      else document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', theme);
    } catch (e) {}
  }, [theme]);

  return (
    <>
      {/* Topo mobile */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-line bg-paper-alt sticky top-0 z-30">
        <span className="flex items-center gap-2 font-display text-lg font-semibold italic text-moss-dark">
          <Image src="/logo.png" alt="" width={28} height={28} className="rounded-md" />
          Caderno de Estudos
        </span>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="p-2 rounded-sheet border border-line"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <nav className="md:hidden bg-paper-alt border-b border-line px-4 pb-4">
          <ul className="flex flex-col gap-1">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-sheet px-3 py-2.5 text-sm font-medium transition-colors ${
                      active ? "bg-moss text-paper-alt" : "text-ink hover:bg-card"
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:flex-col md:w-60 md:shrink-0 md:border-r md:border-line md:bg-paper-alt md:min-h-screen md:sticky md:top-0">
        <div className="px-6 pt-8 pb-6">
          <p className="flex items-center gap-2.5 font-display italic text-xl font-semibold text-moss-dark leading-tight">
            <Image src="/logo.png" alt="" width={34} height={34} className="rounded-md shrink-0" />
            <span>
              Caderno de
              <br />
              Estudos
            </span>
          </p>
        </div>
        <ul className="flex-1 px-3 space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <li key={href} className="relative">
                {active && (
                  <span className="absolute -left-3 top-0 bottom-0 w-1 rounded-full bg-gold" />
                )}
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-sheet px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-moss text-paper-alt shadow-card"
                      : "text-ink-soft hover:bg-card hover:text-ink"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="px-6 py-6 text-xs text-ink-soft/70 font-mono">
          <div className="flex items-center justify-between">
            <span>uma matéria por vez.</span>
            <div className="flex items-center gap-2">
              <button
                aria-label="Alternar tema"
                onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                className="p-2 rounded-sheet border border-line bg-card"
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </button>
              <button
                aria-label="Sair"
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  router.push('/login');
                }}
                className="p-2 rounded-sheet border border-line bg-card"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
