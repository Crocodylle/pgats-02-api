# Testes de Performance K6 - Banking API

Este projeto implementa testes de performance automatizados utilizando K6 para a API bancaria REST do projeto PGATS-02.

## Estrutura do Projeto

```
test/k6/
  config/
    options.js           - Configuracoes: Thresholds, Stages, Env Vars
  data/
    users.json           - Dados para Data-Driven Testing
  helpers/
    auth.js              - Helper de autenticacao (login, token)
    generators.js        - Faker - Geracao de dados dinamicos
    http.js              - Helper para requisicoes HTTP
  tests/
    banking-api.test.js  - Teste principal
  README.md              - Esta documentacao
```

## Como Executar

### Pre-requisitos

1. K6 instalado - https://k6.io/docs/get-started/installation/
2. API rodando - Execute `npm start` no diretorio raiz do projeto

### Comandos

```bash
# Execucao basica
k6 run test/k6/tests/banking-api.test.js

# Com variaveis de ambiente
K6_BASE_URL=http://localhost:3000 K6_VUS=20 k6 run test/k6/tests/banking-api.test.js
```

---

## Conceitos Aplicados

### 1. Thresholds

Arquivo: `test/k6/config/options.js`

Thresholds sao limites de performance que definem se o teste passou ou falhou.

```javascript
export const thresholds = {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['rate<0.01'],
    'group_duration{group:::Login}': ['p(95)<600'],
    'checks': ['rate>0.95'],
    'login_duration': ['p(95)<600'],
};
```

---

### 2. Checks

Arquivo: `test/k6/tests/banking-api.test.js`

Checks sao validacoes que verificam se a resposta da API esta correta.

```javascript
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
});
```

---

### 3. Helpers

Arquivo: `test/k6/helpers/auth.js`

Helpers sao funcoes reutilizaveis que encapsulam logica comum.

```javascript
export function login(email, password) {
    const payload = JSON.stringify({ email, password });
    const params = {
        headers: { 'Content-Type': 'application/json' },
        tags: { name: 'login' },
    };
    const response = http.post(`${BASE_URL}/auth/login`, payload, params);
    if (response.status === 200) {
        return response.json().data.token;
    }
    return null;
}
```

Uso no teste:

```javascript
group('Login', function() {
    userToken = login(uniqueUser.email, uniqueUser.password);
});
```

---

### 4. Trends

Arquivo: `test/k6/tests/banking-api.test.js`

Trends sao metricas customizadas para rastrear valores especificos.

```javascript
import { Trend, Counter, Rate } from 'k6/metrics';

const loginDuration = new Trend('login_duration', true);
const registerDuration = new Trend('register_duration', true);
const successfulLogins = new Counter('successful_logins');
const successRate = new Rate('success_rate');
```

Uso:

```javascript
const startTime = Date.now();
// executa requisicao
registerDuration.add(Date.now() - startTime);
```

---

### 5. Faker

Arquivo: `test/k6/helpers/generators.js`

Geracao de dados dinamicos simulando biblioteca Faker.

```javascript
export function generateName() {
    const firstNames = ['Joao', 'Maria', 'Pedro', 'Ana', 'Carlos'];
    const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza'];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${firstName} ${lastName}`;
}

