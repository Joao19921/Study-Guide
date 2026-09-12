# Implementação — Administração, Certificados e Competição

## Status

**Branch:** `feature/admin-competition`

Esta documentação registra o que foi efetivamente implementado na evolução, separando implementação de recomendação de produto.

## Confirmado no código

### Administração

- `users.active` controla ativação/desativação.
- Administrador não pode desativar a própria conta.
- Administrador não pode remover a própria role `admin`.
- Cadastro de usuários passou a ser administrativo.
- `POST /api/admin/users` cria usuário e gera token de definição de senha.
- `PATCH /api/admin/users/:id` altera nome, e-mail, role e estado ativo.
- `POST /api/admin/users/:id/reset-password` gera token de recuperação.
- `POST /api/password-reset` consome token de uso único e define a senha.
- Usuário inativo não autentica por credenciais.
- Auditoria administrativa registra criação, atualização, alteração de role, reset de senha e decisões sobre certificados.

### Segurança de senha

- Token de recuperação possui 32 bytes aleatórios.
- Apenas o SHA-256 do token é persistido.
- Expiração: 30 minutos.
- Token só pode ser consumido uma vez.
- Senha continua utilizando o mecanismo de hash existente baseado em `scrypt`.
- O token não é gravado nos logs de auditoria.

### Certificados

Fluxo implementado:

```text
Usuário envia certificado
        |
        v
Pendente
        |
   +----+----+
   |         |
 validar    rejeitar
   |         |
   v         v
Pontua     Não pontua
```

Endpoints:

```text
GET  /api/certificates
POST /api/certificates
GET  /api/admin/certificates
POST /api/admin/certificates/:id/verify
POST /api/admin/certificates/:id/reject
```

Somente certificados `verified=true` entram no cálculo competitivo.

### Competição

Endpoints implementados:

```text
GET  /api/competition/current
GET  /api/competition/seasons
GET  /api/competition/seasons/:id/ranking
GET  /api/competition/me
POST /api/admin/competition/seasons
POST /api/admin/competition/seasons/:id/close
```

A temporada possui:

- `scheduled`
- `active`
- `closed`

Temporadas programadas são ativadas quando a consulta identifica que sua janela começou.

## Modelo de pontuação implementado

A composição adotada para o MVP é uma implementação da recomendação anterior, não uma regra de negócio definitiva:

| Componente | Peso |
|---|---:|
| Desempenho | 50% |
| Certificados verificados | 30% |
| Consistência | 20% |

### Desempenho

Baseado em:

- minutos de estudo dentro da temporada;
- tarefas concluídas dentro da temporada.

A contribuição de tarefas é `30` unidades por tarefa concluída e os minutos são somados diretamente.

### Consistência

Baseada em quantidade de dias distintos com sessões de estudo durante a temporada.

Isso evita premiar artificialmente dezenas de sessões no mesmo dia.

### Certificados

A dimensão de certificados utiliza a soma dos pontos dos certificados verificados.

O padrão inicial de um certificado novo é 100 pontos, podendo o administrador ajustar os pontos no momento da validação.

### Normalização

Cada componente é normalizado em relação ao maior valor observado entre os participantes da temporada.

O resultado final fica em uma escala de aproximadamente `0–1000` pontos:

```text
score = performance + consistência + certificados
```

Os campos persistidos no resultado histórico são:

- score;
- position;
- certificates;
- performance_points;
- certificate_points.

`performance_points` incorpora a parcela de desempenho e consistência no snapshot atual.

## Ranking

Ordenação:

1. score descrescente;
2. performance points decrescente;
3. certificate points decrescente;
4. UUID do usuário como desempate técnico determinístico.

O último critério é somente técnico. Ele não representa uma regra de negócio de preferência entre usuários.

## Fechamento de temporada

Ao fechar uma temporada:

1. o ranking é calculado;
2. os resultados são persistidos;
3. a temporada muda para `closed`;
4. consultas posteriores utilizam os resultados persistidos, sem recalcular usando atividades futuras.

## Interface implementada

### `/admin`

Inclui:

- criação de usuário;
- geração de link de definição de senha;
- listagem de usuários;
- ativação/desativação;
- alternância de role;
- certificados pendentes;
- validação/rejeição de certificados.

### `/competicao`

Inclui:

- temporada atual;
- pesos da pontuação;
- ranking;
- score;
- posição;
- certificados;
- componentes de pontuação.

### `/redefinir-senha`

Permite consumir o token de recuperação e definir uma nova senha.

## Netlify

O projeto utiliza Next.js 16.

A configuração anterior declarava explicitamente `@netlify/plugin-nextjs` em `netlify.toml`, apesar de o Netlify atualmente recomendar o adapter OpenNext integrado para Next.js moderno.

A configuração foi simplificada para:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
```

A alteração é baseada na documentação atual do Netlify e deve ser validada por um novo deploy.

## Limitações conhecidas

### 1. E-mail de recuperação

Ainda não existe integração de e-mail no projeto. Por isso, o MVP retorna ao administrador o token/link de definição de senha.

Isso é aceitável para validação inicial, mas **não é a solução recomendada para produção**.

Recomendação futura: integração transacional de e-mail com expiração, rate limit e template de recuperação.

### 2. Rate limiting

O fluxo de autenticação e recuperação ainda precisa de rate limiting distribuído antes de produção.

### 3. Histórico de tarefas antigas

A coluna `completed_at` foi introduzida na evolução. Tarefas concluídas antes da migração não possuem necessariamente o momento histórico de conclusão e não devem ser tratadas como evidência precisa para temporadas retroativas.

### 4. Temporada única

A solução atual não impõe por banco uma única temporada ativa. A camada de serviço seleciona uma temporada corrente, mas uma regra de unicidade/controle transacional poderá ser adicionada se o produto exigir garantia forte.

### 5. Ligas

Bronze/Prata/Ouro/Diamante ainda não estão implementadas. A primeira versão usa apenas temporadas e ranking, conforme a recomendação de MVP.

## Riscos antes de produção

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Abuso de reset de senha | Média | Alto | Rate limit + e-mail transacional |
| Certificado falso | Média | Alto | Validação administrativa + evidência externa |
| Manipulação de score | Baixa/Média | Alto | Dados de domínio + snapshots + auditoria |
| Empate artificial | Média | Médio | Critério determinístico + futura regra de produto |
| Ranking com poucos participantes | Média | Médio | Validar comportamento antes de criar ligas |
| Dependência de configuração externa do Netlify | Média | Médio | Novo deploy e revisão dos logs |

## Critérios para aprovação do PR

1. CI verde.
2. Type check verde.
3. Testes unitários verdes.
4. Build verde.
5. Deploy Preview Netlify verde.
6. Migration aplicável em banco de homologação.
7. Fluxo admin → criação → reset de senha validado.
8. Fluxo certificado → validação → pontuação validado.
9. Fluxo temporada → ranking → fechamento validado.

Até todos esses critérios serem atendidos, o PR deve permanecer em revisão.
