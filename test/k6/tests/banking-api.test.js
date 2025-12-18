/**
 * K6 Performance Test - Banking API
 * 
 * Este arquivo demonstra TODOS os conceitos exigidos no desafio:
 * 1. Thresholds - Definidos em config/options.js
 * 2. Checks - Validações de resposta em cada requisição
 * 3. Helpers - Funções importadas de helpers/
 * 4. Trends - Métricas customizadas por endpoint
 * 5. Faker - Geração de dados via generators.js
 * 6. Variável de Ambiente - BASE_URL e VUS configuráveis
 * 7. Stages - Fases de carga progressiva
 * 8. Reaproveitamento de Resposta - Account e Token reutilizados
 * 9. Uso de Token de Autenticação - JWT em headers
 * 10. Data-Driven Testing - SharedArray com users.json
 * 11. Groups - Agrupamento lógico de operações
 */

import { check, group, sleep } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import http from 'k6/http';

// ============================================================================
// IMPORTS - Configurações e Helpers
// ============================================================================
import { options, BASE_URL } from '../config/options.js';
import { login, registerUser, getAuthHeaders } from '../helpers/auth.js';
import { generateUser, generateAmount, generateUniqueId } from '../helpers/generators.js';
import { authenticatedGet, authenticatedPost, thinkTime } from '../helpers/http.js';

// ============================================================================
// EXPORTAÇÃO DAS OPÇÕES DO K6
// Conceito: THRESHOLDS e STAGES são aplicados aqui
// ============================================================================
export { options };

// ============================================================================
// TRENDS - Métricas Customizadas
// Conceito: Criar métricas específicas para cada endpoint/operação
// Permite análise granular de performance
// ============================================================================
const loginDuration = new Trend('login_duration', true);
const registerDuration = new Trend('register_duration', true);
const transferDuration = new Trend('transfer_duration', true);
const profileDuration = new Trend('profile_duration', true);
const balanceDuration = new Trend('balance_duration', true);
const listTransfersDuration = new Trend('list_transfers_duration', true);

// Contadores customizados
const successfulLogins = new Counter('successful_logins');
const successfulRegistrations = new Counter('successful_registrations');
const successfulTransfers = new Counter('successful_transfers');
const failedOperations = new Counter('failed_operations');

// Taxa de sucesso
const successRate = new Rate('success_rate');

// ============================================================================
// DATA-DRIVEN TESTING - SharedArray
// Conceito: Carrega dados de arquivo JSON para uso nos testes
// SharedArray é eficiente pois compartilha dados entre VUs
// ============================================================================
const testUsers = new SharedArray('users', function() {
    // Carrega dados do arquivo JSON para Data-Driven Testing
    return JSON.parse(open('../data/users.json'));
});

// ============================================================================
// SETUP - Preparação do ambiente de teste
// Executado uma vez antes dos testes
// ============================================================================
export function setup() {
    console.log(`🚀 Iniciando testes de performance`);
    console.log(`📍 Base URL: ${BASE_URL}`);
    console.log(`👥 Usuários de teste carregados: ${testUsers.length}`);
    
    // Verifica se a API está disponível
    const healthCheck = http.get(`${BASE_URL}/health`);
    
    if (healthCheck.status !== 200) {
        console.error('❌ API não está disponível! Verifique se o servidor está rodando.');
        return { apiAvailable: false };
    }
    
    console.log('✅ API disponível e respondendo');
    
    // Cria um usuário receptor para transferências
    // REAPROVEITAMENTO: Este usuário será usado como destino de transferências
    const receiverData = {
        name: 'Usuario Receptor K6',
        email: `receptor.k6.${generateUniqueId()}@teste.com`,
        password: 'senha123'
    };
    
    const receiverResult = registerUser(receiverData);
    
    if (receiverResult) {
        console.log(`✅ Usuário receptor criado: ${receiverResult.user.account}`);
        return {
            apiAvailable: true,
            receiverAccount: receiverResult.user.account,
            receiverEmail: receiverData.email,
            receiverPassword: receiverData.password
        };
    }
    
    console.log('⚠️ Não foi possível criar usuário receptor, testes de transferência podem falhar');
    return { apiAvailable: true, receiverAccount: null };
}

