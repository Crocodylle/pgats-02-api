# Testes de Performance K6 - Banking API

Suite completa de testes de performance automatizados utilizando **K6** para a API bancaria REST do projeto PGATS-02. Este projeto demonstra todos os 11 conceitos exigidos para testes de performance.

## Sobre o Projeto

### API Testada
A Banking API e uma API REST que simula um sistema bancario com:
- **Autenticacao JWT** - Login e gerenciamento de tokens
- **Cadastro de usuarios** - Registro com saldo inicial de R$1.000,00
- **Transferencias** - Entre contas com limite de R$5.000,00 para nao-favoritos
- **Favoritos** - Sistema de contas favoritas com transferencias ilimitadas

### Objetivo dos Testes
- Validar performance dos endpoints sob carga
- Medir tempos de resposta (p95, p99)
- Verificar taxa de sucesso das operacoes
- Simular usuarios simultaneos realizando operacoes bancarias
- Gerar relatorios HTML automaticos

---

## Estrutura do Projeto

```
test/k6/
  config/
    options.js           - Configuracoes K6: Thresholds, Stages, Env Vars
  data/
    users.json           - 10 cenarios para Data-Driven Testing
  helpers/
    auth.js              - Helper de autenticacao (login, registro, token)
    generators.js        - Faker - Geracao de dados dinamicos
    http.js              - Helper para requisicoes HTTP autenticadas
  tests/
    banking-api.test.js  - Teste principal com 6 groups
  reports/
    .gitkeep             - Pasta para relatorios HTML com timestamp
  report.html            - Relatorio HTML gerado automaticamente
  generate-report.js     - Script Node.js para gerar relatorios
  README.md              - Esta documentacao
```

---

## Testes Implementados

### Fluxo de Teste Completo

O teste simula o fluxo completo de um usuario bancario:

```
1. Register User    -> Cria novo usuario com dados Faker
2. Login            -> Autentica e obtem token JWT
3. User Profile     -> Consulta perfil do usuario
4. Check Balance    -> Verifica saldo da conta
5. Transfer         -> Realiza transferencia para outro usuario
6. List Transfers   -> Lista historico de transferencias
```

### Endpoints Testados

| Endpoint | Metodo | Autenticado | Descricao |
|----------|--------|-------------|-----------|
| `/users/register` | POST | Nao | Registro de novo usuario |
| `/auth/login` | POST | Nao | Autenticacao e obtencao de token |
| `/users/profile` | GET | Sim | Perfil do usuario logado |
| `/users/balance` | GET | Sim | Saldo da conta |
| `/transfers` | POST | Sim | Realizar transferencia |
| `/transfers` | GET | Sim | Listar transferencias |
| `/health` | GET | Nao | Health check da API |

### Groups Implementados

| Group | Descricao | Checks |
|-------|-----------|--------|
| **Register User** | Cria usuario com dados Faker | Status 201, dados do usuario, conta 6 digitos, saldo inicial |
| **Login** | Autentica e obtem token | Token recebido, token e string, token tem conteudo |
| **User Profile** | Consulta perfil | Status 200, nome correto, email correto, conta correta |
| **Check Balance** | Verifica saldo | Status 200, campo balance existe, saldo nao negativo |
| **Transfer Operations** | Transferencia entre contas | Status 201 ou 400, body existe, sucesso ou erro esperado |
| **List Transfers** | Historico de transferencias | Status 200, retorna array |

---

## Cenarios de Data-Driven Testing

O arquivo `data/users.json` contem 10 cenarios de teste:

| Cenario | Valor Transferencia | Descricao |
|---------|---------------------|-----------|
| `user_normal` | R$100,00 | Usuario padrao com transferencia pequena |
| `user_high_transfer` | R$500,00 | Transferencia de valor medio |
| `user_limit_transfer` | R$4.999,00 | Proximo ao limite de transferencia |
| `user_minimum` | R$0,01 | Transferencia minima |
| `user_multiple_transfers` | R$50,00 | Multiplas transferencias |
| `user_receiver` | R$0,00 | Usuario destinatario |
| `user_favorite_test` | R$6.000,00 | Teste de favoritos (valor alto) |
| `user_concurrent` | R$200,00 | Testes de concorrencia |
| `user_stress` | R$150,00 | Testes de stress |
| `user_boundary` | R$5.000,00 | Limite exato (boundary test) |

---

## Metricas Customizadas (Trends)

### Trends de Duracao
| Metrica | Descricao | Threshold |
|---------|-----------|-----------|
| `login_duration` | Tempo de login | p95 < 600ms |
| `register_duration` | Tempo de registro | p95 < 800ms |
| `transfer_duration` | Tempo de transferencia | p95 < 700ms |
| `profile_duration` | Tempo consulta perfil | p95 < 400ms |
| `balance_duration` | Tempo consulta saldo | p95 < 400ms |
| `list_transfers_duration` | Tempo listagem | p95 < 500ms |

