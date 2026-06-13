# SMDN - Pacote completo Web + Supabase Admin

Este pacote contém as alterações do web e os SQLs para você aplicar manualmente no Supabase.

## Conteúdo

```txt
web/src/lib/supabase.js
web/src/utils/webRoles.js
web/src/services/authService.js
web/src/services/webAccessService.js
web/src/services/adminService.js
web/src/context/AuthContext.jsx
web/src/App.jsx
web/src/components/Sidebar.jsx
web/src/screens/Login.jsx
web/src/screens/AdminPanel.jsx
web/.env.local.example
supabase/sql/01_fix_auth_trigger.sql
supabase/sql/02_web_admin_tables.sql
supabase/sql/03_create_first_admin_TEMPLATE.sql
supabase/functions/approve-web-access-request/index.ts
SUPABASE_PASSO_A_PASSO.md
```

## Aplicar no projeto

Copie a pasta `web/src` por cima do seu `web/src`, ou copie arquivo por arquivo para os mesmos caminhos.

Depois:

```bash
cd web
npm install @supabase/supabase-js
```

Crie `web/.env.local` usando `web/.env.local.example` como base.

## Aplicar no Supabase

Siga o arquivo:

```txt
SUPABASE_PASSO_A_PASSO.md
```

## Segurança

- O mobile não foi alterado.
- O service_role não vai no frontend.
- O bypass local só funciona com `import.meta.env.DEV` e `localhost`.
- As alterações SQL precisam ser rodadas manualmente por você no Supabase.
