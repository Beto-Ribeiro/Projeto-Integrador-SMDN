# Backend de integração Supabase

Esta pasta concentra a camada de acesso a dados do painel web.

Ela não é um servidor Node separado: é a camada do front-end responsável por conversar com o Supabase de forma organizada.

## Estrutura

```txt
backend/
  supabase/      Cliente Supabase
  auth/          Login, logout e autorização web
  dashboard/     Dados do dashboard e mapa
  ocorrencias/   Ocorrências vindas dos relatos mobile
  alertas/       Disparo e histórico de alertas web
  admin/         Painel administrativo e lista de usuários
  perfil/        Perfil, avatar e atividades
  auditoria/     Eventos da auditoria
  relatorios/    Dados de relatórios
  api/           Integrações legadas/auxiliares
```

## Regra do projeto

As telas (`screens`) e componentes não devem acessar o Supabase diretamente.
Elas chamam funções desta pasta.
