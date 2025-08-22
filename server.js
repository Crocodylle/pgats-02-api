const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log('🚀 PGATS-02 API iniciada com sucesso!');
  console.log(`📡 Servidor rodando na porta ${PORT}`);
  console.log(`📚 Documentação disponível em: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health check em: http://localhost:${PORT}/health`);
  console.log('📋 Endpoints disponíveis:');
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
  console.log('💡 Para testar a API, acesse a documentação do Swagger!');
});

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
