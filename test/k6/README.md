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

## Demonstracao dos 11 Conceitos Exigidos

Este projeto implementa TODOS os 11 conceitos exigidos no desafio. Abaixo, cada conceito e explicado com o arquivo onde foi implementado e trechos de codigo demonstrando sua aplicacao.

---

### 1. THRESHOLDS

**Arquivo:** `test/k6/config/options.js`

O codigo abaixo esta armazenado no arquivo `config/options.js` e demonstra o uso de **Thresholds**. Thresholds sao limites de performance que definem se o teste passou ou falhou. Aqui definimos que 95% das requisicoes devem responder em menos de 500ms, menos de 1% podem falhar, e 95% dos checks devem passar.

```javascript
export const thresholds = {
    // Tempo de resposta HTTP geral - 95% das requisicoes < 500ms
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    
    // Taxa de requisicoes com sucesso - Menos de 1% de falhas
    'http_req_failed': ['rate<0.01'],
    
    // Thresholds especificos por grupo
    'group_duration{group:::Login}': ['p(95)<600'],
    'group_duration{group:::Register User}': ['p(95)<800'],
    'group_duration{group:::User Profile}': ['p(95)<400'],
    'group_duration{group:::Transfer Operations}': ['p(95)<700'],
    
    // Checks devem ter 95% de sucesso
    'checks': ['rate>0.95'],
    
    // Metricas customizadas (Trends)
    'login_duration': ['p(95)<600'],
    'register_duration': ['p(95)<800'],
    'transfer_duration': ['p(95)<700'],
    'profile_duration': ['p(95)<400'],
    'balance_duration': ['p(95)<400'],
    'list_transfers_duration': ['p(95)<500'],
};
```

---

### 2. CHECKS

**Arquivo:** `test/k6/tests/banking-api.test.js`

O codigo abaixo esta armazenado no arquivo `banking-api.test.js` e demonstra o uso de **Checks**. Checks sao validacoes que verificam se a resposta da API esta correta. Aqui validamos o status HTTP, a presenca de dados do usuario, o numero da conta com 6 digitos e o saldo inicial de 1000.

```javascript
group('Register User', function() {
    const response = http.post(`${BASE_URL}/users/register`, payload, params);
    
    // CHECKS: Validacoes da resposta
    const checkResult = check(response, {
        'register: status is 201': (r) => r.status === 201,
        'register: response has user data': (r) => {
            try {
                const body = r.json();
                return body && body.data && body.data.account;
            } catch (e) {
                return false;
            }
        },
        'register: user has account number': (r) => {
            try {
                const body = r.json();
                return body.data.account && body.data.account.length === 6;
            } catch (e) {
                return false;
            }
        },
        'register: initial balance is 1000': (r) => {
            try {
                const body = r.json();
                return body.data.balance === 1000;
            } catch (e) {
                return false;
            }
        }
    });
});
```

---

### 3. HELPERS

**Arquivo:** `test/k6/helpers/auth.js`

O codigo abaixo esta armazenado no arquivo `helpers/auth.js` e demonstra o uso de **Helpers**. Helpers sao funcoes reutilizaveis que encapsulam logica comum. A funcao `login()` e importada e usada em varios lugares do teste, evitando duplicacao de codigo.

```javascript
/**
 * HELPER: Realiza login e retorna o token JWT
 */
export function login(email, password) {
    const payload = JSON.stringify({
        email: email,
        password: password
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
        tags: { name: 'login' },
    };

    const response = http.post(`${BASE_URL}/auth/login`, payload, params);

    const success = check(response, {
        'login status is 200': (r) => r.status === 200,
        'login response has token': (r) => {
            const body = r.json();
            return body && body.data && body.data.token;
        },
    });

    if (success) {
        const body = response.json();
        return body.data.token;
    }

    return null;
}
```

**Uso no teste principal (`banking-api.test.js`):**

```javascript
import { login, registerUser, getAuthHeaders } from '../helpers/auth.js';

group('Login', function() {
    // HELPER: Usa funcao de login do auth.js
    userToken = login(uniqueUser.email, uniqueUser.password);
});
```

---

### 4. TRENDS

**Arquivo:** `test/k6/tests/banking-api.test.js`

O codigo abaixo esta armazenado no arquivo `banking-api.test.js` e demonstra o uso de **Trends**. Trends sao metricas customizadas que permitem medir duracoes especificas de cada operacao. Alem de Trends, tambem usamos Counters para contar operacoes e Rate para taxa de sucesso.

