# ⚠️ DOCUMENTO INTERNO - ACESSO RESTRITO À EQUIPE DO PROJETO

## 1. Identificação do Projeto

* 
**Instituição:** FATEC - Faculdade de Tecnologia de Taubaté.


* 
**Curso:** Análise e Desenvolvimento de Sistemas (1º Período).


* 
**Módulo do Produto:** Monitoramento.


* 
**Nome do Produto:** SMDN (Sistema de Monitoramento de Desastres Naturais).


* 
**Ano:** 2026.



### 1.1 Equipe Scrum e Stakeholders

| Nome | Função |
| --- | --- |
| Humberto Araújo Ribeiro Neto | Product Owner 

 |
| Thierry Monteiro Assis Santos | Scrum Master 

 |
| Adryel Luís Rodrigues | Scrum Team 

 |
| Alessandra Danielle Lino dos Santos | Scrum Team 

 |
| Giovanna Maria de Carvalho Camargo | Scrum Team 

 |
| Luiz Henrique Silva Ferreira dos Santos | Scrum Team 

 |
| Mauro Celestino Alves Junior | Scrum Team 

 |
| Vinicius Willian de Araújo | Scrum Team 

 |
| Prof. Me. Gildárcio Sousa Gonçalves | Orientador 

 |

**Stakeholders:** Defesa Civil, Comunidade (Moradores), SAMU, Corpo de Bombeiros e Polícia Militar.

---

## 2. Visão Geral e Objetivos

O SMDN é uma plataforma bidirecional focada na comunicação e monitoramento de áreas de risco. O foco é mitigar a falha na entrega de alertas e otimizar o tempo de resposta. O sistema une inteligência climática (fontes oficiais) ao relato direto da comunidade (crowdsourcing).

**Objetivos Específicos:**

* 
**Fomento ao Crowdsourcing:** App móvel para relatos com fotos e captura de GPS.


* 
**Centralização de Ocorrências:** Painel Web seguro com mapa de calor em tempo real.


* 
**Comunicação Direcionada:** Alertas oficiais via push restritos a áreas de risco.


* 
**Inteligência de Dados:** Consumo de APIs do INMET e CEMADEN e lógica antifraude.


* 
**Auxílio Offline:** Perfil com dados médicos e manuais de sobrevivência offline.



---

## 3. Arquitetura e Tecnologias

* 
**Flutter & Dart:** Desenvolvimento do App Mobile do cidadão com suporte nativo e cache offline.


* 
**React:** Construção do Painel Web das Autoridades com atualizações em tempo real (Realtime).


* 
**Supabase:** Backend-as-a-Service (BaaS) operando PostgreSQL, autenticação, armazenamento e websockets.


* 
**PostGIS:** Extensão espacial do PostgreSQL para cruzamento geográfico e mapas de calor.


* 
**Vercel:** Hospedagem e deploy contínuo do front-end.


* 
**GitHub:** Versionamento de código e feature branches.


* 
**Jira:** Gerenciamento ágil com mapeamento de sprints e product backlog.



---

## 4. Product Backlog

### 4.1 Estrutura de Épicos (Epics)

| ID | Épico | Descrição do Escopo |
| --- | --- | --- |
| **EPIC-001** | App Mobile: Cidadão (Flutter) | Cadastro (CPF), UI/UX mobile, envio de relatos com GPS e recebimento de alertas.

 |
| **EPIC-002** | Painel Web: Autoridades (React) | Login de órgãos, mapa de calor (PostGIS) e gestão de ocorrências.

 |
| **EPIC-003** | Core de Negócio e Alertas | Lógica antifraude (falsos positivos) e consumo INMET/CEMADEN.

 |
| **EPIC-004** | Infra e Banco de Dados | Configuração PostgreSQL/PostGIS, tabelas, RBAC e API base.

 |
| **EPIC-005** | Documentação e Entregas (PI) | Documentação, arquitetura UML e relatórios.

 |

### 4.2 Histórias de Usuário (User Stories) e Tarefas Técnicas

| ID | Épico Associado | Título / Descrição | Critério de Aceite |
| --- | --- | --- | --- |
| **US001** | EPIC-001 | Cadastro com CPF válido. | Bloquear CPF inválido; persistir dados válidos.

 |
| **US002** | EPIC-001 | Envio de Relato com Foto. | Bloquear relato sem foto; permitir upload.

 |
| **US003** | EPIC-001 | Captura Automática de GPS. | Coordenadas enviadas automaticamente com o relato.

 |
| **US004** | EPIC-001 | Dicas de Sobrevivência (Offline). | Cache disponível integralmente sem internet.

 |
| **US005** | EPIC-001 | Perfil com Dados Médicos. | Salvar e exibir tipo sanguíneo e alergias.

 |
| **US006** | EPIC-002 | Autenticação de Órgãos Públicos. | Validar identidade contra cadastro de autoridades.

 |
| **US007** | EPIC-002 | Mapa de Calor em Tempo Real. | Atualização do mapa em menos de 3 segundos.

 |
| **US008** | EPIC-002 | Alertas Georreferenciados. | Enviar push apenas para usuários dentro da área desenhada.

 |
| **US009** | EPIC-002 | Gestão de Permissões (RBAC). | Acesso exclusivo por funcionalidade definida ao papel.

 |
| **US010** | EPIC-002 | Exportação de Histórico. | Exportar histórico em PDF e Excel (.xlsx).

 |
| **US011** | EPIC-003 | Disparo Automático de Push. | Entrega via FCM em até 30s e registro de log.

 |
| **US012** | EPIC-003 | Integração INMET/CEMADEN. | Atualização climática automática a cada 60 min.

 |
