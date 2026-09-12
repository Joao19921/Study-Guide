# Evolução do Study Hub — Administração, Credenciais e Competição

**Status:** proposta técnica + fundação de dados implementada na branch `feature/admin-competition`.

## 1. Resumo executivo

A evolução mantém o **monólito modular** atual do Study Hub. O sistema já possui RBAC simples (`user`/`admin`), proteção de APIs administrativas e uma entidade `certifications` voltada ao planejamento/preparação. A evolução deve ampliar essa base sem introduzir microsserviços, Kubernetes ou mensageria distribuída.

A solução é dividida em três capacidades:

1. **Administração de usuários:** cadastro, edição, ativação/desativação, gestão de papel e recuperação de acesso.
2. **Credenciais conquistadas:** separar o objetivo de certificação da evidência de uma certificação efetivamente obtida.
3. **Competição:** pontuação auditável, temporadas, ranking e evolução por desempenho e credenciais.

## 2. Estado atual

### Confirmado

- Next.js + TypeScript + React.
- PostgreSQL/Neon + Drizzle ORM.
- Auth.js com login por credenciais.
- `users.role` já existe e `requireAdmin()` restringe APIs administrativas.
- Existem APIs administrativas para listar usuários e alterar papel.
- Existe `passwordHash` e uma implementação de hash/verificação baseada em `scrypt`.
- `certifications` possui nome, provedor, data de prova, progresso e vínculo com temas.
- `studySessions` registra duração e data da sessão.
- `tasks` registra conclusão.

### Lacunas identificadas

- Não havia estado ativo/inativo de usuário.
- Não havia mecanismo de recuperação de senha administrado pela aplicação.
- Não havia `mustChangePassword`.
- `certifications` não comprova, por si só, que o certificado foi conquistado.
- Não havia modelo persistente de temporada/ranking.
- Não havia trilha de eventos de pontuação.
- Não havia auditoria administrativa dedicada.

## 3. Decisão de arquitetura

### Recomendação: monólito modular

Fluxo:

```text
UI Next.js
   |
Route Handlers / API
   |
Services
   |
Repositories
   |
Drizzle ORM
   |
PostgreSQL / Neon
```

A competição é um módulo de domínio dentro da mesma aplicação.

### Alternativas consideradas

| Alternativa | Decisão | Motivo |
|---|---|---|
| Monólito modular | **Recomendada** | Menor custo operacional e encaixe natural na arquitetura existente |
| Microsserviços | Não recomendado agora | Complexidade de deploy, observabilidade, comunicação e consistência sem benefício comprovado |
| Event-driven distribuído | Não recomendado agora | O volume e a necessidade de processamento assíncrono ainda não foram comprovados |
| Kubernetes | Não recomendado | Não há requisito que justifique sua operação |

## 4. Administração de usuários

### Funcionalidades

| Capacidade | Estado alvo |
|---|---|
| Listar usuários | Existente |
| Alterar papel | Existente |
| Criar usuário | A implementar |
| Editar nome/e-mail | A implementar |
| Ativar usuário | A implementar |
| Desativar usuário | A implementar |
| Recuperar senha | A implementar |
| Forçar troca de senha | Fundação de dados implementada |
| Consultar desempenho | A implementar |
| Consultar certificados | A implementar |
| Auditoria administrativa | A implementar |

### Papéis

Inicialmente manter apenas:

- `user`
- `admin`

Não criar `super_admin`, `manager` etc. sem requisito de negócio.

### Regras de segurança

1. Um administrador não pode remover o próprio privilégio administrativo.
2. Usuário desativado não pode autenticar.
3. Alterações administrativas devem registrar ator, alvo, ação, data e resultado.
4. Senhas nunca devem ser armazenadas em texto puro.
5. Recuperação de senha deve usar token aleatório, de uso único e com expiração curta.
6. Token de recuperação deve ser armazenado apenas em forma derivada/hash.
7. O endpoint de recuperação não deve revelar se um e-mail existe para solicitantes não autenticados.

## 5. Certificação x certificado

### Regra de domínio

`certification` representa **o objetivo de preparação**.

`certificate` representa **a credencial conquistada**, com evidência e estado de validação.

Essa separação evita que um usuário ganhe pontos apenas por cadastrar uma certificação que ainda pretende realizar.

### Certificado

Campos implementados na fundação:

- usuário;
- nome;
- provedor;
- URL da credencial;
- data de emissão;
- status de verificação;
- pontos;
- data de verificação;
- administrador responsável pela verificação.

### Regra de pontuação

Somente certificado **verificado** deve contribuir para a competição.

O valor de pontos é persistido para preservar o valor aplicado à época da conquista. Mudanças futuras na tabela de pontuação não devem alterar retroativamente temporadas encerradas.

## 6. Modelo de competição

### Conceito

A competição é organizada em **temporadas**. Cada temporada possui início, fim e estado.

Estados:

- `scheduled`
- `active`
- `closed`

