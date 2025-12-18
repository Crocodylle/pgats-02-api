/**
 * Authentication Helper para K6
 * 
 * Conceito: HELPERS - Funções reutilizáveis que encapsulam lógica comum
 * Conceito: USO DE TOKEN DE AUTENTICAÇÃO - Gerenciamento de JWT
 * Conceito: REAPROVEITAMENTO DE RESPOSTA - Token obtido é reutilizado
 */

import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL } from '../config/options.js';

/**
 * HELPER: Realiza login e retorna o token JWT
 * 
 * Esta função demonstra:
 * - HELPER: Função reutilizável para autenticação
 * - REAPROVEITAMENTO DE RESPOSTA: O token retornado é usado em outras requisições
 * - USO DE TOKEN: Extrai e retorna o JWT para uso posterior
 * 
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {string|null} Token JWT ou null se falhar
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

    // Verifica se o login foi bem sucedido
    const success = check(response, {
        'login status is 200': (r) => r.status === 200,
        'login response has token': (r) => {
            const body = r.json();
            return body && body.data && body.data.token;
        },
    });

    if (success) {
        const body = response.json();
        // REAPROVEITAMENTO DE RESPOSTA: Retorna o token para uso em outras requisições
        return body.data.token;
    }

    return null;
}

/**
 * HELPER: Registra um novo usuário e retorna os dados completos
 * 
 * Demonstra REAPROVEITAMENTO DE RESPOSTA: 
 * Os dados do usuário registrado (account, id) são usados em transferências
 * 
 * @param {object} userData - Dados do usuário {name, email, password}
 * @returns {object|null} Dados do usuário registrado ou null
 */
export function registerUser(userData) {
    const payload = JSON.stringify(userData);

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
        tags: { name: 'register' },
    };

    const response = http.post(`${BASE_URL}/users/register`, payload, params);

    const success = check(response, {
        'register status is 201': (r) => r.status === 201,
        'register response has user data': (r) => {
            const body = r.json();
            return body && body.data && body.data.account;
        },
    });

    if (success) {
        const body = response.json();
        // REAPROVEITAMENTO: Retorna dados completos incluindo account
        return {
            user: body.data,
            token: body.data.token || null
        };
    }

    return null;
}

/**
 * HELPER: Registra usuário e faz login automaticamente
 * 
 * Combina registro + login para facilitar setup de testes
 * Demonstra encadeamento de operações com reaproveitamento
 * 
 * @param {object} userData - Dados do usuário
 * @returns {object|null} {user, token} ou null
 */
export function registerAndLogin(userData) {
    // Primeiro registra o usuário
    const registerResult = registerUser(userData);
    
    if (!registerResult) {
        return null;
    }

    // Depois faz login para obter o token
    const token = login(userData.email, userData.password);
    
    if (!token) {
        return null;
    }

    // REAPROVEITAMENTO: Retorna user (com account) + token
    return {
        user: registerResult.user,
        token: token
    };
}

/**
 * HELPER: Cria headers de autenticação
 * 
 * Função utilitária para montar headers com Bearer token
 * 
 * @param {string} token - Token JWT
 * @returns {object} Headers com Authorization
 */
export function getAuthHeaders(token) {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
}

/**
 * HELPER: Verifica se um token é válido fazendo uma requisição de teste
 * 
 * @param {string} token - Token a verificar
 * @returns {boolean} true se válido
 */
export function isTokenValid(token) {
    if (!token) return false;

    const params = {
        headers: getAuthHeaders(token),
        tags: { name: 'token-validation' },
    };

    const response = http.get(`${BASE_URL}/users/profile`, params);
    return response.status === 200;
}

export default {
    login,
    registerUser,
    registerAndLogin,
    getAuthHeaders,
    isTokenValid,
};