### Contadores
| Metrica | Descricao |
|---------|-----------|
| `successful_logins` | Total de logins bem sucedidos |
| `successful_registrations` | Total de registros bem sucedidos |
| `successful_transfers` | Total de transferencias bem sucedidas |
| `failed_operations` | Total de operacoes com falha |

### Rates
| Metrica | Descricao | Threshold |
|---------|-----------|-----------|
| `success_rate` | Taxa de sucesso geral | > 95% |

---

## Configuracao de Carga (Stages)

O teste utiliza 4 fases de carga:

```
VUs
 ^
20 |          ________
   |         /        \
10 |--------/          \--------
   |       /            \
 0 +--------------------------------> tempo
   0     30s    1m30s    2m    2m30s
```

| Fase | Duracao | VUs | Descricao |
|------|---------|-----|-----------|
| Ramp-up | 30s | 0 -> 10 | Aumento gradual de usuarios |
| Sustain | 1m | 10 | Carga constante |
| Stress | 30s | 20 | Dobro da carga (stress test) |
| Ramp-down | 30s | 20 -> 0 | Reducao gradual |

**Duracao Total:** 2 minutos e 30 segundos

---

## Como Executar

### Pre-requisitos

1. **K6 instalado**
   ```bash
   # Windows (Chocolatey)
   choco install k6
   
   # Windows (WinGet)
   winget install k6 --source winget
   
   # macOS
   brew install k6
   
   # Linux
   sudo apt-get install k6
   ```

2. **API rodando**
   ```bash
   npm start
   ```

### Comandos de Execucao

```bash
# Execucao basica (a partir da raiz do projeto)
k6 run test/k6/tests/banking-api.test.js

# Com variaveis de ambiente customizadas
K6_BASE_URL=http://localhost:3000 K6_VUS=20 k6 run test/k6/tests/banking-api.test.js

# Execucao rapida para debug (1 VU, 1 iteracao)
k6 run --vus 1 --iterations 1 test/k6/tests/banking-api.test.js

# Com output detalhado
k6 run test/k6/tests/banking-api.test.js --http-debug

# Salvando resultado JSON
k6 run test/k6/tests/banking-api.test.js --out json=results.json
```

### Scripts npm Disponiveis

```bash
npm run test-k6                  # Executa testes K6
npm run test-k6:report           # Executa com output JSON
npm run test-k6:generate-report  # Gera relatorio HTML
```

---

## Variaveis de Ambiente

| Variavel | Padrao | Descricao |
|----------|--------|-----------|
| `K6_BASE_URL` | `http://localhost:3000` | URL base da API |
| `K6_VUS` | `10` | Numero de usuarios virtuais |
| `K6_DURATION` | `2m` | Duracao do teste |
| `K6_ENV` | `local` | Ambiente (local, staging, prod) |

### Exemplos de Uso

```bash
# Ambiente de staging com 50 usuarios
K6_BASE_URL=http://api.staging.com K6_VUS=50 k6 run test/k6/tests/banking-api.test.js

# Windows PowerShell
$env:K6_BASE_URL="http://localhost:3000"; $env:K6_VUS="20"; k6 run test/k6/tests/banking-api.test.js
```

---

## Conceitos Aplicados

Este projeto demonstra todos os 11 conceitos exigidos:

| # | Conceito | Arquivo | Implementacao |
|---|----------|---------|---------------|
| 1 | **Thresholds** | `config/options.js` | Limites p95<500ms, rate<1%, checks>95% |
| 2 | **Checks** | `banking-api.test.js` | 20+ validacoes nos 6 groups |
| 3 | **Helpers** | `helpers/*.js` | login(), getAuthHeaders(), generateUser() |
| 4 | **Trends** | `banking-api.test.js` | 6 Trends + 4 Counters + 1 Rate |
| 5 | **Faker** | `helpers/generators.js` | Nomes, emails, senhas, valores |
| 6 | **Variaveis de Ambiente** | `config/options.js` | K6_BASE_URL, K6_VUS, K6_DURATION |
| 7 | **Stages** | `config/options.js` | 4 fases: ramp-up, sustain, stress, ramp-down |
| 8 | **Reaproveitamento** | `banking-api.test.js` | Token e Account entre requests |
| 9 | **Token de Autenticacao** | `helpers/auth.js` | JWT Bearer em headers |
| 10 | **Data-Driven Testing** | `data/users.json` | SharedArray com 10 cenarios |
| 11 | **Groups** | `banking-api.test.js` | 6 groups logicos |

---

## Thresholds Configurados

```javascript
export const thresholds = {
    // HTTP geral
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['rate<0.01'],
    
    // Por grupo
    'group_duration{group:::Login}': ['p(95)<600'],
    'group_duration{group:::Register User}': ['p(95)<800'],
    'group_duration{group:::User Profile}': ['p(95)<400'],
    'group_duration{group:::Transfer Operations}': ['p(95)<700'],
    
    // Checks e metricas customizadas
    'checks': ['rate>0.95'],
    'login_duration': ['p(95)<600'],
    'register_duration': ['p(95)<800'],
    'transfer_duration': ['p(95)<700'],
    'profile_duration': ['p(95)<400'],
};
```

