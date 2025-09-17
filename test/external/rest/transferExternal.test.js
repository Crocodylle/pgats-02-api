// test/external/transferExternal.test.js
const { expect } = require('chai');

// ✅ MUDANÇA: Usar helper para API externa
const { 
    createTransfer,
    addFavorite,
    listFavorites,
    registerUser,
    loginUser,
    checkApiHealth,
    createTestUsers,
    cleanupTestData,
    BASE_URL
} = require('../../helpers/externalApiHelper');

describe('🌐 Transfer Controller - API Externa Real', () => {
    
    // ✅ IMPORTANTE: Verificar se API está rodando antes dos testes
    before(async function() {
        this.timeout(15000); // 15 segundos para conectar
        
        console.log(`🔍 Verificando se API está rodando em ${BASE_URL}...`);
        
        const isApiRunning = await checkApiHealth();
        if (!isApiRunning) {
            throw new Error(`
❌ API não está rodando em ${BASE_URL}

Para rodar os testes externos:
1. Abra um terminal e execute: npm start
2. Aguarde a mensagem "Servidor rodando na porta 3000"
3. Em outro terminal, execute: npm test -- --grep "API Externa"
            `);
        }
        
        console.log(`✅ API conectada com sucesso em ${BASE_URL}`);
    });

    after(async function() {
        // Tentar limpar dados de teste
        await cleanupTestData();
    });

    describe('POST /transfers', () => {
        
        it('Quando o Saldo é insuficiente recebo code 400 - HTTP Real', async function() {
            this.timeout(15000);
            
            // ✅ Criar usuários via API real (apenas campos aceitos)
            const user1Data = {
                name: 'Usuario Remetente',
                email: `remetente.${Date.now()}@email.com`,
                password: 'senha123'
                // ✅ API cria automaticamente: account (6 dígitos) e balance (1000)
            };

            const user2Data = {
                name: 'Usuario Destinatario',
                email: `destinatario.${Date.now()}@email.com`,
                password: 'senha123'
            };

            // Registrar usuários via API
            const user1Response = await registerUser(user1Data);
            const user2Response = await registerUser(user2Data);
            
            expect(user1Response.status).to.equal(201);
            expect(user2Response.status).to.equal(201);

            // Extrair dados dos usuários criados
            const user1 = user1Response.body.data;
            const user2 = user2Response.body.data;

            // Fazer login para obter token real
            const loginResponse = await loginUser(user1Data.email, user1Data.password);
            expect(loginResponse.status).to.equal(200);
            expect(loginResponse.body).to.have.property('data');
            expect(loginResponse.body.data).to.have.property('token');
            
            const token = loginResponse.body.data.token;

            // ✅ Transferência que deve falhar por saldo insuficiente
            // User1 tem saldo 1000, vamos tentar transferir 1500
            const transferData = {
                toAccount: user2.account,
                amount: 1500, // Mais que o saldo disponível (1000)
                description: 'transferencia com saldo insuficiente via HTTP'
            };

            const response = await createTransfer(token, transferData);

            // ✅ Verificações
            expect(response.status).to.equal(400);
            expect(response.body.error).to.equal('Saldo insuficiente');
        });
      });
});