// ============================================================================
// FUNÇÃO PRINCIPAL - Cenário de Teste
// Cada VU (Virtual User) executa esta função repetidamente
// ============================================================================
export default function(data) {
    if (!data.apiAvailable) {
        console.error('API não disponível, pulando iteração');
        sleep(1);
        return;
    }

    // ========================================================================
    // DATA-DRIVEN TESTING
    // Seleciona um usuário do array baseado no ID do VU
    // Cada VU pode trabalhar com dados diferentes
    // ========================================================================
    const vuId = __VU;
    const iteration = __ITER;
    const testUserData = testUsers[vuId % testUsers.length];
    
    // ========================================================================
    // FAKER - Geração de dados únicos
    // Usa helper de geração para criar usuário único por iteração
    // ========================================================================
    const uniqueUser = generateUser();
    // Torna o email único por VU e iteração
    uniqueUser.email = `${uniqueUser.email.split('@')[0]}.vu${vuId}.iter${iteration}@teste.com`;

    // Variáveis para REAPROVEITAMENTO DE RESPOSTA
    let userToken = null;
    let userAccount = null;
    let userId = null;

    // ========================================================================
    // GROUP: Register User
    // Conceito: Agrupa operações relacionadas para métricas e organização
    // ========================================================================
    group('Register User', function() {
        const startTime = Date.now();
        
        const payload = JSON.stringify(uniqueUser);
        const params = {
            headers: { 'Content-Type': 'application/json' },
            tags: { name: 'register' }
        };
        
        const response = http.post(`${BASE_URL}/users/register`, payload, params);
        
        // TREND: Registra duração da operação
        registerDuration.add(Date.now() - startTime);
        
        // CHECKS: Validações da resposta
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
        
        // Atualiza métricas
        successRate.add(checkResult);
        if (checkResult) {
            successfulRegistrations.add(1);
            // REAPROVEITAMENTO DE RESPOSTA: Guarda account para uso posterior
            const body = response.json();
            userAccount = body.data.account;
            userId = body.data.id;
        } else {
            failedOperations.add(1);
        }
    });

    // Think time entre operações
    thinkTime(0.5, 1);

    // ========================================================================
    // GROUP: Login
    // Conceito: HELPERS são usados aqui (função login importada)
    // ========================================================================
    group('Login', function() {
        const startTime = Date.now();
        
        // HELPER: Usa função de login do auth.js
        // USO DE TOKEN: O token retornado será usado nas próximas requisições
        userToken = login(uniqueUser.email, uniqueUser.password);
        
        // TREND: Registra duração do login
        loginDuration.add(Date.now() - startTime);
        
        // CHECKS: Validações
        const loginSuccess = check(null, {
            'login: token received': () => userToken !== null,
            'login: token is string': () => typeof userToken === 'string',
            'login: token has content': () => userToken && userToken.length > 10
        });
        
        successRate.add(loginSuccess);
        if (loginSuccess) {
            successfulLogins.add(1);
        } else {
            failedOperations.add(1);
        }
    });

    // Prossegue apenas se tiver token
    if (!userToken) {
        console.log(`VU ${vuId}: Login falhou, pulando operações autenticadas`);
        sleep(1);
        return;
    }

    thinkTime(0.5, 1);

    // ========================================================================
    // GROUP: User Profile
    // Demonstra CHECKS detalhados e uso de TOKEN DE AUTENTICAÇÃO
    // ========================================================================
    group('User Profile', function() {
        const startTime = Date.now();
        
        // USO DE TOKEN: Headers com Authorization Bearer
        const params = {
            headers: getAuthHeaders(userToken),
            tags: { name: 'profile' }
        };
        
        const response = http.get(`${BASE_URL}/users/profile`, params);
        
        // TREND: Métrica customizada
        profileDuration.add(Date.now() - startTime);
        
        // CHECKS: Múltiplas validações
        const checkResult = check(response, {
            'profile: status is 200': (r) => r.status === 200,
            'profile: has user name': (r) => {
                try {
                    const body = r.json();
                    return body.data && body.data.name === uniqueUser.name;
                } catch (e) {
                    return false;
                }
            },
            'profile: has correct email': (r) => {
                try {
                    const body = r.json();
                    return body.data && body.data.email === uniqueUser.email;
                } catch (e) {
                    return false;
                }
            },
            'profile: has account number': (r) => {
                try {
                    const body = r.json();
                    return body.data && body.data.account === userAccount;
                } catch (e) {
                    return false;
                }
            }
        });
        
        successRate.add(checkResult);
    });

    thinkTime(0.3, 0.8);

    // ========================================================================
    // GROUP: Check Balance
    // ========================================================================
    group('Check Balance', function() {
        const startTime = Date.now();
        
        const response = authenticatedGet('/users/balance', userToken, { name: 'balance' });
        
        // TREND
        balanceDuration.add(Date.now() - startTime);
        
        // CHECKS
        const checkResult = check(response, {
            'balance: status is 200': (r) => r.status === 200,
            'balance: has balance field': (r) => {
                try {
                    const body = r.json();
                    return body.data && typeof body.data.balance === 'number';
                } catch (e) {
                    return false;
                }
            },
            'balance: is non-negative': (r) => {
                try {
                    const body = r.json();
                    return body.data.balance >= 0;
                } catch (e) {
                    return false;
                }
            }
        });
        
        successRate.add(checkResult);
    });

    thinkTime(0.5, 1);

    // ========================================================================
    // GROUP: Transfer Operations
    // Demonstra REAPROVEITAMENTO de account do usuário receptor
    // e DATA-DRIVEN com valores do testUserData
    // ========================================================================
    group('Transfer Operations', function() {
        // Só executa se tiver um receptor disponível
        if (!data.receiverAccount) {
            console.log(`VU ${vuId}: Sem conta receptora, pulando transferências`);
            return;
        }
        
        const startTime = Date.now();
        
        // FAKER: Gera dados de transferência
        // DATA-DRIVEN: Usa valor do usuário de teste carregado do JSON
        const transferData = {
            toAccount: data.receiverAccount,  // REAPROVEITAMENTO: usa account do setup
            amount: testUserData.transferAmount || generateAmount(10, 500),
            description: `Transfer from VU ${vuId} - ${testUserData.scenario || 'test'}`
        };
        
        // Executa transferência
        const response = authenticatedPost('/transfers', transferData, userToken, { name: 'transfer' });
        
        // TREND
        transferDuration.add(Date.now() - startTime);
        
        // CHECKS: Validações de transferência
        const checkResult = check(response, {
            'transfer: status is 201 or 400': (r) => r.status === 201 || r.status === 400,
            'transfer: has response body': (r) => {
                try {
                    r.json();
                    return true;
                } catch (e) {
                    return false;
                }
            },
            'transfer: successful or expected error': (r) => {
                if (r.status === 201) return true;
                // 400 pode ser saldo insuficiente (esperado em alguns cenários)
                if (r.status === 400) {
                    try {
                        const body = r.json();
                        return body.error !== undefined;
                    } catch (e) {
                        return false;
                    }
                }
                return false;
            }
        });
        
        successRate.add(checkResult);
        if (response.status === 201) {
            successfulTransfers.add(1);
        }
    });

    thinkTime(0.5, 1);

    // ========================================================================
    // GROUP: List Transfers
    // Verifica histórico de transferências
    // ========================================================================
    group('List Transfers', function() {
        const startTime = Date.now();
        
        const response = authenticatedGet('/transfers', userToken, { name: 'list-transfers' });
        
        // TREND
        listTransfersDuration.add(Date.now() - startTime);
        
        // CHECKS
        const checkResult = check(response, {
            'list transfers: status is 200': (r) => r.status === 200,
            'list transfers: returns array': (r) => {
                try {
                    const body = r.json();
                    return body.data && Array.isArray(body.data);
                } catch (e) {
                    return false;
                }
            }
        });
        
        successRate.add(checkResult);
    });

    // Think time final antes da próxima iteração
    thinkTime(1, 2);
}