```javascript
import { Trend, Counter, Rate } from 'k6/metrics';

// TRENDS: Metricas customizadas de duracao por operacao
const loginDuration = new Trend('login_duration', true);
const registerDuration = new Trend('register_duration', true);
const transferDuration = new Trend('transfer_duration', true);
const profileDuration = new Trend('profile_duration', true);
const balanceDuration = new Trend('balance_duration', true);
const listTransfersDuration = new Trend('list_transfers_duration', true);

// COUNTERS: Contadores de operacoes
const successfulLogins = new Counter('successful_logins');
const successfulRegistrations = new Counter('successful_registrations');
const successfulTransfers = new Counter('successful_transfers');
const failedOperations = new Counter('failed_operations');

// RATE: Taxa de sucesso
const successRate = new Rate('success_rate');
```

**Uso das Trends para medir duracao:**

```javascript
group('Login', function() {
    const startTime = Date.now();
    
    userToken = login(uniqueUser.email, uniqueUser.password);
    
    // TREND: Registra duracao do login
    loginDuration.add(Date.now() - startTime);
    
    if (loginSuccess) {
        successfulLogins.add(1);  // COUNTER
    }
    successRate.add(loginSuccess);  // RATE
});
```

---

### 5. FAKER

**Arquivo:** `test/k6/helpers/generators.js`

O codigo abaixo esta armazenado no arquivo `helpers/generators.js` e demonstra o uso de **Faker**. Como K6 nao possui biblioteca faker nativa, implementamos funcoes que geram dados aleatorios simulando o comportamento do Faker.js.

```javascript
/**
 * FAKER: Gera um nome aleatorio realista
 * Simula @faker-js/faker: faker.person.fullName()
 */
export function generateName() {
    const firstNames = [
        'João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Juliana',
        'Lucas', 'Fernanda', 'Rafael', 'Patricia', 'Bruno', 'Camila'
    ];
    
    const lastNames = [
        'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira',
        'Almeida', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro'
    ];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
}

/**
 * FAKER: Gera um email unico aleatorio
 * Simula @faker-js/faker: faker.internet.email()
 */
export function generateEmail(name = null) {
    const domains = ['email.com', 'teste.com', 'gmail.com', 'outlook.com'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const uniqueId = generateUniqueId();
    
    return `user.${uniqueId}@${domain}`;
}

/**
 * FAKER: Gera um objeto completo de usuario
 */
export function generateUser() {
    const name = generateName();
    return {
        name: name,
        email: generateEmail(name),
        password: generatePassword()
    };
}
```

**Uso no teste principal:**

```javascript
import { generateUser, generateAmount } from '../helpers/generators.js';

export default function(data) {
    // FAKER: Gera dados unicos para cada iteracao
    const uniqueUser = generateUser();
    uniqueUser.email = `${uniqueUser.email.split('@')[0]}.vu${vuId}.iter${iteration}@teste.com`;
}
```

---

### 6. VARIAVEIS DE AMBIENTE

**Arquivo:** `test/k6/config/options.js`

O codigo abaixo esta armazenado no arquivo `config/options.js` e demonstra o uso de **Variaveis de Ambiente**. Isso permite configurar o teste externamente sem alterar o codigo, facilitando execucao em diferentes ambientes.

```javascript
// VARIAVEIS DE AMBIENTE
// Uso: K6_BASE_URL=http://api.prod.com k6 run test.js
export const BASE_URL = __ENV.K6_BASE_URL || 'http://localhost:3000';
export const VUS = parseInt(__ENV.K6_VUS) || 10;
export const DURATION = __ENV.K6_DURATION || '2m';

export const options = {
    stages: stages,
    thresholds: thresholds,
    tags: {
        testType: 'performance',
        environment: __ENV.K6_ENV || 'local',  // Ambiente configuravel
    },
};
```

**Exemplo de execucao com variaveis:**

```bash
# Linux/Mac
K6_BASE_URL=http://api.staging.com K6_VUS=50 k6 run test/k6/tests/banking-api.test.js

# Windows PowerShell
$env:K6_BASE_URL="http://localhost:3000"; $env:K6_VUS="20"; k6 run test/k6/tests/banking-api.test.js
```

---

### 7. STAGES

**Arquivo:** `test/k6/config/options.js`

O codigo abaixo esta armazenado no arquivo `config/options.js` e demonstra o uso de **Stages**. Stages definem fases de carga progressiva para simular cenarios realistas com ramp-up, carga sustentada e ramp-down.

