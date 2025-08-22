const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
const { authenticateToken } = require('../middlewares/auth');
const { validateRequest, transferSchema, favoriteSchema } = require('../middlewares/validation');

/**
 * @swagger
 * /transfers:
 *   post:
 *     summary: Realiza uma transferência
 *     tags: [Transferências]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - toAccount
 *               - amount
 *             properties:
 *               toAccount:
 *                 type: string
 *                 pattern: ^\d{6}$
 *                 example: "123456"
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 100.50
 *               description:
 *                 type: string
 *                 maxLength: 255
 *                 example: Pagamento da conta
 *     responses:
 *       201:
 *         description: Transferência realizada com sucesso
 *       400:
 *         description: Dados inválidos ou saldo insuficiente
 *       403:
 *         description: Transferência não permitida (valor alto para não favorecido)
 *       404:
 *         description: Conta não encontrada
 */
router.post('/', authenticateToken, validateRequest(transferSchema), transferController.createTransfer);

/**
 * @swagger
 * /transfers:
 *   get:
 *     summary: Lista transferências do usuário logado
 *     tags: [Transferências]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de transferências
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transfer'
 */
router.get('/', authenticateToken, transferController.getTransfers);

/**
 * @swagger
 * /transfers/favorites:
 *   post:
 *     summary: Adiciona uma conta aos favoritos
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account
 *             properties:
 *               account:
 *                 type: string
 *                 pattern: ^\d{6}$
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Favorito adicionado com sucesso
 *       404:
 *         description: Conta não encontrada
 *       409:
 *         description: Conta já está nos favoritos
 */
router.post('/favorites', authenticateToken, validateRequest(favoriteSchema), transferController.addFavorite);

/**
 * @swagger
 * /transfers/favorites:
 *   get:
 *     summary: Lista favoritos do usuário logado
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de favoritos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Favorite'
 */
router.get('/favorites', authenticateToken, transferController.getFavorites);

/**
 * @swagger
 * /transfers/favorites/{id}:
 *   delete:
 *     summary: Remove uma conta dos favoritos
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do favorito
 *     responses:
 *       200:
 *         description: Favorito removido com sucesso
 *       404:
 *         description: Favorito não encontrado
 */
router.delete('/favorites/:id', authenticateToken, transferController.removeFavorite);

module.exports = router;
