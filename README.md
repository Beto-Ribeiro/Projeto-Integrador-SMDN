# SMDN - Sistema de Monitoramento de Desastres Naturais 

📖 Sobre o Projeto
O Sistema de Monitoramento de Desastres Naturais (SMDN) é um projeto integrador focado em otimizar a resiliência e a resposta a emergências na região do Vale do Paraíba. O objetivo principal é desenvolver uma plataforma bi-direcional de comunicação e monitoramento de desastres naturais. O sistema visa mitigar a falta de alertas eficientes para populações em áreas de risco e reduzir o tempo de resposta dos órgãos de segurança pública e saúde, centralizando dados oficiais e relatos da comunidade.

⚠️ O Problema
O Vale do Paraíba apresenta uma topografia complexa e um histórico recorrente de desastres naturais que impactam severamente a infraestrutura e a segurança da população. O desenvolvimento do sistema foi motivado por:
Vulnerabilidade Geográfica e Climática:
A região possui um cenário propício para inundações graduais, enxurradas repentinas e deslizamentos de massa, exigindo um monitoramento mais ágil do que os canais tradicionais.
Gargalo de Comunicação:
Os alertas atuais via SMS ou sirenes muitas vezes são ignorados ou não atingem toda a população afetada em tempo real. Além disso, o cidadão não possui um canal direto e estruturado para reportar anomalias às autoridades.
Fragmentação da Resposta Operacional: 
A coordenação entre Defesa Civil, Corpo de Bombeiros, SAMU e Polícia Militar muitas vezes depende de chamadas telefônicas ou relatos descentralizados, resultando em atrasos que podem ser fatais.

🎯 Público-Alvo
O sistema atende a dois perfis distintos:
Cidadãos do Vale do Paraíba:
Residentes e transeuntes em áreas suscetíveis a alagamentos, deslizamentos e outros desastres.
Agentes de Resposta:
Gestores e operacionais da Defesa Civil e forças de segurança/saúde que necessitam de dados precisos para tomada de decisão.

🚀 Escopo e Funcionalidades
O sistema é composto por interfaces integradas a um núcleo de inteligência de dados:
Interface Web (Comunidade):
Aplicativo para cidadãos realizarem cadastros, receberem alertas geolocalizados e emitirem avisos de incidentes, podendo anexar fotos.
Dashboard Governamental:
Painel destinado à Defesa Civil, Corpo de Bombeiros, SAMU e Polícia Militar para visualização de mapas de calor, gestão de ocorrências e monitoramento. Possui níveis de acesso distintos para cada órgão.
Notificações Push:
O sistema envia notificações para os usuários que estiverem dentro de um raio de risco estipulado pela Defesa Civil.
Alertas Oficiais: 
O operador da Defesa Civil pode selecionar uma área no mapa e enviar um alerta oficial para todos os usuários com o App naquela região.
Mecanismo de Validação (Antifraude):
Emissão de alertas automáticos (visuais e sonoros) no dashboard dos operadores baseada no volume de relatos em uma mesma área, filtrando alarmes falsos.

🔌 Integração de Dados
O dashboard consumirá e exibirá dados climáticos provenientes das APIs oficiais do INMET e CEMADEN, com atualizações em tempo real a cada 1 hora.

🔒 Segurança e Requisitos Não Funcionais
Segurança e LGPD:
O sistema utiliza criptografia de dados sensíveis (como CPF e senhas) no banco de dados. O tratamento de dados segue rigorosamente a Lei Geral de Proteção de Dados.
Disponibilidade e Desempenho: 
Infraestrutura em nuvem planejada para garantir que o sistema esteja online 99,9% do tempo e painel web capaz de processar renderizações do mapa de calor em até 3 segundos.
Compatibilidade: 
Aplicativo móvel multiplataforma, operando em Android (versão 8.0+) e iOS (versão 13.0+).
Rastreabilidade: 
Sistema que mantém um log inalterável de qual operador da Defesa Civil disparou alertas oficiais.

👥 Equipe do Projeto
Product Owner: Humberto Araújo Ribeiro Neto 
Scrum Master: Thierry Monteiro Assis Santos 
Dev Team: Giovanna Maria de Carvalho Camargo, Alessandra Danielle Lino dos Santos, Adryel Luís Rodrigues, Mauro Celestino Alves Junior, Vinicius Willian de Araujo, Luiz Henrique Silva Ferreira dos Santos 
Orientador: Gildarcio Souza Gonçalvez 
