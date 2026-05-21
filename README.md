# ⚠️ DOCUMENTO INTERNO - ACESSO RESTRITO À EQUIPE DO PROJETO

## [cite_start]1. Identificação do Projeto [cite: 30]
* [cite_start]Instituição: FATEC - Faculdade de Tecnologia de Taubaté[cite: 2, 16].
* [cite_start]Curso: Análise e Desenvolvimento de Sistemas (1º Período)[cite: 3, 17, 27].
* [cite_start]Módulo do Produto: Monitoramento[cite: 31].
* [cite_start]Nome do Produto: SMDN (Sistema de Monitoramento de Desastres Naturais)[cite: 12, 13, 31].
* [cite_start]Ano: 2026[cite: 15, 34].

### 1.1 Equipe Scrum e Stakeholders
| Nome | Função |
| :--- | :--- |
| Humberto Araújo Ribeiro Neto | [cite_start]Product Owner [cite: 33] |
| Thierry Monteiro Assis Santos | [cite_start]Scrum Master [cite: 33] |
| Adryel Luís Rodrigues | [cite_start]Scrum Team [cite: 33] |
| Alessandra Danielle Lino dos Santos | [cite_start]Scrum Team [cite: 33] |
| Giovanna Maria de Carvalho Camargo | [cite_start]Scrum Team [cite: 33] |
| Luiz Henrique Silva Ferreira dos Santos | [cite_start]Scrum Team [cite: 33] |
| Mauro Celestino Alves Junior | [cite_start]Scrum Team [cite: 33] |
| Vinicius Willian de Araújo | [cite_start]Scrum Team [cite: 33] |
| Prof. Me. Gildárcio Sousa Gonçalves | [cite_start]Orientador [cite: 28, 37] |

[cite_start]**Stakeholders:** Defesa Civil, Comunidade (Moradores), SAMU, Corpo de Bombeiros e Polícia Militar[cite: 36].

---

## 2. Visão Geral e Objetivos
[cite_start]O SMDN é uma plataforma bidirecional desenvolvida para atuar no monitoramento e comunicação de desastres naturais[cite: 43]. [cite_start]O foco principal do projeto é mitigar a falha na entrega de alertas para populações em áreas de risco e otimizar o tempo de resposta de órgãos de segurança e saúde[cite: 44, 51]. [cite_start]O sistema centraliza dados de fontes oficiais (INMET e CEMADEN) e os integra ao relato direto da comunidade (crowdsourcing)[cite: 45, 52].

[cite_start]**Objetivos Específicos:** [cite: 56]
* [cite_start]Fomento ao Crowdsourcing: disponibilizar um aplicativo móvel intuitivo para cidadãos relatarem ocorrências, anexando fotos e capturando coordenadas de geolocalização automaticamente[cite: 57, 58].
* [cite_start]Centralização e Gestão de Ocorrências: criar um Painel Web seguro para autoridades com mapa de calor em tempo real[cite: 59].
* [cite_start]Comunicação Direcionada: disparar alertas oficiais via notificações Push, restritos a áreas de risco selecionadas[cite: 60].
* [cite_start]Inteligência e Integração de Dados Climáticos: consumir APIs do INMET e CEMADEN e desenvolver lógica antifraude[cite: 61].
* [cite_start]Auxílio em Resgate e Prevenção: fornecer perfil com dados médicos vitais e manuais de sobrevivência acessíveis em modo offline[cite: 62].

---