```javascript
// STAGES: Fases de carga progressiva
export const stages = [
    // Fase 1: Ramp-up - Aumento gradual de usuarios (0 -> 10 em 30s)
    { duration: '30s', target: VUS },
    
    // Fase 2: Carga Sustentada - Mantem usuarios no pico (10 por 1 minuto)
    { duration: '1m', target: VUS },
    
    // Fase 3: Pico de Stress - Testa limite do sistema (dobra para 20)
    { duration: '30s', target: VUS * 2 },
    
    // Fase 4: Ramp-down - Reducao gradual (20 -> 0)
    { duration: '30s', target: 0 },
];

export const options = {
    stages: stages,  // Aplica os stages definidos
    thresholds: thresholds,
};
```

**Visualizacao das fases:**

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

---

### 8. REAPROVEITAMENTO DE RESPOSTA

**Arquivo:** `test/k6/tests/banking-api.test.js`

O codigo abaixo esta armazenado no arquivo `banking-api.test.js` e demonstra o **Reaproveitamento de Resposta**. O token JWT e a conta (account) obtidos em uma requisicao sao salvos em variaveis e reutilizados nas requisicoes seguintes.

```javascript
export default function(data) {
    // Variaveis para REAPROVEITAMENTO DE RESPOSTA
    let userToken = null;
    let userAccount = null;

    group('Register User', function() {
        const response = http.post(`${BASE_URL}/users/register`, payload, params);
        
        if (checkResult) {
            const body = response.json();
            // REAPROVEITAMENTO: Guarda account para uso posterior
            userAccount = body.data.account;
        }
    });

    group('Login', function() {
        // REAPROVEITAMENTO: Token sera usado nas proximas requisicoes
        userToken = login(uniqueUser.email, uniqueUser.password);
    });

    group('User Profile', function() {
        // REAPROVEITAMENTO: Usa o token obtido no login
        const params = {
            headers: getAuthHeaders(userToken),
        };
        const response = http.get(`${BASE_URL}/users/profile`, params);
    });

    group('Transfer Operations', function() {
        // REAPROVEITAMENTO: Usa account do setup como destino
        const transferData = {
            toAccount: data.receiverAccount,  // Account do usuario receptor criado no setup
            amount: testUserData.transferAmount,
        };
        const response = authenticatedPost('/transfers', transferData, userToken);
    });
}
```

---

### 9. USO DE TOKEN DE AUTENTICACAO

**Arquivo:** `test/k6/helpers/auth.js`

O codigo abaixo esta armazenado no arquivo `helpers/auth.js` e demonstra o **Uso de Token de Autenticacao**. O token JWT e extraido do login e usado no header Authorization como Bearer token para endpoints protegidos.

```javascript
/**
 * HELPER: Cria headers de autenticacao com Bearer token
 */
export function getAuthHeaders(token) {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,  // Token JWT no header
    };
}
```

**Uso no teste principal (`banking-api.test.js`):**

```javascript
group('User Profile', function() {
    // USO DE TOKEN: Headers com Authorization Bearer
    const params = {
        headers: getAuthHeaders(userToken),  // Token obtido no login
        tags: { name: 'profile' }
    };
    
    const response = http.get(`${BASE_URL}/users/profile`, params);
});
```

**Helper HTTP autenticado (`helpers/http.js`):**

```javascript
export function authenticatedGet(endpoint, token, tags = {}) {
    const params = {
        headers: getAuthHeaders(token),  // Usa token para autenticacao
        tags: tags,
    };
    return http.get(`${BASE_URL}${endpoint}`, params);
}

export function authenticatedPost(endpoint, data, token, tags = {}) {
    const params = {
        headers: getAuthHeaders(token),  // Usa token para autenticacao
        tags: tags,
    };
    return http.post(`${BASE_URL}${endpoint}`, JSON.stringify(data), params);
}
```

---

### 10. DATA-DRIVEN TESTING

**Arquivo:** `test/k6/data/users.json` e `test/k6/tests/banking-api.test.js`

O codigo abaixo demonstra o **Data-Driven Testing**. Os dados de teste sao carregados de um arquivo JSON externo (`users.json`) usando SharedArray, que e eficiente pois compartilha dados entre VUs sem duplicar memoria.

**Arquivo de dados (`data/users.json`):**

