const { expect } = require('chai');
const sinon = require('sinon');

// Importando helper
const { createTestToken, createExpiredToken } = require('../helpers/authHelper');

const { 
      createTestUser,
      createPoorUser,
      createMultipleTestUsers,
      createRichUser,
      getValidTransferData,
      clearDatabase,
      getInvalidTransferData
} = require('../helpers/dataHelper');

const {  
      authenticatedPost,
      createTransfer,
      AddFavorite,
      TestUnauthorized
} = require('../helpers/requestHelper');



// Mock 
//const transferService = require('../../src/services/transferService.js');
//const auth = require('../../src/middlewares/auth.js');



describe('Transfer Controller', () => { 
     // restaurar o mock
 afterEach(() => {
      sinon.restore();
   });

   describe('POST /transfers', () => {
      it('Happy PATH: Transferencia com sucesso', async () => {
            const [user1, user2] = await createMultipleTestUsers(2)
            const token = createTestToken(user1.id, user1.email, user1.account)
            const transferData = getValidTransferData(user2.account);

            const response = await createTransfer(token, transferData);

            expect(response.status).to.equal(201);
            expect(response.body.data.amount).to.equal(100);

            expect(response.body).to.have.property('data'); 
            expect(response.body).to.have.property('message', 'Transferência realizada com sucesso');
            expect(response.body.data).to.have.property('id');
            expect(response.body.data).to.have.property('fromAccount', user1.account); 
            expect(response.body.data).to.have.property('toAccount', user2.account);  
            expect(response.body.data).to.have.property('amount', transferData.amount);
            expect(response.body.data).to.have.property('description', transferData.description);
      
      });

      it('Quando o Saldo e insuficiente recebo code 400', async () => { 
         const poorUser = await createPoorUser(); // usuario com pouco saldo 
         const normalUser = await createTestUser(); // usuario com saldo normal

         const token = createTestToken(poorUser.id, poorUser.email, poorUser.account)
       
         const transferData = { 
            toAccount: normalUser.account,
            amount: 100, //Mais que o saldo disponinivel 10 
            description: 'transferencia com saldo insuficiente'
         }

         const response = await createTransfer(token, transferData);

         expect(response.status).to.equal(400);
         expect(response.body.error).to.equal('Saldo insuficiente');

      });

      it('Transferencia acimar de 5k para nao favorecidos', async () => { 
            const richUser = await createRichUser();
            const normalUser = await createTestUser();

            const token = createTestToken(richUser.id, richUser.email, richUser.account)

            const transferData = { 
                toAccount: normalUser.account,
                amount: 5001,
                description: 'Transferências de R$ 5.001,00 para usuários normais são proibidas'
            }

            const response = await createTransfer(token, transferData);

            expect(response.status).to.equal(403);
            expect(response.body.error).to.equal('Transferências acima de R$ 5.000,00 só podem ser realizadas para usuários favorecidos');
      });

      it('Conta nao encontrada', async () => { 
            const normalUser = await createTestUser();
            const token = createTestToken(normalUser.id, normalUser.email, normalUser.account)

            const transferData = { 
                toAccount: '123456',
                amount: 100,
                description: 'Transferência para conta inexistente'
            }

            const response = await createTransfer(token, transferData);

            expect(response.status).to.equal(404);
            expect(response.body.error).to.equal('Conta de destino não encontrada');

      });

});

});