## [cite_start]3. Arquitetura e Tecnologias [cite: 63]
* [cite_start]**Flutter & Dart:** App Mobile do Cidadão (multiplataforma, alto desempenho, cache offline, integração com Firebase Cloud Messaging)[cite: 66, 67, 68].
* [cite_start]**React:** Painel Web das Autoridades (componentização, mapa de calor, atualizações em menos de 3 segundos via Realtime)[cite: 69, 70, 71].
* [cite_start]**Supabase:** Backend, Banco de Dados e Autenticação (PostgreSQL, websockets, RLS, conformidade com LGPD)[cite: 72, 73, 74].
* [cite_start]**PostGIS:** Extensão Geoespacial do PostgreSQL (armazenamento nativo de coordenadas, segmentação de alertas e filtro antifraude)[cite: 75, 77, 78].
* [cite_start]**Vercel:** Hospedagem e Deploy Contínuo[cite: 79, 81].
* [cite_start]**GitHub:** Versionamento e Colaboração[cite: 82, 83].
* [cite_start]**Jira:** Gerenciamento Ágil com Scrum (boards de sprint, mapeamento de Épicos e User Stories)[cite: 84, 85, 87].

---

## [cite_start]4. Product Backlog [cite: 89]

### [cite_start]4.1 Estrutura de Épicos [cite: 90]
| ID | Nome do Épico | Descrição do Escopo |
| :--- | :--- | :--- |
| **EPIC-001** | App Mobile: Cidadão (Flutter) | [cite_start]Cadastro (CPF), UI/UX mobile, envio de relatos geolocalizados e recebimento de alertas push[cite: 91]. |
| **EPIC-002** | Painel Web: Autoridades (React) | [cite_start]Autenticação de órgãos, dashboard em mapa (PostGIS) e gestão de ocorrências[cite: 91]. |
| **EPIC-003** | Core de Negócio e Alertas | [cite_start]Lógica antifraude para evitar falsos positivos e consumo de dados INMET/CEMADEN[cite: 91]. |
| **EPIC-004** | Infra e Banco de Dados (Supabase) | [cite_start]Configuração PostgreSQL/PostGIS, tabelas, autenticação base e API[cite: 91]. |
| **EPIC-005** | Documentação e Entregas (PI) | [cite_start]Documentação de requisitos (MOSCOW), diagramas UML e preparação de relatórios[cite: 91]. |

### [cite_start]4.2 Histórias de Usuário e Tarefas Técnicas [cite: 92, 104]
| ID | Título | Critério de Aceite |
| :--- | :--- | :--- |
| **US001** | Cadastro de Cidadão | [cite_start]CPFs inválidos bloqueados; dados válidos persistidos no banco[cite: 94]. |
| **US002** | Envio de Relato com Foto | [cite_start]O relato sem foto deve ser bloqueado; deve permitir upload[cite: 94]. |
| **US003** | Captura Automática de GPS | [cite_start]Coordenadas Lat/Long devem ser enviadas automaticamente com o relato[cite: 94]. |
| **US004** | Dicas de Sobrevivência (Offline) | [cite_start]Dicas cacheadas e disponíveis integralmente sem conexão[cite: 94]. |
| **US005** | Perfil com Dados Médicos | [cite_start]Campos de tipo sanguíneo e alergias salvos e exibidos no perfil[cite: 94]. |
| **US006** | Autenticação de Órgãos | [cite_start]Validação contra cadastro de autoridades; tentativas inválidas bloqueadas[cite: 96]. |
| **US007** | Mapa de Calor em Tempo Real | [cite_start]Mapa atualizado automaticamente em menos de 3 segundos após novo relato[cite: 96]. |
| **US008** | Alertas Georreferenciados | [cite_start]Apenas usuários na área selecionada no mapa recebem notificação push[cite: 96]. |
| **US009** | Gestão de Permissões (RBAC) | [cite_start]Cada perfil acessa exclusivamente funções do seu papel; refletido imediatamente[cite: 96]. |
| **US010** | Exportação de Histórico | [cite_start]Exportar ocorrências nos formatos PDF e Excel (.xlsx)[cite: 96]. |
| **US011** | Disparo Automático de Push | [cite_start]Notificação entregue via FCM em até 30 segundos; registro de log[cite: 100]. |
| **US012** | Integração INMET/CEMADEN | [cite_start]Atualização automática a cada 60 minutos; exibição de última atualização em falha[cite: 100]. |
| **US013** | Filtro Antifraude | [cite_start]Cruzar GPS, tempo e distância; relatos abaixo do volume não geram alerta automático[cite: 100]. |
| **US014** | Log de Auditoria | [cite_start]Registro somente-leitura (append-only) contendo ID, timestamp e ação inalteráveis[cite: 100]. |
| **TSK001** | Setup do Banco e PostGIS | [cite_start]Banco online capaz de persistir coordenadas em geometria nativa PostGIS[cite: 105]. |
| **TSK002** | Criptografia (LGPD) | [cite_start]Nenhuma senha ou CPF armazenado em plaintext (ex: uso de bcrypt)[cite: 105]. |
| **TSK003** | Alta Disponibilidade (API) | [cite_start]Failover automático e monitoramento com disponibilidade igual ou superior a 99,9%[cite: 105]. |

