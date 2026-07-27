# Colocar o Caderno de Estudos no ar (de graça)

Combinação usada: **Vercel** (hospedagem do Next.js, plano Hobby, gratuito) + **Neon** (banco Postgres, plano gratuito, acessado pela própria Vercel). Os dois têm camada grátis permanente pra uso pessoal — sem cartão de crédito.

O SQLite que usamos no desenvolvimento local **não funciona em produção** (a Vercel não guarda arquivos entre uma requisição e outra), por isso o `prisma/schema.prisma` já está configurado pra usar Postgres. Localmente você pode continuar development apontando pro mesmo banco Postgres gratuito (passo 4 explica isso).

## 1. Suba o projeto pro GitHub

Se ainda não tem um repositório:
```bash
cd study-tracker
git init
git add .
git commit -m "Caderno de Estudos"
```
Crie um repositório vazio em **github.com/new** (ex: `caderno-de-estudos`) e depois:
```bash
git remote add origin https://github.com/Christian0FS/caderno-de-estudos.git
git branch -M main
git push -u origin main
```

## 2. Crie a conta na Vercel e importe o projeto

1. Acesse **vercel.com** → "Sign Up" → entre com sua conta do GitHub (login social, sem custo)
2. No dashboard, clique em **"Add New" → "Project"**
3. Selecione o repositório `caderno-de-estudos` → **Import**
4. Em "Framework Preset" ele já vai detectar **Next.js** sozinho. Não clique em Deploy ainda — primeiro faça o passo 3.

## 3. Crie o banco Postgres gratuito (Neon)

1. Ainda na tela de configuração do projeto (ou depois, na aba **Storage** do projeto já criado), clique em **"Connect Store" → "Create New" → Neon (Postgres)**
2. Escolha o plano **Free**
3. A Vercel cria o banco e já registra a variável de ambiente `DATABASE_URL` no seu projeto automaticamente — você não precisa copiar nada na mão

## 4. Sincronize o schema com o banco

Agora o Prisma precisa criar as tabelas (`Subject`, `StudySession`, `ScheduleItem`) dentro do banco Neon. O jeito mais simples:

```bash
npm install -g vercel      # CLI da Vercel, se ainda não tiver
vercel link                # conecta a pasta local ao projeto que você criou no site
vercel env pull .env       # puxa a DATABASE_URL real pro seu .env local
npx prisma db push         # cria as tabelas no banco de produção
```

Depois disso, se rodar `npm run dev` localmente, seu ambiente local vai estar usando o **mesmo banco** de produção — ótimo pra um projeto pessoal (um usuário só, sem ambiente de teste separado).

## 5. Deploy

Clique em **Deploy** no site da Vercel (ou, se já tinha feito deploy antes do passo 4, vá em **Deployments → ⋯ → Redeploy**).

Em ~1 minuto o site estará no ar em uma URL gratuita como:

```
https://caderno-de-estudos.vercel.app
```

Com HTTPS automático — necessário inclusive pras notificações do navegador funcionarem.

## 6. Deploys automáticos

A partir de agora, todo `git push` na branch `main` gera um novo deploy automaticamente. Não precisa repetir os passos 2 e 3.

Se um dia você mudar o `schema.prisma` (nova tabela, novo campo), rode `npx prisma db push` de novo (apontando pro `.env` de produção) antes ou depois do deploy, pra manter o banco sincronizado.

## Sobre o domínio

O endereço `seuprojeto.vercel.app` já é **gratuito e definitivo** — não expira, não tem anúncio, funciona 100%. Se no futuro você quiser um domínio próprio (`caderno.com.br`, por exemplo), é só comprar o domínio em qualquer registrador e adicionar em **Project → Settings → Domains** na Vercel; isso aí sim tem custo (o domínio em si), mas é opcional.

## Limites do plano gratuito (não deve te afetar num projeto pessoal)

- **Vercel Hobby**: uso pessoal/não-comercial, 100 GB de tráfego/mês, funções com até 10s de execução
- **Neon Free**: ~100 horas de computação/mês, 0,5 GB de armazenamento — de sobra pra registros de estudo
