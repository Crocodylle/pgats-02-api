const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');

const app = require('../../app.js');

describe('Transfer Controller', () => { 
    describe('POST /transfers', () => { 
        it('Quando informo dados inválidos sem autenticação recebo 401', async () => { 
            const resposta = await request(app)
                .post('/transfers')
                .send({
                    toAccount: "123456",
                    amount: 100
                });
            expect(resposta.status).to.equal(401);
        });
    });

    describe('GET /transfers', () => { 
        it('Quando acesso sem autenticação recebo 401', async () => { 
            const resposta = await request(app)
                .get('/transfers');
            expect(resposta.status).to.equal(401);
        });
    });
});
