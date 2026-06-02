# Arquitetura do Sistema — SMDN

## Visão Geral

O SMDN (Sistema de Monitoramento de Desastres Naturais) é composto por dois produtos integrados através de um banco de dados Supabase compartilhado.

```
┌─────────────────────┐     ┌─────────────────────┐
│   Dashboard Web      │     │   App Mobile         │
│   (React + Vite)    │     │   (Flutter)          │
│   Agentes Públicos  │     │   Comunidade         │
└────────┬────────────┘     └──────────┬──────────┘
         │                             │
         └──────────┬──────────────────┘
                    │
         ┌──────────▼──────────┐
         │      Supabase        │
         │  PostgreSQL + PostGIS│
         │  Auth + Realtime     │
         └─────────────────────┘
```

## Stack Tecnológico

### Web (`web/`)
- **Framework:** React 18 + Vite
- **Linguagem:** JavaScript (JSX)
- **Deploy:** Vercel (automático via GitHub Actions)
- **Usuário alvo:** Agentes públicos de resposta a desastres

### Mobile (`mobile/`)
- **Framework:** Flutter
- **Linguagem:** Dart
- **Distribuição:** Google Play / App Store
- **Usuário alvo:** Comunidade em geral

### Banco de Dados
- **Plataforma:** Supabase
- **Motor:** PostgreSQL com extensão PostGIS (dados geoespaciais)
- **Recursos:** Auth, Realtime, Storage

## Fluxo de Deploy

```
Push para main
│
├── Alterações em web/**  →  GitHub Actions  →  Vercel (produção)
│
└── Alterações em mobile/** →  GitHub Actions  →  Build APK (release)
```

## Variáveis de Ambiente

### Web
| Variável | Descrição |
|---|---|
| `VITE_SUPABASE_URL` | URL da instância Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave pública anônima do Supabase |

### Secrets do GitHub Actions
| Secret | Usado em |
|---|---|
| `VERCEL_TOKEN` | web-deploy.yml |
| `VERCEL_ORG_ID` | web-deploy.yml |
| `VERCEL_PROJECT_ID` | web-deploy.yml |
| `VITE_SUPABASE_URL` | web-deploy.yml (build) |
| `VITE_SUPABASE_ANON_KEY` | web-deploy.yml (build) |