O ranking de uma temporada considera somente participantes elegíveis e atividades ocorridas dentro do período da temporada.

### Componentes de pontuação

A primeira versão deve priorizar comportamento de estudo real e não apenas cadastro de certificados.

**Recomendação inicial de composição:**

- 50% desempenho de estudo;
- 30% credenciais conquistadas;
- 20% consistência.

Esses pesos são uma **recomendação**, não requisito de negócio. Devem ser parametrizados antes de produção se houver necessidade de ajuste sem deploy.

### Desempenho

A fundação utiliza dados já existentes no domínio:

- sessões de estudo;
- tarefas concluídas;
- progresso de preparação.

Não atribuir pontos por simplesmente criar uma sessão ou tarefa.

### Consistência

Indicador baseado em dias distintos de atividade no período. Evitar premiar volume artificial de sessões no mesmo dia.

### Certificados

Certificados devem ser verificados por um administrador antes de gerar pontuação competitiva.

## 7. Ranking

### Ranking corrente

Ordenação principal:

1. score total descendente;
2. pontos de desempenho descendentes;
3. pontos de certificado descendentes;
4. data da última atividade ascendente como desempate estável.

O último critério deverá ser persistido quando o ranking definitivo for fechado.

### Ranking histórico

Ao encerrar uma temporada, o resultado deve ser congelado. Não recalcular posições históricas com dados posteriores.

## 8. Temporadas e ligas

### MVP

Começar somente com temporadas e ranking.

### Evolução

Adicionar ligas após validar o comportamento dos usuários:

- Bronze
- Prata
- Ouro
- Diamante

A quantidade final de ligas é uma recomendação e pode ser alterada.

Promoção/rebaixamento também deve ser parametrizável e não codificado como regra fixa.

## 9. Modelo de dados

### Usuário

```text
users
 ├─ role
 ├─ active
 ├─ must_change_password
 ├─ deactivated_at
 └─ updated_at
```

### Credencial

```text
users 1 ─── N certificates
```

### Competição

```text
competition_seasons 1 ─── N competition_results
users                1 ─── N competition_results
```

### Resultado

O resultado guarda os componentes utilizados para produzir a pontuação final, permitindo auditoria e explicação do ranking.

## 10. Fundação de banco entregue

A branch contém:

- campos de ciclo de vida de usuário;
- `certificates`;
- `competition_seasons`;
- `competition_results`;
- `tasks.completed_at`;
- índices básicos para consultas competitivas;
- migration `0003_admin_competition.sql` registrada no journal do Drizzle.

**Importante:** a fundação de banco não significa que todas as telas e APIs descritas neste documento já estejam implementadas.

## 11. APIs alvo

### Administração

```text
GET    /api/admin/users
POST   /api/admin/users
GET    /api/admin/users/:id
PATCH  /api/admin/users/:id
POST   /api/admin/users/:id/activate
POST   /api/admin/users/:id/deactivate
POST   /api/admin/users/:id/password-reset
```

### Certificados

```text
GET    /api/certificates
POST   /api/certificates
GET    /api/certificates/:id
PATCH  /api/certificates/:id
POST   /api/admin/certificates/:id/verify
POST   /api/admin/certificates/:id/reject
```

### Competição

```text
GET /api/competition/current
GET /api/competition/seasons
GET /api/competition/seasons/:id/ranking
GET /api/competition/me
```

Administração de temporadas poderá ser adicionada posteriormente:

```text
POST  /api/admin/competition/seasons
PATCH /api/admin/competition/seasons/:id
POST  /api/admin/competition/seasons/:id/close
```

## 12. UI alvo

### Área administrativa

```text
Administração
 ├── Dashboard
 ├── Usuários
 │    ├── Lista
 │    ├── Novo usuário
 │    └── Detalhes
 ├── Certificados
 │    ├── Pendentes
 │    └── Verificados
 └── Competição
      ├── Temporada atual
      ├── Ranking
      └── Configuração
```

### Usuário

Adicionar ao dashboard:

- posição atual;
- pontuação da temporada;
- certificados verificados;
- sequência de estudo;
- evolução semanal;
- histórico de temporadas.

## 13. Auditoria

Criar futuramente `admin_audit_logs`:

```text
id
actor_user_id
target_user_id
action
metadata
created_at
ip_hash / request_id (conforme necessidade e política de privacidade)
```

Não armazenar senha, token de recuperação ou outros segredos no log.

## 14. Observabilidade

Métricas recomendadas:

- login_success_total;
- login_failure_total;
- admin_user_actions_total;
- password_reset_requested_total;
- password_reset_completed_total;
- certificates_verified_total;
- competition_ranking_calculation_total;
- competition_ranking_duration_ms.

Logs devem usar `request_id`/correlation ID e não registrar credenciais ou tokens.

## 15. Segurança e LGPD

### Riscos principais

- privilégio administrativo indevido;
- recuperação de senha abusada;
- manipulação de pontuação;
- certificado falso;
- exposição de dados pessoais no ranking;
- enumeração de usuários;
- alteração retroativa do score.

