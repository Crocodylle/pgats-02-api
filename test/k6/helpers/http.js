/**
 * HTTP Helper para K6
 * 
 * Conceito: HELPERS - Funções utilitárias para requisições HTTP
 * Encapsula padrões comuns de requisições para a API
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL } from '../config/options.js';
import { getAuthHeaders } from './auth.js';

/**
 * HELPER: Realiza requisição GET autenticada
 * 
 * @param {string} endpoint - Endpoint da API (ex: /users/profile)
 * @param {string} token - Token JWT
 * @param {object} tags - Tags adicionais para métricas
 * @returns {object} Response do K6
 */
export function authenticatedGet(endpoint, token, tags = {}) {
    const params = {
        headers: getAuthHeaders(token),
        tags: { name: endpoint, ...tags },
    };

    return http.get(`${BASE_URL}${endpoint}`, params);
}

/**
 * HELPER: Realiza requisição POST autenticada
 * 
 * @param {string} endpoint - Endpoint da API
 * @param {object} data - Dados a enviar
 * @param {string} token - Token JWT
 * @param {object} tags - Tags adicionais
 * @returns {object} Response do K6
 */
export function authenticatedPost(endpoint, data, token, tags = {}) {
    const params = {
        headers: getAuthHeaders(token),
        tags: { name: endpoint, ...tags },
    };

    return http.post(`${BASE_URL}${endpoint}`, JSON.stringify(data), params);
}

/**
 * HELPER: Realiza requisição DELETE autenticada
 * 
 * @param {string} endpoint - Endpoint da API
 * @param {string} token - Token JWT
 * @param {object} tags - Tags adicionais
 * @returns {object} Response do K6
 */
export function authenticatedDelete(endpoint, token, tags = {}) {
    const params = {
        headers: getAuthHeaders(token),
        tags: { name: endpoint, ...tags },
    };

    return http.del(`${BASE_URL}${endpoint}`, null, params);
}

/**
 * HELPER: Realiza requisição POST sem autenticação
 * 
 * @param {string} endpoint - Endpoint da API
 * @param {object} data - Dados a enviar
 * @param {object} tags - Tags adicionais
 * @returns {object} Response do K6
 */
export function publicPost(endpoint, data, tags = {}) {
    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
        tags: { name: endpoint, ...tags },
    };

    return http.post(`${BASE_URL}${endpoint}`, JSON.stringify(data), params);
}

/**
 * HELPER: Realiza requisição GET sem autenticação
 * 
 * @param {string} endpoint - Endpoint da API
 * @param {object} tags - Tags adicionais
 * @returns {object} Response do K6
 */
export function publicGet(endpoint, tags = {}) {
    const params = {
        tags: { name: endpoint, ...tags },
    };

    return http.get(`${BASE_URL}${endpoint}`, params);
}

/**
 * HELPER: Verifica health check da API
 * 
 * @returns {boolean} true se API está saudável
 */
export function checkHealth() {
    const response = publicGet('/health', { name: 'health-check' });
    
    return check(response, {
        'health check status is 200': (r) => r.status === 200,
    });
}

/**
 * HELPER: Aguarda um tempo aleatório (think time)
 * Simula comportamento real de usuário
 * 
 * @param {number} min - Tempo mínimo em segundos
 * @param {number} max - Tempo máximo em segundos
 */
export function thinkTime(min = 1, max = 3) {
    const time = Math.random() * (max - min) + min;
    sleep(time);
}

/**
 * HELPER: Extrai dados da resposta JSON de forma segura
 * 
 * @param {object} response - Response do K6
 * @param {string} path - Caminho no JSON (ex: 'data.token')
 * @returns {any} Valor extraído ou null
 */
export function extractFromResponse(response, path) {
    try {
        const body = response.json();
        const keys = path.split('.');
        let value = body;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return null;
            }
        }
        
        return value;
    } catch (e) {
        return null;
    }
}

/**
 * HELPER: Cria checks padrão para resposta de sucesso
 * 
 * @param {object} response - Response do K6
 * @param {number} expectedStatus - Status esperado (padrão 200)
 * @param {string} operationName - Nome da operação para logs
 * @returns {boolean} Resultado dos checks
 */
export function checkSuccess(response, expectedStatus = 200, operationName = 'operation') {
    return check(response, {
        [`${operationName} status is ${expectedStatus}`]: (r) => r.status === expectedStatus,
        [`${operationName} response is JSON`]: (r) => {
            try {
                r.json();
                return true;
            } catch (e) {
                return false;
            }
        },
    });
}

/**
 * HELPER: Realiza batch de requisições paralelas
 * 
 * @param {array} requests - Array de objetos {method, url, body, params}
 * @returns {array} Respostas
 */
export function batchRequests(requests) {
    const batch = requests.map(req => {
        const url = req.url.startsWith('http') ? req.url : `${BASE_URL}${req.url}`;
        return [req.method || 'GET', url, req.body || null, req.params || {}];
    });
    
    return http.batch(batch);
}

export default {
    authenticatedGet,
    authenticatedPost,
    authenticatedDelete,
    publicPost,
    publicGet,
    checkHealth,
    thinkTime,
    extractFromResponse,
    checkSuccess,
    batchRequests,
};

