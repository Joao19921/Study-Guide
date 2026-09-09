# Study Hub

Study Management System — centraliza rotina de estudos relacionando Objetivo → Certificação → Tema → Material → Tarefa → Sessão de estudo → Progresso, em um único projeto Next.js (frontend + API + autenticação + banco).

## Stack

Next.js 15 (App Router) · TypeScript · React · Tailwind CSS · shadcn/ui · Route Handlers (API REST) · PostgreSQL (Neon) · Drizzle ORM · Auth.js (Google/GitHub OAuth) · Zod.

## Arquitetura

```
Route Handlers (src/app/api/**)  — auth, parse do body, resposta HTTP
        ↓
Services (src/services/**)       — regras de negócio, validação Zod, checagem de posse
        ↓
Repositories (src/repositories/**) — acesso a dados (Drizzle), sempre filtrado por userId
        ↓
Drizzle ORM → PostgreSQL (Neon)
```

Regras de negócio puras e testáveis (priorização de tarefas, cálculo de progresso) ficam em `src/lib/business-rules.ts`, cobertas por testes em `src/lib/business-rules.test.ts`.

## Configuração local

1. Copie `.env.example` para `.env` e preencha:
   - `DATABASE_URL`: string de conexão de um projeto Postgres no [Neon](https://neon.tech) (free tier).
   - `AUTH_SECRET`: gere com `npx auth secret`.
   - `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`: [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
   - `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET`: [GitHub OAuth Apps](https://github.com/settings/developers).

2. Instale as dependências e aplique as migrations:

   ```bash
   npm install
   npm run db:migrate
   npm run db:seed   # opcional: popula dados de demonstração
   ```

3. Rode o servidor:

   ```bash
   npm run dev
   ```

## Scripts

| Script              | Descrição                                      |
| -------------------- | ----------------------------------------------- |
| `npm run dev`         | Servidor de desenvolvimento                     |
| `npm run build`       | Build de produção                               |
| `npm run lint`        | ESLint                                          |
| `npm run typecheck`   | `tsc --noEmit`                                  |
| `npm run test`        | Testes unitários (Vitest)                       |
| `npm run db:generate` | Gera uma nova migration a partir do schema      |
| `npm run db:migrate`  | Aplica migrations pendentes no banco             |
| `npm run db:seed`     | Popula um usuário e dados de demonstração        |

## CI/CD

`.github/workflows/ci.yml` roda lint, type check, testes e build em cada push/PR para `main`.

## Deploy

- **Aplicação**: [Vercel](https://vercel.com) (suporte nativo a Next.js, Route Handlers e variáveis de ambiente). Configure as mesmas variáveis do `.env` no painel do projeto.
- **Banco**: Neon Postgres (free tier).
- **GitHub Pages não é compatível** com este projeto: ele serve apenas HTML/CSS/JS estático e não executa Route Handlers, Auth.js ou acesso a banco de dados em tempo de execução.

## Autorização

Usuários têm um `role` (`user` por padrão, `admin` para gestão). Rotas administrativas (`/api/admin/**`) exigem `role = admin` e permitem listar usuários e alterar papéis.
