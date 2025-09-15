const { createGraphQLServer, createRestAppWithGraphQLInfo } = require('./appWithGraphQL');

// Iniciar ambos os servidores
const startServers = async () => {
  try {
    // Iniciar servidor GraphQL
    const { url: graphqlUrl } = await createGraphQLServer();
    
    // Iniciar servidor REST
    const restApp = createRestAppWithGraphQLInfo();
    const PORT = process.env.PORT || 3000;
    
    const server = restApp.listen(PORT, () => {
      console.log('🚀 PGATS-02 API (REST + GraphQL) iniciada com sucesso!');
      console.log('');
      console.log('📡 REST API:');
      console.log(`   • Servidor: http://localhost:${PORT}`);
      console.log(`   • Documentação: http://localhost:${PORT}/api-docs`);
      console.log(`   • Health check: http://localhost:${PORT}/health`);
      console.log('');
      console.log('🔍 GraphQL API:');
      console.log(`   • Servidor: ${graphqlUrl}`);
      console.log(`   • Playground: ${graphqlUrl} (acesse no navegador)`);
      console.log(`   • Info: http://localhost:${PORT}/graphql/info`);
      console.log('');
      console.log('📋 Endpoints REST disponíveis:');
      console.log('   • POST /auth/login - Login de usuário');
      console.log('   • POST /users/register - Registro de usuário');
      console.log('   • GET  /users - Listar usuários');
      console.log('   • GET  /users/profile - Perfil do usuário');
      console.log('   • GET  /users/balance - Saldo do usuário');
      console.log('   • POST /transfers - Realizar transferência');
      console.log('   • GET  /transfers - Listar transferências');
      console.log('   • POST /transfers/favorites - Adicionar favorito');
      console.log('   • GET  /transfers/favorites - Listar favoritos');
      console.log('   • DELETE /transfers/favorites/:id - Remover favorito');
      console.log('');
      console.log('📋 Operações GraphQL disponíveis:');
      console.log('   Queries: me, users, userBalance, transfers, favorites');
      console.log('   Mutations: login, register, createTransfer, addFavorite, removeFavorite');
      console.log('');
      console.log('💡 Para testar:');
      console.log('   • REST: Use Swagger UI ou Postman');
      console.log('   • GraphQL: Acesse o playground no navegador');
    });
    
    return server;
  } catch (error) {
    console.error('❌ Erro ao iniciar servidores:', error);
    process.exit(1);
  }
};

// Iniciar servidores
const server = startServers();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recebido. Encerrando servidor graciosamente...');
  server.close(() => {
    console.log('✅ Servidor encerrado.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recebido. Encerrando servidor graciosamente...');
  server.close(() => {
    console.log('✅ Servidor encerrado.');
    process.exit(0);
  });
});

module.exports = server;