---

## [cite_start]5. Especificação de Requisitos e Regras de Negócio [cite: 112, 115, 122]
* [cite_start]**Prioridade:** Alto (Vital), Médio (Agrega Valor), Baixo (Desejável)[cite: 108, 110, 111].

### 5.1 Requisitos Funcionais (RF) e Regras de Negócio (RN) associadas
| ID | Prioridade | Descrição | Regra de Negócio Vinculada |
| :--- | :--- | :--- | :--- |
| **RF001** | Alto | [cite_start]Cadastro com validação de CPF[cite: 113]. | [cite_start]**RN001:** CPF válido, único na base[cite: 123]. |
| **RF002** | Alto | [cite_start]Envio de relatos anexando fotos[cite: 113]. | [cite_start]**RN003:** Obrigatoriedade de evidência (fotografia)[cite: 123]. |
| **RF003** | Alto | [cite_start]Captura automática de GPS[cite: 113]. | [cite_start]**RN002:** Relatos sem GPS válido não processados[cite: 123]. |
| **RF004** | Alto | [cite_start]Login de órgãos públicos[cite: 113]. | [cite_start]**RN008:** Sem auto-cadastro; acesso provido pela administração[cite: 124]. |
| **RF005** | Alto | [cite_start]Renderizar mapa de calor em tempo real[cite: 113]. | N/A |
| **RF006** | Médio | [cite_start]Disparo de alertas georreferenciados[cite: 113]. | [cite_start]**RN005 / RN006:** Ação exclusiva de autoridade enviada para dispositivos no polígono desenhado[cite: 124]. |
| **RF007** | Médio | [cite_start]Disparo automático push via FCM[cite: 114]. | N/A |
| **RF008** | Médio | [cite_start]Integração INMET/CEMADEN[cite: 114]. | N/A |
| **RF009** | Médio | [cite_start]Filtro antifraude de volume e tempo[cite: 114]. | [cite_start]**RN004:** Relatos fisicamente improváveis ocultados do mapa até validação manual[cite: 123]. |
| **RF010** | Médio | [cite_start]Gestão de Permissões (RBAC)[cite: 114]. | N/A |
| **RF011** | Médio | [cite_start]Log de Auditoria[cite: 114]. | [cite_start]**RN007:** Registro de ações inalterável (append-only)[cite: 124]. |
| **RF012** | Baixo | [cite_start]Exportação do histórico de ocorrências[cite: 114]. | N/A |
| **RF013** | Baixo | [cite_start]Perfil de usuário com dados médicos[cite: 114]. | N/A |
| **RF014** | Baixo | [cite_start]Guia de sobrevivência em modo offline[cite: 114]. | N/A |

