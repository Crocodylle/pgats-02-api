const { expect } = require('chai');
const sinon = require('sinon');

// Importando helper
const { createTestToken, 
        createExpiredToken,
        createInvalidToken
      } = require('../helpers/authHelper');


const {  
      authenticatedPost,
      createTransfer,
      addFavorite,
      TestUnauthorized
} = require('../helpers/requestHelper');

//const { addFavorite } = require('../../src/services/transferService');


describe('User Controller', () => { 
     // restaurar o mock
 afterEach(() => {
      sinon.restore();
   });
  
   describe('Get /', () => { 
      it('asdfe', async () => {
         // preparar os Dados 
            // Carregar o arquivo 
            // Preparar a forma de ignorar os campos dinamicos 

         });
      });
   describe('POST /users/register', () => { 
            it('rrrrr', async () => {
               // preparar os Dados 
                  // Carregar o arquivo 
                  // Preparar a forma de ignorar os campos dinamicos 
      
            });
      });   
   describe('Get /users/profile', () => { 
            it('yyyy', async () => {
               // preparar os Dados 
                  // Carregar o arquivo 
                  // Preparar a forma de ignorar os campos dinamicos 
      
            });
      });   
   describe('Get /users/balance', () => { 
            it('xxxx', async () => {
               // preparar os Dados 
                  // Carregar o arquivo 
                  // Preparar a forma de ignorar os campos dinamicos 
      
            });
      }); 
});
