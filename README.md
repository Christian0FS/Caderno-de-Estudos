# Caderno de Estudos

App pessoal (sem login) para registrar o que você estuda e organizar sua agenda de estudos, feito com **Next.js 14 (App Router)**, **Prisma + SQLite** e **Tailwind CSS**.

## Como o site é segmentado

| Página | Rota | O que faz |
|---|---|---|
| **Painel** | `/` | Visão do dia: sequência de dias estudando, horas da semana, blocos de agenda de hoje e últimos registros |
| **Registro** | `/log` | Formulário para lançar o que você estudou (matéria, data, duração, conteúdo, observações) + histórico filtrável por matéria |
| **Agenda** | `/calendar` | Grade semanal (estilo caderno de horários) para montar sua rotina de estudo, com blocos recorrentes (toda semana) ou de data específica |
| **Estatísticas** | `/stats` | Gráficos: tempo estudado nos últimos 14 dias, tempo por matéria, sequência atual e total geral |

Cada área é seu próprio conjunto de páginas/rotas de API dentro de `app/`, então dá pra evoluir uma sem mexer nas outras:

```
app/
  page.js              → Painel
  log/page.js          → Registro
  calendar/page.js     → Agenda
  stats/page.js        → Estatísticas
  api/
    subjects/          → CRUD de matérias
    sessions/          → CRUD de registros de estudo
    schedule/          → CRUD de blocos da agenda
prisma/schema.prisma   → Modelos: Subject, StudySession, ScheduleItem
components/            → Navbar, LogBoard, CalendarBoard, StatsBoard, ReminderWatcher
```

## Como rodar localmente

O projeto usa **Postgres** (não SQLite), pra já sair pronto pra ir ao ar em hospedagens serverless como a Vercel. O jeito mais simples de ter um Postgres gratuito pra desenvolvimento é seguir o **[DEPLOY.md](./DEPLOY.md)** — ele te dá, de brinde, uma `DATABASE_URL` que funciona tanto local quanto em produção.

1. Instale as dependências:
   ```bash
   npm install
   ```
   (isso já roda `prisma generate` automaticamente via `postinstall`)

2. Preencha `DATABASE_URL` no `.env` com a connection string do seu banco Postgres (veja `DEPLOY.md`), depois crie as tabelas:
   ```bash
   npx prisma db push
   ```

3. Suba o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse **http://localhost:3000**

## Colocar no ar de graça

Passo a passo completo (Vercel + banco Postgres gratuito, domínio `.vercel.app` grátis) em **[DEPLOY.md](./DEPLOY.md)**.

## Lembretes / notificações

Na primeira visita, o site pergunta se você quer ativar notificações do navegador. Se você aceitar, a cada 30 segundos ele confere sua agenda e dispara um aviso do navegador no minuto exato do horário marcado — funciona enquanto a aba estiver aberta (não é uma notificação push de verdade, é a Notification API do navegador).

## Próximos passos possíveis

- Editar registros já salvos (hoje dá pra criar e excluir; editar seria um próximo passo natural)
- Exportar o histórico em CSV/PDF
- Metas semanais por matéria com barra de progresso
- Deploy (Vercel + banco Postgres, trocando o `provider` do Prisma)