### Controles

- RBAC no servidor;
- validação Zod;
- least privilege;
- rate limit para autenticação/recuperação;
- tokens de recuperação de uso único;
- auditoria administrativa;
- score derivado de fatos de domínio;
- certificado não verificado não pontua;
- ranking com dados mínimos necessários.

## 16. Trade-offs

### Score calculado x score armazenado

**Recomendação:** manter componentes do resultado e, quando necessário, eventos de pontuação.

- Calculado sob demanda: menos dados redundantes, mas consultas mais complexas.
- Armazenado: ranking rápido, mas exige mecanismo de atualização consistente.
- Eventos/ledger: melhor auditabilidade e recomputação, com maior complexidade.

Para o MVP, `competition_results` é suficiente para temporadas fechadas. Um `points_events` poderá ser adicionado quando houver necessidade de regras mais dinâmicas.

### Ranking global x ligas

Ranking global é simples, mas pode desmotivar usuários novos. Ligas reduzem a diferença de escala e são mais próximas de padrões observados em plataformas de aprendizagem competitivas.

**Recomendação:** começar com ranking por temporada e introduzir ligas após validar adesão.

## 17. Roadmap

### Fase 1 — Administração

- CRUD de usuário;
- ativação/desativação;
- recuperação de senha;
- troca obrigatória de senha;
- proteção de rotas;
- auditoria.

### Fase 2 — Credenciais

- cadastro de certificado;
- evidência;
- validação administrativa;
- pontuação por certificado.

### Fase 3 — Gamificação

- score;
- consistência;
- badges;
- perfil competitivo.

### Fase 4 — Competição

- temporadas;
- ranking;
- histórico;
- ligas;
- promoção/rebaixamento.

## 18. Critérios de aceite principais

### Administração

- [ ] somente admin acessa endpoints administrativos;
- [ ] admin consegue criar usuário;
- [ ] usuário desativado não autentica;
- [ ] reativação permite novo login;
- [ ] recuperação não expõe existência de conta;
- [ ] token expira e não pode ser reutilizado;
- [ ] alteração de papel não permite auto-revogação.

### Certificados

- [ ] usuário consegue registrar certificado;
- [ ] certificado começa não verificado;
- [ ] somente admin verifica;
- [ ] certificado não verificado não gera pontos;
- [ ] certificado verificado gera pontos uma única vez por credencial.

### Competição

- [ ] ranking considera somente período da temporada;
- [ ] score é reproduzível;
- [ ] desempate é determinístico;
- [ ] temporada encerrada não muda com atividades futuras;
- [ ] usuário desativado não aparece como participante ativo.

## 19. Lacunas que precisam de decisão de negócio

1. A competição será obrigatória ou opt-in?
2. O ranking será visível para todos os usuários ou somente posição relativa?
3. O nome completo será exibido no ranking?
4. Certificados deverão ser sempre verificados por administrador?
5. Haverá tipos/níveis de certificação com pesos diferentes?
6. Qual será o período oficial da temporada: semanal, mensal ou outro?
7. Haverá prêmio real ou somente reconhecimento dentro da aplicação?
8. Atividades antigas contarão para a primeira temporada?
9. Usuários recém-criados entrarão imediatamente no ranking?
10. Haverá mecanismo para contestar ou corrigir pontuação?

## 20. Pesquisa externa — padrões utilizados como referência

A proposta foi inspirada por padrões públicos de plataformas de aprendizagem:

- **Duolingo:** XP, streaks e ligas semanais, com agrupamento para tornar competição mais equilibrada.
- **Microsoft Learn:** XP, badges, trophies, certificações e desafios com leaderboard.
- **Google Cloud Skills Boost:** skill badges como evidência compartilhável de competências.

Esses produtos são **referências de design**, não requisitos copiados para o Study Hub.

## 21. Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Ranking favorece quem registra mais horas | Alta | Alto | limites, normalização e foco em tarefas/conquistas |
| Certificados falsos | Média | Alto | validação administrativa/evidência |
| Manipulação de atividades | Média | Alto | auditoria, regras anti-abuso e score reproduzível |
| Competição desmotiva iniciantes | Média | Médio | ligas/fairness em evolução futura |
| Regras de score mudam frequentemente | Alta | Médio | parametrização e histórico por temporada |
| Exposição excessiva de dados pessoais | Média | Alto | ranking com dados mínimos e política de privacidade |

## 22. Próxima etapa técnica

Depois desta fundação, a implementação deve seguir nesta ordem:

1. APIs e serviços de administração;
2. fluxo de recuperação de senha;
3. bloqueio de autenticação para usuários inativos;
4. APIs de certificados e validação;
5. serviço de cálculo do score;
6. ranking da temporada;
7. telas administrativas;
8. telas competitivas;
9. testes unitários/integrados;
10. revisão de segurança e performance;
11. execução da migration em ambiente de homologação;
12. validação dos critérios de aceite antes de produção.