---

## Relatorios HTML

### Geracao Automatica

O teste gera automaticamente ao final:
- `test/k6/report.html` - Relatorio principal
- `test/k6/reports/report-{timestamp}.html` - Historico
- `test/k6/summary.json` - Dados em JSON

### Geracao Manual

```bash
node test/k6/generate-report.js
```

### Conteudo do Relatorio

O relatorio HTML inclui:
- Resumo dos thresholds (passou/falhou)
- Graficos de tempo de resposta
- Estatisticas por grupo
- Metricas customizadas (Trends)
- Taxa de checks passando
- Detalhes de erros

---

## Exemplos de Codigo

### 1. Thresholds (config/options.js)

```javascript
export const thresholds = {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['rate<0.01'],
    'checks': ['rate>0.95'],
};
```

### 2. Checks (banking-api.test.js)

```javascript
const checkResult = check(response, {
    'register: status is 201': (r) => r.status === 201,
    'register: user has account': (r) => {
        const body = r.json();
        return body && body.data && body.data.account;
    },
    'register: initial balance is 1000': (r) => {
        return r.json().data.balance === 1000;
    }
});
```

### 3. Helper de Login (helpers/auth.js)

```javascript
export function login(email, password) {
    const response = http.post(`${BASE_URL}/auth/login`, 
        JSON.stringify({ email, password }),
        { headers: { 'Content-Type': 'application/json' } }
    );
    
    if (response.status === 200) {
        return response.json().data.token;
    }
    return null;
}
```

### 4. Groups (banking-api.test.js)

```javascript
group('Login', function() {
    userToken = login(uniqueUser.email, uniqueUser.password);
    
    check(null, {
        'login: token received': () => userToken !== null,
    });
});
```

### 5. Data-Driven Testing

```javascript
import { SharedArray } from 'k6/data';

const testUsers = new SharedArray('users', function() {
    return JSON.parse(open('../data/users.json'));
});

export default function(data) {
    const testUserData = testUsers[__VU % testUsers.length];
    // Usa testUserData.transferAmount, testUserData.scenario, etc.
}
```

---

## Troubleshooting

### API nao disponivel

```bash
# Verifique se a API esta rodando
curl http://localhost:3000/health

# Inicie a API
npm start
```

### K6 nao encontrado

```bash
# Verifique instalacao
k6 version

# Instale via Chocolatey (Windows)
choco install k6
```

### Muitas falhas de checks

```bash
# Execute com 1 VU para debug
k6 run --vus 1 --iterations 1 test/k6/tests/banking-api.test.js
```

### Thresholds falhando

- Aumente os limites em `config/options.js`
- Reduza numero de VUs
- Verifique se a API esta com boa performance

---

## Arquitetura do Teste

```
                    +------------------+
                    |     SETUP        |
                    | Cria usuario     |
                    | receptor         |
                    +--------+---------+
                             |
                             v
+------------------------------------------------------------------+
|                    VIRTUAL USERS (VUs)                            |
|                                                                   |
|  +------------+  +--------+  +---------+  +---------+  +--------+ |
|  | Register   |->| Login  |->| Profile |->| Balance |->|Transfer| |
|  | User       |  |        |  |         |  |         |  |        | |
|  +------------+  +--------+  +---------+  +---------+  +--------+ |
|       |              |           |            |            |      |
|       v              v           v            v            v      |
|  [Checks]       [Checks]   [Checks]     [Checks]     [Checks]    |
|  [Trend]        [Trend]    [Trend]      [Trend]      [Trend]     |
|                                                                   |
+------------------------------------------------------------------+
                             |
                             v
                    +------------------+
                    |    TEARDOWN      |
                    | Finaliza teste   |
                    +------------------+
                             |
                             v
                    +------------------+
                    | HANDLE SUMMARY   |
                    | Gera relatorios  |
                    | HTML e JSON      |
                    +------------------+
```

---

## Links Uteis

- [Documentacao K6](https://k6.io/docs/)
- [K6 Checks](https://k6.io/docs/using-k6/checks/)
- [K6 Thresholds](https://k6.io/docs/using-k6/thresholds/)
- [K6 Metrics](https://k6.io/docs/using-k6/metrics/)
- [K6 Reporter](https://github.com/benc-uk/k6-reporter)

---

## Autor

Projeto desenvolvido para o curso **PGATS-02** - Testes de Performance com K6.

**Conceitos demonstrados:** Thresholds, Checks, Helpers, Trends, Faker, Variaveis de Ambiente, Stages, Reaproveitamento de Resposta, Token de Autenticacao, Data-Driven Testing, Groups.
