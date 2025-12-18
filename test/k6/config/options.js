/**
 * K6 Performance Test Configuration
 * 
 * Este arquivo contém as configurações centralizadas para os testes de performance.
 * Demonstra os conceitos: THRESHOLDS, STAGES e VARIÁVEIS DE AMBIENTE
 */

// ============================================================================
// VARIÁVEIS DE AMBIENTE
// Conceito: Permite configurar o teste externamente sem alterar o código
// Uso: K6_BASE_URL=http://api.prod.com k6 run test.js
// ============================================================================
export const BASE_URL = __ENV.K6_BASE_URL || 'http://localhost:3000';
export const VUS = parseInt(__ENV.K6_VUS) || 10;
export const DURATION = __ENV.K6_DURATION || '2m';

// ============================================================================
// THRESHOLDS
// Conceito: Define limites de performance aceitáveis para o teste
// Se algum threshold falhar, o teste é considerado como falha
// ============================================================================
export const thresholds = {
    // Tempo de resposta HTTP geral
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],  // 95% das requisições < 500ms
    
    // Taxa de requisições com sucesso
    'http_req_failed': ['rate<0.01'],  // Menos de 1% de falhas
    
    // Thresholds específicos por grupo (serão definidos no teste)
    'group_duration{group:::Login}': ['p(95)<600'],
    'group_duration{group:::Register User}': ['p(95)<800'],
    'group_duration{group:::User Profile}': ['p(95)<400'],
    'group_duration{group:::Transfer Operations}': ['p(95)<700'],
    
    // Checks devem ter 100% de sucesso
    'checks': ['rate>0.95'],
    
    // Métricas customizadas (Trends) - serão populadas no teste
    'login_duration': ['p(95)<600'],
    'register_duration': ['p(95)<800'],
    'transfer_duration': ['p(95)<700'],
    'profile_duration': ['p(95)<400'],
};

// ============================================================================
// STAGES
// Conceito: Define fases de carga progressiva para simular cenários realistas
// Permite testar ramp-up, carga sustentada e ramp-down
// ============================================================================
export const stages = [
    // Fase 1: Ramp-up - Aumento gradual de usuários
    { duration: '30s', target: VUS },
    
    // Fase 2: Carga Sustentada - Mantém usuários no pico
    { duration: '1m', target: VUS },
    
    // Fase 3: Pico de Stress - Testa limite do sistema
    { duration: '30s', target: VUS * 2 },
    
    // Fase 4: Ramp-down - Redução gradual
    { duration: '30s', target: 0 },
];

// ============================================================================
// OPÇÕES COMPLETAS DO K6
// Agrupa todas as configurações em um objeto exportável
// ============================================================================
export const options = {
    stages: stages,
    thresholds: thresholds,
    
    // Configurações de saída e relatório
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
    
    // Tags padrão para identificação
    tags: {
        testType: 'performance',
        environment: __ENV.K6_ENV || 'local',
    },
    
    // Configurações de conexão
    batch: 10,
    batchPerHost: 5,
    
    // Não parar em falha de threshold durante desenvolvimento
    thresholdFailOnError: false,
};

// Exportação padrão
export default options;

