# Soir

CMS institucional independente desenvolvido em Node.js e TypeScript. O projeto reúne o painel editorial e a API REST `/v1` em um monorepo Nx.

**Autoria:** Davi Rios

## Stack

- Backend: Node.js, TypeScript e NestJS 11
- Frontend: React 19, Vite, Tailwind CSS 4 e TipTap
- Autenticação: JWT + Argon2
- Persistência local: JSON com gravação serializada
- Mídia local: upload de imagens e vídeos em `data/uploads`
- Monorepo: Nx 23

## Funcionalidades

- autenticação administrativa;
- autores e posts do blog;
- slides, pop-ups, ecossistema e links de blog da home;
- histórias de clientes;
- cases, imagens do case e depoimentos;
- mídias da página Sobre;
- parceiros, carreiras e serviços;
- galeria com upload de imagens e vídeos;
- ciclos de ativação, rascunho, publicação e despublicação;
- conteúdo em português e inglês;
- páginas públicas agregadas para `home`, `cases`, `about` e `blog`.

## Executando localmente

Requisitos: Node.js 20+ e npm.

```bash
npm install
npm run dev
```

- Painel: http://localhost:4200
- API: http://localhost:3000/v1
- Health/info: http://localhost:3000/v1

Credenciais iniciais do ambiente local:

```text
E-mail: admin@soir.local
Senha:  admin123
```

Defina `CMS_ADMIN_PASSWORD` antes da primeira execução para trocar a senha inicial. Em produção, defina também um `JWT_SECRET` forte.

## Comandos

```bash
npm run dev          # backend e frontend
npm run dev:back     # somente API
npm run dev:front    # somente painel
npm run build        # build de produção
npm test             # testes do monorepo
npm run typecheck    # validação TypeScript estrita
```

## Rotas compatíveis

Rotas administrativas requerem `Authorization: Bearer <token>`:

| Recurso               | Base                  |
| --------------------- | --------------------- |
| Autenticação          | `POST /v1/users/auth` |
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

Rotas públicas, sem autenticação:

```text
GET /v1/public/pages/home?language=PORTUGUESE
GET /v1/public/pages/cases
GET /v1/public/pages/about
GET /v1/public/pages/blog?language=PORTUGUESE
```

## Configuração

O backend aceita as seguintes variáveis:

| Variável             | Padrão                            | Uso                           |
| -------------------- | --------------------------------- | ----------------------------- |
| `PORT`               | `3000`                            | porta da API                  |
| `CORS_ORIGIN`        | `http://localhost:4200`           | origens separadas por vírgula |
| `JWT_SECRET`         | segredo apenas de desenvolvimento | assinatura JWT                |
| `CMS_ADMIN_USER`     | `admin`                           | usuário inicial               |
| `CMS_ADMIN_EMAIL`    | `admin@soir.local`                | e-mail inicial                |
| `CMS_ADMIN_PASSWORD` | `admin123`                        | senha inicial                 |
| `CMS_DATA_FILE`      | `data/cms.json`                   | arquivo de persistência       |
| `CMS_UPLOAD_DIR`     | `data/uploads`                    | diretório de mídia            |

No frontend, `VITE_API_CMS_URL` pode apontar para outra API. Em desenvolvimento, o proxy do Vite encaminha `/v1` para `http://localhost:3000`.

## Dados

O banco local e os uploads são criados automaticamente e ignorados pelo Git. O formato de armazenamento foi isolado no módulo `storage`, permitindo substituir o adaptador local por MySQL/PostgreSQL e S3 sem alterar os controllers ou o frontend.
