# Sistema de Monitoramento de Desastres Naturais (SMDN)

Monorepo contendo dois produtos:

| Produto | Pasta | Tecnologia | Deploy |
|---|---|---|---|
| Dashboard (agentes públicos) | `web/` | React + Vite | Vercel |
| App comunitário | `mobile/` | Flutter | Google Play / App Store |

## Banco de dados

Supabase — instância compartilhada entre web e mobile.

## Desenvolvimento local

### Web
```bash
cd web
npm install
npm run dev
```

### Mobile
```bash
cd mobile
flutter pub get
flutter run
```

## Deploy

- **Web:** automático via Vercel a cada push em `main` que altere `web/**`
- **Mobile:** build via GitHub Actions a cada push em `main` que altere `mobile/**`

## Variáveis de ambiente

Copie `web/.env.example` para `web/.env` e preencha:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Estrutura do repositório

```
/
├── web/               # Dashboard React + Vite (agentes públicos)
├── mobile/            # App Flutter (comunidade)
├── .github/
│   └── workflows/     # CI/CD pipelines
├── docs/              # Documentação do projeto
├── .gitignore
├── vercel.json        # Aponta rootDirectory para web/
└── README.md
```

## Documentação adicional

Consulte [`docs/architecture.md`](docs/architecture.md) para detalhes sobre a arquitetura do sistema.
