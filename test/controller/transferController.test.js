const { expect } = require('chai');
const sinon = require('sinon');

// Importando helper
const { createTestToken, 
        createExpiredToken,
        createInvalidToken
      } = require('../helpers/authHelper');

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
      addFavorite,
      TestUnauthorized
} = require('../helpers/requestHelper');

//const { addFavorite } = require('../../src/services/transferService');


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

      it('Dados Invalidos not passing the account: code 400', async () => { 
            const validUser = await createTestUser(); // usuario com normal 
            const invalidTransferData = getInvalidTransferData();
            const token = createTestToken(validUser.id, validUser.email, validUser.account)
          
            const transferData = { 
               toAccount: invalidTransferData[0].toAccountaccount,
               amount: invalidTransferData[0].amount, //Mais que o saldo disponinivel 10 
               description: 'transferencia com dados invalidos'
            }
   
            const response = await createTransfer(token, transferData);
   
            expect(response.status).to.equal(400);
            expect(response.body.error).to.equal('Dados inválidos');
   
         });

         
      it('Dados Invalidos passing the amount as 0: code 400', async () => { 
            const validUser = await createTestUser(); // usuario com normal 
            const invalidTransferData = getInvalidTransferData();
            const token = createTestToken(validUser.id, validUser.email, validUser.account)
          
            const transferData = { 
               toAccount: invalidTransferData[2].toAccount,
               amount: invalidTransferData[2].amount, //Mais que o saldo disponinivel 10 
               description: 'transferencia com saldo as 0'
            }
   
            const response = await createTransfer(token, transferData);
   
            expect(response.status).to.equal(400);
            expect(response.body.error).to.equal('Dados inválidos');
            expect(response.body.details).to.include('Valor deve ser maior que zero')
   
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
                toAccount: '123456', // essa conta nao existe nesse contexto
                amount: 100,
                description: 'Transferência para conta inexistente'
            }

            const response = await createTransfer(token, transferData);

            expect(response.status).to.equal(404);
            expect(response.body.error).to.equal('Conta de destino não encontrada');

      });

      it('Transferencia com token invalido recebe 403', async () => { 
         const [user1, user2] = await createMultipleTestUsers(2)
         const token = createInvalidToken(user1.id, user1.email, user1.account)
         const transferData = getValidTransferData(user2.account);

         const response = await createTransfer(token, transferData);

         expect(response.status).to.equal(403);
         expect(response.body.error).to.equal('Token inválido');

      });


      it('Transferencia com token expirado recebe 403', async () => { 
         const [user1, user2] = await createMultipleTestUsers(2)
         const token = createExpiredToken(user1.id, user1.email, user1.account)
         const transferData = getValidTransferData(user2.account);

         const response = await createTransfer(token, transferData);

         expect(response.status).to.equal(403);
         expect(response.body.error).to.equal('Token inválido');
      });

     
      it('Transferencia para si mesmo deve falhar', async () => { 
         const [user1, user2] = await createMultipleTestUsers(2)
         const token = createTestToken(user1.id, user1.email, user1.account)
         const transferData = getValidTransferData(user1.account);

         const response = await createTransfer(token, transferData);

         expect(response.status).to.equal(400);
         expect(response.body.error).to.equal('Não é possível transferir para si mesmo');

      });


      it('Transferencia acima de 5k para usuario favorito deve funcionar', async () => { 
         const richUser = await createRichUser();
            const normalUser = await createTestUser();

            const token = createTestToken(richUser.id, richUser.email, richUser.account)
            const favorecido = await addFavorite(token, normalUser.account)

            const transferData = { 
                toAccount: normalUser.account,
                amount: 10000,
                description: 'Transferência realizada com sucesso'
            }
               
            const response = await createTransfer(token, transferData);
            expect(response.status).to.equal(201);
            expect(response.body.data.amount).to.equal(10000);
            expect(response.body).to.have.property('data'); 
            expect(response.body).to.have.property('message', 'Transferência realizada com sucesso');

      });

      it('Dados invalidos - conta com tamanho incorreto', async () => {
         const validUser = await createTestUser(); // usuario com normal 
         const invalidTransferData = getInvalidTransferData();
         const token = createTestToken(validUser.id, validUser.email, validUser.account)
       
         const transferData = { 
            toAccount: invalidTransferData[4].toAccount, // user with 5 digits
            amount: invalidTransferData[4].amount, 
            description: 'Conta deve ter exatamente 6 dígitos'
         }

         const response = await createTransfer(token, transferData);

         expect(response.status).to.equal(400);
         expect(response.body.error).to.equal('Dados inválidos');
         expect(response.body.details).to.include('Conta deve ter exatamente 6 dígitos')


      });

      it('Dados invalidos - conta nao numerica', async () => {
         const validUser = await createTestUser(); // usuario com normal 
         const invalidTransferData = getInvalidTransferData();
         const token = createTestToken(validUser.id, validUser.email, validUser.account)
       
         const transferData = { 
            toAccount: invalidTransferData[5].toAccount, // user with 5 digits
            amount: invalidTransferData[5].amount, 
            description: 'Conta deve conter apenas números'
         }

         const response = await createTransfer(token, transferData);

         expect(response.status).to.equal(400);
         expect(response.body.error).to.equal('Dados inválidos');
         expect(response.body.details).to.include('Conta deve conter apenas números')

      });

      it('Transferencia com valor decimal deve funcionar', async () => {
         const [user1, user2] = await createMultipleTestUsers(2)
         const token = createTestToken(user1.id, user1.email, user1.account)
        
         const transferData = { 
            toAccount: user2.account, 
            amount: 92.36, 
            description: 'Transferência realizada com sucesso'
         }
         const response = await createTransfer(token, transferData);

         expect(response.status).to.equal(201);
         expect(response.body.data.amount).to.equal(92.36);

         expect(response.body).to.have.property('data'); 
         expect(response.body).to.have.property('message', 'Transferência realizada com sucesso');
         expect(response.body.data).to.have.property('id');
         expect(response.body.data).to.have.property('fromAccount', user1.account); 
         expect(response.body.data).to.have.property('toAccount', user2.account);  
         expect(response.body.data).to.have.property('amount', transferData.amount);
         expect(response.body.data).to.have.property('description', transferData.description);
      });
 
      it('Transferencia exatamente 5000 para nao favorito deve funcionar', async () => { 
      const richUser = await createRichUser();
      const normalUser = await createTestUser()
      const token = createTestToken(richUser.id, richUser.email, richUser.account)
      
      const transferData = { 
         toAccount: normalUser.account,
         amount: 5000,
         description: 'Transferência realizada com sucesso'
     }
     const response = await createTransfer(token, transferData);

      expect(response.status).to.equal(201);
      expect(response.body.data.amount).to.equal(5000);

      expect(response.body).to.have.property('data'); 
      expect(response.body).to.have.property('message', 'Transferência realizada com sucesso');
      expect(response.body.data).to.have.property('id');
      expect(response.body.data).to.have.property('fromAccount', richUser.account); 
      expect(response.body.data).to.have.property('toAccount', normalUser.account);  
      expect(response.body.data).to.have.property('amount', transferData.amount);
      expect(response.body.data).to.have.property('description', transferData.description);
      });

      it('Transferencia sem autenticacao recebe 401') // need to understand what is it 

      it('Dados invalidos - amount negativo')

      it('Dados invalidos - sem amount')

      it('Dados invalidos - description muito longa')

      // favoritos

      it('Adicionar favorito sem autenticacao recebe 401')
 
      it('Adicionar favorito com conta valida retorna 201')

      it('Adicionar favorito com conta inexistente recebe 404')

      it('Adicionar mesma conta aos favoritos duas vezes recebe 409')

      it('Adicionar propria conta aos favoritos deve falhar')

      it('Listar favoritos sem autenticacao recebe 401')

      it('Listar favoritos retorna array vazio inicialmente')

      it('Remover favorito inexistente recebe 404')

      // edges cases 

      it('Transferencia com dados extras nao definidos no schema')
      it('Transferencia com headers malformados')

      it('Multiple transferencias simultaneas do mesmo usuario')

      it('Transferencia para conta que acabou de ser deletada')

  });

   describe('POST /favorites', () => { 
      it('Adicionar Favorito com sucesso retorna 201', async () => { 
         const normalUser = await createTestUser();
         const favorecido = await createTestUser();
         const token = createTestToken(normalUser.id, normalUser.email, normalUser.account)

         const response = await addFavorite(token, favorecido.account )

         expect(response.status).to.equal(201);
         expect(response.body.data.account).to.equal(favorecido.account);
    
   });

   it('Adicionar Favorito com conta inexistente recebe 404', async () => { 
      const normalUser = await createTestUser();
      const token = createTestToken(normalUser.id, normalUser.email, normalUser.account)

      const response = await addFavorite(token, '123456')

      expect(response.status).to.equal(404);
      expect(response.body.error).to.equal('Conta não encontrada');

   });

   it('Adicionar mesma conta aos favoritos duas vezes recebe 409', async () => { 
      const normalUser = await createTestUser();
      const favorecido = await createTestUser();
      const token = createTestToken(normalUser.id, normalUser.email, normalUser.account)

      const addedFavorite = await addFavorite(token, favorecido.account )
      expect(addedFavorite.status).to.equal(201);
      expect(addedFavorite.body.data.account).to.equal(favorecido.account);

      const addedFavoriteagain = await addFavorite(token, favorecido.account )
      expect(addedFavoriteagain.status).to.equal(409);
      expect(addedFavoriteagain.body.error).to.contain('Usuário já está nos favoritos');
   });
});

   describe('GET /favorites', () => { 
      it('Listar favoritos sem autenticacao recebe 401')

      it('Listar favoritos retorna array vazio inicialmente')

      it('Listar favoritos retorna array com contas favoritas')
   });

});