```json
[
    {
        "scenario": "user_normal",
        "name": "Carlos Oliveira",
        "email": "carlos.oliveira.k6test@email.com",
        "password": "senha123",
        "expectedBalance": 1000.00,
        "transferAmount": 100.00,
        "description": "Usuário padrão com transferência pequena"
    },
    {
        "scenario": "user_high_transfer",
        "name": "Ana Silva",
        "email": "ana.silva.k6test@email.com",
        "password": "senha456",
        "expectedBalance": 1000.00,
        "transferAmount": 500.00,
        "description": "Usuário com transferência de valor médio"
    },
    {
        "scenario": "user_limit_transfer",
        "name": "Roberto Santos",
        "email": "roberto.santos.k6test@email.com",
        "password": "senha789",
        "expectedBalance": 1000.00,
        "transferAmount": 4999.00,
        "description": "Usuário próximo ao limite de transferência"
    }
]
```

**Uso no teste (`banking-api.test.js`):**

```javascript
import { SharedArray } from 'k6/data';

// DATA-DRIVEN: Carrega dados do arquivo JSON
const testUsers = new SharedArray('users', function() {
    return JSON.parse(open('../data/users.json'));
});

export default function(data) {
    // DATA-DRIVEN: Seleciona usuario baseado no VU
    const vuId = __VU;
    const testUserData = testUsers[vuId % testUsers.length];
    
    group('Transfer Operations', function() {
        // DATA-DRIVEN: Usa valor do usuario de teste carregado do JSON
        const transferData = {
            toAccount: data.receiverAccount,
            amount: testUserData.transferAmount,  // Valor do JSON
            description: `Transfer - ${testUserData.scenario}`  // Cenario do JSON
        };
    });
}
```

---

### 11. GROUPS

**Arquivo:** `test/k6/tests/banking-api.test.js`

O codigo abaixo esta armazenado no arquivo `banking-api.test.js` e demonstra o uso de **Groups**. Groups agrupam operacoes relacionadas logicamente, permitindo metricas separadas por grupo e melhor organizacao do teste.

```javascript
import { group } from 'k6';
import { login } from '../helpers/auth.js';

export default function(data) {
    // GROUP 1: Registro de usuario
    group('Register User', function() {
        const response = http.post(`${BASE_URL}/users/register`, payload, params);
        check(response, { 'register: status is 201': (r) => r.status === 201 });
    });

    // GROUP 2: Login - Demonstra uso de Helper dentro do Group
    group('Login', function() {
        userToken = login(uniqueUser.email, uniqueUser.password);  // HELPER
        check(null, { 'login: token received': () => userToken !== null });
    });

    // GROUP 3: Consulta de perfil
    group('User Profile', function() {
        const response = authenticatedGet('/users/profile', userToken);
        check(response, { 'profile: status is 200': (r) => r.status === 200 });
    });

    // GROUP 4: Consulta de saldo
    group('Check Balance', function() {
        const response = authenticatedGet('/users/balance', userToken);
        check(response, { 'balance: status is 200': (r) => r.status === 200 });
    });

    // GROUP 5: Transferencia bancaria
    group('Transfer Operations', function() {
        const response = authenticatedPost('/transfers', transferData, userToken);
        check(response, { 'transfer: status is 201 or 400': (r) => r.status === 201 || r.status === 400 });
    });

    // GROUP 6: Listagem de transferencias
    group('List Transfers', function() {
        const response = authenticatedGet('/transfers', userToken);
        check(response, { 'list transfers: status is 200': (r) => r.status === 200 });
    });
}
```

---

## Resumo dos Conceitos

| # | Conceito | Arquivo | Linha de Exemplo |
|---|----------|---------|------------------|
| 1 | **Thresholds** | `config/options.js` | `'http_req_duration': ['p(95)<500']` |
| 2 | **Checks** | `banking-api.test.js` | `check(response, { 'status is 201': ... })` |
| 3 | **Helpers** | `helpers/auth.js` | `export function login(email, password)` |
| 4 | **Trends** | `banking-api.test.js` | `const loginDuration = new Trend('login_duration')` |
| 5 | **Faker** | `helpers/generators.js` | `export function generateUser()` |
| 6 | **Variaveis de Ambiente** | `config/options.js` | `export const BASE_URL = __ENV.K6_BASE_URL` |
| 7 | **Stages** | `config/options.js` | `{ duration: '30s', target: VUS }` |
| 8 | **Reaproveitamento** | `banking-api.test.js` | `userAccount = body.data.account` |
| 9 | **Token de Autenticacao** | `helpers/auth.js` | `'Authorization': Bearer ${token}` |
| 10 | **Data-Driven Testing** | `data/users.json` | `const testUsers = new SharedArray(...)` |
| 11 | **Groups** | `banking-api.test.js` | `group('Login', function() { ... })` |

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
