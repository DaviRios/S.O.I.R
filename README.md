# Soir

CMS institucional independente, criado em Node.js e TypeScript.

**Autoria:** Davi Rios

## Arquitetura

- API: Fastify 5, Zod e OpenAPI;
- frontend: React 19, Vite, Tailwind CSS 4, TanStack Query, React Hook Form e TipTap;
- persistência: PostgreSQL com tabelas relacionais gerenciadas pelo Prisma;
- autenticação: access token JWT curto em cookie `HttpOnly` e refresh token opaco com rotação;
- mídia: porta de armazenamento com adaptadores para diretório local e S3;
- monorepo: Nx 23.

Os módulos de backend separam rotas, serviços de aplicação e contratos de repositório. A composição com Prisma e armazenamento acontece em `apps/back/src/app.ts`; domínio e serviços não dependem do antigo documento JSONB.

Conteúdos novos começam como `DRAFT` e `isActive=true`. Publicar muda o estado editorial para `PUBLISHED`; excluir realiza soft delete (`isActive=false` e `deletedAt` preenchido). Registros removidos permanecem no banco. Mídias e autores referenciados não podem ser excluídos e retornam HTTP 409.

## Execução local

Requisitos: Node.js 22.18+ ou 24+, npm e PostgreSQL. O Docker é opcional; o Compose incluído fornece apenas o PostgreSQL de desenvolvimento.

```bash
copy .env.example .env
npm install
npm run db:up
npm run db:migrate:deploy
npm run dev
```

- Painel: <http://localhost:4200>
- API: <http://localhost:3000/v1>
- Health check: <http://localhost:3000/v1/health>
- Documentação OpenAPI: <http://localhost:3000/docs>

O comando `npm run dev` usa dois processos independentes e propaga `Ctrl+C` para ambos. Também é possível usar um PostgreSQL instalado localmente e ignorar `db:up`.

Credenciais iniciais de desenvolvimento:

```text
E-mail: valor de `CMS_ADMIN_EMAIL`
Senha:  valor de `CMS_ADMIN_PASSWORD`
```

Defina um `CMS_ADMIN_PASSWORD` próprio antes da primeira execução e um `JWT_SECRET` aleatório com pelo menos 32 caracteres. O usuário administrador só é criado quando a tabela de usuários está vazia.

## Comandos

```bash
npm run dev                 # API e painel; Ctrl+C encerra ambos
npm run dev:back            # somente API
npm run dev:front           # somente painel
npm run build               # builds de produção
npm test                    # testes unitários/frontend e integração via inject
npm run typecheck           # TypeScript strict
npm run lint                # ESLint, incluindo regras de hooks
npm run db:up               # PostgreSQL local via Docker
npm run db:down             # encerra o PostgreSQL do Compose
npm run db:generate         # gera o Prisma Client
npm run db:migrate          # cria/aplica migration de desenvolvimento
npm run db:migrate:deploy   # aplica migrations existentes
npm run db:import-legacy    # importa data/cms.json sem apagá-lo
npm run db:studio           # Prisma Studio
```

Os testes de integração não abrem nem alteram banco algum: usam `Fastify.inject()` e repositórios em memória.

## Configuração

| Variável               | Padrão                  | Uso                                   |
| ---------------------- | ----------------------- | ------------------------------------- |
| `PORT`                 | `3000`                  | porta da API                          |
| `APP_ORIGIN`           | `http://localhost:4200` | origem aceita para mutações           |
| `DATABASE_URL`         | obrigatória             | conexão PostgreSQL                    |
| `JWT_SECRET`           | obrigatória             | assinatura do access token            |
| `CMS_ADMIN_USER`       | `admin`                 | usuário inicial                       |
| `CMS_ADMIN_EMAIL`      | `admin@soir.local`      | e-mail inicial                        |
| `CMS_ADMIN_PASSWORD`   | obrigatório             | senha inicial (mínimo de 8 caracteres) |
| `MEDIA_STORAGE`        | `local`                 | `local` ou `s3`                       |
| `CMS_UPLOAD_DIR`       | `data/uploads`          | raiz do adaptador local               |
| `S3_REGION`            | `us-east-1`             | região S3                             |
| `S3_BUCKET`            | —                       | bucket obrigatório no modo S3         |
| `S3_ENDPOINT`          | —                       | endpoint compatível com S3, opcional  |
| `S3_ACCESS_KEY_ID`     | —                       | credencial opcional                   |
| `S3_SECRET_ACCESS_KEY` | —                       | credencial opcional                   |
| `S3_FORCE_PATH_STYLE`  | `false`                 | compatibilidade com MinIO e similares |

No frontend, `VITE_API_CMS_URL` pode apontar para outra API. No desenvolvimento padrão, o proxy do Vite encaminha `/v1` para `http://localhost:3000`.

## Rotas

Rotas administrativas usam os cookies seguros criados por `POST /v1/users/auth`. O cliente renova automaticamente o access token por `POST /v1/users/auth/refresh`.

| Recurso               | Base                  |
| --------------------- | --------------------- |
| Autenticação          | `/v1/users/auth`      |
| Slides                | `/v1/slides`          |
| Pop-ups               | `/v1/popups`          |
| Ecossistema           | `/v1/ecosystems`      |
| Links da home         | `/v1/home-blog-links` |
| Cases                 | `/v1/cases`           |
| Histórias de clientes | `/v1/client-stories`  |
| Blog                  | `/v1/blog-posts`      |
| Autores               | `/v1/authors`         |
| Imagens               | `/v1/images`          |
| Vídeos                | `/v1/videos`          |
| Mídias Sobre          | `/v1/about-media`     |
| Parceiros             | `/v1/partners`        |
| Carreiras             | `/v1/careers`         |
| Serviços              | `/v1/services`        |

Rotas públicas:

```text
GET /v1/public/pages/home?language=PORTUGUESE
GET /v1/public/pages/cases?language=PORTUGUESE
GET /v1/public/pages/about
GET /v1/public/pages/blog?language=PORTUGUESE
```

## PostgreSQL e mídia

A migration em `prisma/migrations` cria tabelas por domínio, índices e chaves estrangeiras. Não existe uma linha JSONB central nem cache global mutável no backend, portanto múltiplas instâncias podem compartilhar o mesmo PostgreSQL com consistência.

Se houver dados do formato anterior em `data/cms.json`, execute `npm run db:import-legacy` depois da migration. O importador é idempotente por ID, mantém o arquivo original e deve ser executado antes de começar novas edições.

Metadados de mídia ficam em `media_assets`; binários ficam no adaptador configurado. O soft delete não remove o arquivo físico, mantendo a política de retenção definida para o projeto.