// ============================================================================
// TEARDOWN - Finalização do teste
// Executado uma vez após todos os testes
// ============================================================================
export function teardown(data) {
    console.log('\n📊 Teste de Performance Finalizado');
    console.log('=====================================');
    console.log(`API Base URL: ${BASE_URL}`);
    console.log(`Usuário receptor utilizado: ${data.receiverAccount || 'N/A'}`);
    console.log('=====================================\n');
}

// ============================================================================
// CONFIGURAÇÃO DE CENÁRIOS (Alternativa a stages)
// Pode ser usado para testes mais complexos
// ============================================================================
/*
export const scenarios = {
    // Cenário de carga constante
    constant_load: {
        executor: 'constant-vus',
        vus: 5,
        duration: '1m',
    },
    // Cenário de ramping
    ramping_load: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: [
            { duration: '30s', target: 10 },
            { duration: '1m', target: 10 },
            { duration: '30s', target: 0 },
        ],
    },
    // Cenário de taxa constante
    constant_rate: {
        executor: 'constant-arrival-rate',
        rate: 10,
        timeUnit: '1s',
        duration: '1m',
        preAllocatedVUs: 20,
    },
};
*/

// ============================================================================
// HANDLE SUMMARY - Geração de Relatório HTML
// Gera automaticamente relatório ao final da execução
// ============================================================================
export function handleSummary(data) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    return {
        // Relatório HTML principal (caminho relativo ao diretório de execução)
        './test/k6/report.html': htmlReport(data, { title: 'K6 Banking API - Performance Test Report' }),
        
        // Relatório com timestamp para histórico
        [`./test/k6/reports/report-${timestamp}.html`]: htmlReport(data, { title: `K6 Report - ${timestamp}` }),
        
        // Sumário JSON para processamento
        './test/k6/summary.json': JSON.stringify(data, null, 2),
        
        // Saída no console
        stdout: textSummary(data, { indent: ' ', enableColors: true }),
    };
}

