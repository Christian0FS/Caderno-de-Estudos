import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import ReminderWatcher from "@/components/ReminderWatcher";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex-sans",
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "Caderno de Estudos",
  description: "Registre o que você estuda e organize sua agenda de estudos.",
};

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning lang="pt-BR" className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(!t){var p=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;t=p?'dark':'light';}if(t==='dark'){document.documentElement.setAttribute('data-theme','dark');}else{document.documentElement.removeAttribute('data-theme');}}catch(e){}})()` }} />
      </head>
      <body>
        <div className="min-h-screen flex flex-col md:flex-row">
          <Navbar />
          <main className="flex-1 min-w-0 px-4 py-6 md:px-10 md:py-10">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
        <ReminderWatcher />
      </body>
    </html>
  );
}