### [cite_start]5.2 Requisitos Não Funcionais (RNF) [cite: 116, 118]
| ID | Categoria | Prioridade | Descrição |
| :--- | :--- | :--- | :--- |
| **RNF001** | Segurança | Alto | [cite_start]Criptografia de dados sensíveis conforme exigências da LGPD[cite: 118]. |
| **RNF002** | Armazenamento | Alto | [cite_start]Banco utilizar extensão PostGIS para dados espaciais[cite: 118]. |
| **RNF003** | Portabilidade | Alto | [cite_start]App multiplataforma construído com Flutter[cite: 118]. |
| **RNF004** | Usabilidade | Alto | [cite_start]Interface implementada com recursos de Alta Acessibilidade[cite: 118]. |
| **RNF005** | Arquitetura | Médio | [cite_start]Comunicação entre Front e Back suportando Real-time[cite: 118, 120]. |
| **RNF006** | Disponibilidade | Baixo | [cite_start]API do backend com garantias estruturais de Alta Disponibilidade[cite: 121]. |

### [cite_start]5.3 Requisitos Inversos (RI) [cite: 126]
| ID | Origem | Prioridade | Descrição (O sistema NÃO deve...) |
| :--- | :--- | :--- | :--- |
| **RI-001** | RF-001 | Alto | [cite_start]Realizar cadastro de cidadãos sem CPF válido[cite: 128]. |
| **RI-002** | RF-004 | Alto | [cite_start]Permitir acesso administrativo por usuários comuns[cite: 128]. |
| **RI-003** | RNF-001 | Alto | [cite_start]Armazenar dados sensíveis em texto puro[cite: 128]. |
| **RI-004** | RNF-002 | Alto | [cite_start]Tratar dados geográficos como dados comuns sem suporte espacial[cite: 128]. |
| **RI-005** | RF-006 | Médio | [cite_start]Disparar alertas sem delimitação geográfica da área[cite: 128]. |
| **RI-006** | RF-009 | Médio | [cite_start]Considerar todos os relatos como confiáveis sem análise automatizada[cite: 128]. |
| **RI-007** | RF-011 | Médio | [cite_start]Permitir ações críticas sem registro de autoria e rastreabilidade[cite: 128]. |
| **RI-008** | RF-014 | Baixo | [cite_start]Depender exclusivamente de conexão para disponibilizar o guia de sobrevivência[cite: 128]. |

---

## [cite_start]6. Histórico de Revisões e Sprints [cite: 38, 40]
| Data | Versão | Descrição | Participantes/Autor |
| :--- | :--- | :--- | :--- |
| 12/03/2026 | 1 | [cite_start]Início do planejamento do projeto[cite: 39]. | [cite_start]Humberto, Thierry, Mauro, Alessandra, Giovanna, Adryel, Luiz e Vinicius[cite: 39]. |
| 14/03/2026 | 1.0 | [cite_start]Criação inicial do documento de requisitos[cite: 41]. | [cite_start]Humberto[cite: 41]. |
| 26/03/2026 | 1 | [cite_start]Definição de requisitos e tecnologias[cite: 39]. | [cite_start]Humberto, Thierry, Mauro, Alessandra, Giovanna, Adryel e Vinicius[cite: 39]. |
| 29/03/2026 | 1.1 / 1.2 | [cite_start]Ajustes de equipe e implementação de requisitos inversos[cite: 41]. | [cite_start]Humberto e Thierry[cite: 41]. |
| 13/04/2026 | 1 | [cite_start]Refinamento da documentação do projeto[cite: 39]. | [cite_start]Humberto, Thierry, Mauro, Alessandra, Giovanna, Adryel e Vinicius[cite: 39]. |
| 16/04/2026 | 1 | [cite_start]Início do desenvolvimento da aplicação mobile[cite: 39]. | [cite_start]Humberto, Thierry, Mauro, Alessandra, Giovanna, Adryel e Vinicius[cite: 39]. |
| 23/04/2026 | 1.3 | [cite_start]Implementação dos diagramas UML e consolidação[cite: 41]. | [cite_start]Humberto[cite: 41]. |