export function generateUser() {
    const name = generateName();
    return {
        name: name,
        email: generateEmail(name),
        password: generatePassword()
    };
}
```

---

### 6. Variavel de Ambiente

Arquivo: `test/k6/config/options.js`

Variaveis de ambiente permitem configurar o teste externamente.

```javascript
export const BASE_URL = __ENV.K6_BASE_URL || 'http://localhost:3000';
export const VUS = parseInt(__ENV.K6_VUS) || 10;
export const DURATION = __ENV.K6_DURATION || '2m';
```

Uso na linha de comando:

```bash
K6_BASE_URL=http://api.staging.com K6_VUS=50 k6 run test.js
```

---

### 7. Stages

Arquivo: `test/k6/config/options.js`

Stages definem fases de carga progressiva.

```javascript
export const stages = [
    { duration: '30s', target: VUS },      // Ramp-up
    { duration: '1m', target: VUS },       // Carga Sustentada
    { duration: '30s', target: VUS * 2 },  // Pico de Stress
    { duration: '30s', target: 0 },        // Ramp-down
];
```

---

### 8. Reaproveitamento de Resposta

Arquivo: `test/k6/tests/banking-api.test.js`

Dados obtidos em uma resposta sao reutilizados em requisicoes subsequentes.

Setup cria usuario receptor:

```javascript
export function setup() {
    const receiverResult = registerUser(receiverData);
    return {
        apiAvailable: true,
        receiverAccount: receiverResult.user.account,
    };
}
```

Uso no teste:

```javascript
group('Transfer Operations', function() {
    const transferData = {
        toAccount: data.receiverAccount,  // Account do setup
        amount: testUserData.transferAmount,
    };
    authenticatedPost('/transfers', transferData, userToken);
});
```

---

### 9. Uso de Token de Autenticacao

Arquivos: `test/k6/helpers/auth.js` e `test/k6/tests/banking-api.test.js`

Gerenciamento de JWT para autenticacao.

```javascript
export function getAuthHeaders(token) {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
}
```

Uso:

```javascript
group('User Profile', function() {
    const params = {
        headers: getAuthHeaders(userToken),
        tags: { name: 'profile' }
    };
    const response = http.get(`${BASE_URL}/users/profile`, params);
});
```

---

### 10. Data-Driven Testing

Arquivos: `test/k6/data/users.json` e `test/k6/tests/banking-api.test.js`

Dados carregados de arquivo JSON externo.

Arquivo users.json:

```json
[
    {
        "scenario": "user_normal",
        "name": "Carlos Oliveira",
        "transferAmount": 100.00
    },
    {
        "scenario": "user_limit_transfer",
        "name": "Roberto Santos",
        "transferAmount": 4999.00
    }
]
```

Carregamento:

```javascript
import { SharedArray } from 'k6/data';

const testUsers = new SharedArray('users', function() {
    return JSON.parse(open('../data/users.json'));
});
```

Uso:

```javascript
export default function(data) {
    const testUserData = testUsers[__VU % testUsers.length];
    const transferData = {
        amount: testUserData.transferAmount,
    };
}
```

---

### 11. Groups

Arquivo: `test/k6/tests/banking-api.test.js`

Groups agrupam operacoes relacionadas.

```javascript
import { group } from 'k6';

export default function(data) {
    group('Register User', function() {
        // codigo de registro
    });

    group('Login', function() {
        userToken = login(uniqueUser.email, uniqueUser.password);
    });

    group('User Profile', function() {
        // codigo de perfil
    });

    group('Transfer Operations', function() {
        // codigo de transferencia
    });
}
```

---

## Gerando Relatorio HTML

O teste ja possui handleSummary configurado. Ao executar, sera gerado automaticamente:

- test/k6/report.html - Relatorio principal
- test/k6/reports/report-timestamp.html - Relatorio com historico

Ou execute o script:

```bash
node test/k6/generate-report.js
```

---

## Metricas Importantes

| Metrica | Descricao | Threshold |
|---------|-----------|-----------|
| http_req_duration | Tempo total da requisicao | p95 menor que 500ms |
| http_req_failed | Taxa de falhas | menor que 1% |
| checks | Taxa de checks passando | maior que 95% |
| login_duration | Tempo de login | p95 menor que 600ms |

---

## Troubleshooting

### API nao disponivel

```bash
curl http://localhost:3000/health
```

### Muitas falhas de checks

Execute com menos VUs para debug:

```bash
k6 run --vus 1 --iterations 1 test/k6/tests/banking-api.test.js
```

---

Projeto desenvolvido para o curso PGATS-02 - Testes de Performance com K6.