| **US013** | EPIC-003 | Filtro Antifraude (Volume). | Bloquear alertas automáticos sem volume mínimo de relatos.

 |
| **US014** | EPIC-003 | Log de Auditoria. | Log somente-leitura (append-only) com timestamp e ID.

 |
| **TSK001** | EPIC-004 | Setup do PostGIS. | Banco persistindo coordenadas como geometria nativa.

 |
| **TSK002** | EPIC-004 | Criptografia de Dados (LGPD). | Nenhuma senha/CPF armazenada em plaintext (ex: bcrypt).

 |
| **TSK003** | EPIC-004 | Alta Disponibilidade (API). | Failover automático configurado com uptime igual/maior que 99,9%.

 |

---

## 5. Especificações de Requisitos (Matriz de Rastreabilidade)

A priorização segue a lógica de: **A** (Alto / Vital), **M** (Médio / Agrega Valor), **B** (Baixo / Nice to Have).

### 5.1 Requisitos Funcionais (RF) e Regras de Negócio (RN)

| Ref. | Prioridade | Descrição do Requisito | Regra de Negócio Associada (RN) |
| --- | --- | --- | --- |
| **RF001** | Alto | Cadastro de cidadão com validação de CPF.

 | <br>**RN001**: CPF deve ser válido e único.

 |
| **RF002** | Alto | Envio de relatos anexando fotos.

 | <br>**RN003**: Relato exige no mínimo uma foto anexada.

 |
| **RF003** | Alto | Captura automática do GPS no relato.

 | <br>**RN002**: Relato não processado sem coordenadas GPS.

 |
| **RF004** | Alto | Login exclusivo para órgãos públicos.

 | <br>**RN008**: Sem auto-cadastro; acesso via credencial da administração.

 |
| **RF005** | Alto | Mapa de calor renderizado em tempo real.

 | (Integrado com US007). |
| **RF006** | Médio | Autoridades disparam alertas baseados em área.

 | <br>**RN005 / RN006**: Disparo exclusivo de "Autoridade Pública" focado estritamente no polígono desenhado.

 |
| **RF007** | Médio | Disparo automático via FCM.

 | (Integrado com TSK003). |
| **RF008** | Médio | Consumo da API INMET/CEMADEN.

 | (Integrado com US012). |
| **RF009** | Médio | Filtro de volume e tempo antifraude.

 | <br>**RN004**: Ocultar do mapa relatos que excedam limite de velocidade/distância ou tempo improvável até validação manual.

 |
| **RF010** | Médio | Gestão de perfis (RBAC).

 | (Integrado com US009). |
| **RF011** | Médio | Log de Auditoria de alertas.

 | <br>**RN007**: Registro inalterável (append-only) de ações críticas.

 |
| **RF012** | Baixo | Exportação de Histórico.

 | (Integrado com US010). |
| **RF013** | Baixo | Perfil de usuário com informações médicas.

 | (Integrado com US005). |
| **RF014** | Baixo | Guias de sobrevivência offline no mobile.

 | (Integrado com US004). |

### 5.2 Requisitos Não Funcionais (RNF)

| ID | Categoria | Prioridade | Descrição |
| --- | --- | --- | --- |
| **RNF001** | Segurança | Alto | Criptografia de dados sensíveis conforme LGPD.

 |
| **RNF002** | Armazenamento | Alto | Uso da extensão PostGIS no Supabase para dados espaciais.

 |
| **RNF003** | Portabilidade | Alto | App mobile multiplataforma construído com Flutter.

 |
| **RNF004** | Acessibilidade | Alto | Interface implementada com recursos de Alta Acessibilidade.

 |
| **RNF005** | Arquitetura | Médio | Comunicação entre Front e Back suportando Real-time.

 |
| **RNF006** | Disponibilidade | Baixo | Backend com garantias estruturais de Alta Disponibilidade.

 |

### 5.3 Requisitos Inversos (RI)

O que o sistema estritamente **não deve** fazer:

* 
**RI-001 (Alto):** Não realiza cadastro de cidadãos sem CPF válido.


* 
**RI-002 (Alto):** Não permite acesso administrativo por usuários comuns.


* 
**RI-003 (Alto):** Não armazena dados sensíveis em texto puro.


* 
**RI-004 (Alto):** Não trata dados geográficos como dados comuns (exige suporte espacial).


* 
**RI-005 (Médio):** Não dispara alertas sem delimitação geográfica.


* 
**RI-006 (Médio):** Não considera todos os relatos como confiáveis sem passar por análise.


* 
**RI-007 (Médio):** Não permite ações críticas sem registro de rastreabilidade e autoria.


* 
**RI-008 (Baixo):** Não depende exclusivamente de internet para carregar o guia de sobrevivência.



---

## 6. Histórico e Planejamento de Sprints

| Data | Versão / Evento | Descrição / Autoria |
| --- | --- | --- |
| 12/03/2026 | - | Sprint Planning: Início do planejamento (Equipe Completa).

 |
| 14/03/2026 | 1.0 | Criação inicial do documento (Autor: Humberto).

 |
| 26/03/2026 | - | Sprint Planning: Definição de requisitos e tecnologias.

 |
| 29/03/2026 | 1.1 e 1.2 | Ajustes de equipe e implementação de Requisitos Inversos (Autores: Humberto e Thierry).

 |
| 13/04/2026 | - | Sprint Planning: Refinamento da documentação.

 |
| 16/04/2026 | - | Sprint Planning: Início do desenvolvimento da aplicação mobile.

 |
| 23/04/2026 | 1.3 | Implementação UML e consolidação (Autor: Humberto).

 |
