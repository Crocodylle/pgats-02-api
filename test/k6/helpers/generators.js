/**
 * Data Generators para K6
 * 
 * Conceito: FAKER - Geração dinâmica de dados de teste
 * 
 * K6 não possui biblioteca faker nativa, então implementamos
 * funções que geram dados aleatórios simulando comportamento do Faker
 */

/**
 * Gera um ID único baseado em timestamp e random
 * @returns {string} ID único
 */
export function generateUniqueId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * FAKER: Gera um nome aleatório realista
 * Simula @faker-js/faker: faker.person.fullName()
 * 
 * @returns {string} Nome completo gerado
 */
export function generateName() {
    const firstNames = [
        'João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Juliana',
        'Lucas', 'Fernanda', 'Rafael', 'Patricia', 'Bruno', 'Camila',
        'Diego', 'Amanda', 'Gabriel', 'Larissa', 'Thiago', 'Beatriz',
        'Matheus', 'Carolina', 'Felipe', 'Daniela', 'Leonardo', 'Vanessa'
    ];
    
    const lastNames = [
        'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira',
        'Almeida', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro',
        'Martins', 'Carvalho', 'Araújo', 'Melo', 'Barbosa', 'Cardoso',
        'Nascimento', 'Moreira', 'Nunes', 'Marques', 'Machado', 'Mendes'
    ];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
}

/**
 * FAKER: Gera um email único aleatório
 * Simula @faker-js/faker: faker.internet.email()
 * 
 * @param {string} name - Nome base para o email (opcional)
 * @returns {string} Email gerado
 */
export function generateEmail(name = null) {
    const domains = [
        'email.com', 'teste.com', 'exemplo.com.br', 'mail.com',
        'hotmail.com', 'gmail.com', 'outlook.com', 'yahoo.com'
    ];
    
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const uniqueId = generateUniqueId();
    
    if (name) {
        // Normaliza o nome para uso em email
        const normalizedName = name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '.');
        return `${normalizedName}.${uniqueId}@${domain}`;
    }
    
    return `user.${uniqueId}@${domain}`;
}

/**
 * FAKER: Gera uma senha aleatória segura
 * Simula @faker-js/faker: faker.internet.password()
 * 
 * @param {number} length - Tamanho da senha (mínimo 6)
 * @returns {string} Senha gerada
 */
export function generatePassword(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    
    for (let i = 0; i < Math.max(length, 6); i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return password;
}

/**
 * FAKER: Gera um valor monetário aleatório
 * Simula @faker-js/faker: faker.finance.amount()
 * 
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} Valor gerado
 */
export function generateAmount(min = 10, max = 1000) {
    const value = Math.random() * (max - min) + min;
    return Math.round(value * 100) / 100; // 2 casas decimais
}

/**
 * FAKER: Gera uma descrição de transferência aleatória
 * 
 * @returns {string} Descrição gerada
 */
export function generateTransferDescription() {
    const descriptions = [
        'Pagamento de conta',
        'Transferência mensal',
        'Aluguel',
        'Empréstimo',
        'Pagamento de serviço',
        'Compra online',
        'Reembolso',
        'Presente',
        'Divisão de despesas',
        'Pagamento PIX',
        'Transferência bancária',
        'Ajuda financeira'
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
}

/**
 * FAKER: Gera um objeto completo de usuário
 * Combina todas as funções de geração
 * 
 * @returns {object} Objeto com name, email, password
 */
export function generateUser() {
    const name = generateName();
    return {
        name: name,
        email: generateEmail(name),
        password: generatePassword()
    };
}

/**
 * FAKER: Gera dados de transferência
 * 
 * @param {string} toAccount - Conta destino
 * @returns {object} Dados da transferência
 */
export function generateTransfer(toAccount) {
    return {
        toAccount: toAccount,
        amount: generateAmount(10, 500), // Valor dentro do limite
        description: generateTransferDescription()
    };
}

/**
 * FAKER: Gera múltiplos usuários de uma vez
 * 
 * @param {number} count - Quantidade de usuários
 * @returns {array} Array de usuários gerados
 */
export function generateUsers(count) {
    const users = [];
    for (let i = 0; i < count; i++) {
        users.push(generateUser());
    }
    return users;
}

/**
 * Seleciona um item aleatório de um array
 * Útil para Data-Driven Testing
 * 
 * @param {array} array - Array de itens
 * @returns {any} Item selecionado
 */
export function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Gera um número inteiro aleatório
 * 
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} Número gerado
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default {
    generateUniqueId,
    generateName,
    generateEmail,
    generatePassword,
    generateAmount,
    generateTransferDescription,
    generateUser,
    generateTransfer,
    generateUsers,
    randomItem,
    randomInt,
};

