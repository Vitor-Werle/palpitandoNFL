const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');

/**
 * @swagger
 * tags:
 *   name: Palpites (CRUD Principal)
 *   description: Operações completas de Create, Read, Update e Delete para Palpites da NFL no PostgreSQL via Sequelize
 */

/**
 * @swagger
 * /api/predictions:
 *   get:
 *     summary: "[READ] Lista todos os palpites cadastrados (permite filtrar por userId, gameId ou week)"
 *     tags: [Palpites (CRUD Principal)]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filtrar palpites de um usuário específico
 *       - in: query
 *         name: gameId
 *         schema:
 *           type: integer
 *         description: Filtrar palpites de um jogo específico
 *       - in: query
 *         name: week
 *         schema:
 *           type: integer
 *         description: Filtrar palpites por semana da NFL
 *     responses:
 *       200:
 *         description: Lista de palpites retornada com sucesso
 */
router.get('/', predictionController.getAllPredictions);

/**
 * @swagger
 * /api/predictions/{id}:
 *   get:
 *     summary: "[READ] Consulta um palpite específico pelo seu ID"
 *     tags: [Palpites (CRUD Principal)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados do palpite
 *       404:
 *         description: Palpite não encontrado
 */
router.get('/:id', predictionController.getPredictionById);

/**
 * @swagger
 * /api/predictions:
 *   post:
 *     summary: "[CREATE] Cadastra um novo palpite de vencedor e placar exato (RN01 a RN06)"
 *     tags: [Palpites (CRUD Principal)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - gameId
 *               - predictedWinner
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               gameId:
 *                 type: integer
 *                 example: 1
 *               predictedWinner:
 *                 type: string
 *                 example: "KC"
 *               predictedHomeScore:
 *                 type: integer
 *                 example: 27
 *               predictedAwayScore:
 *                 type: integer
 *                 example: 24
 *               notes:
 *                 type: string
 *                 example: "Chiefs invictos em casa!"
 *     responses:
 *       201:
 *         description: Palpite criado com sucesso no PostgreSQL
 *       400:
 *         description: Regra de negócio violada (RN01/RN04/RN09)
 */
router.post('/', predictionController.createPrediction);

/**
 * @swagger
 * /api/predictions/{id}:
 *   put:
 *     summary: "[UPDATE] Atualiza o time vencedor, placar exato ou observação de um palpite existente (REQ 010)"
 *     tags: [Palpites (CRUD Principal)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               predictedWinner:
 *                 type: string
 *                 example: "BUF"
 *               predictedHomeScore:
 *                 type: integer
 *                 example: 21
 *               predictedAwayScore:
 *                 type: integer
 *                 example: 28
 *               notes:
 *                 type: string
 *                 example: "Mudança de palpite após boletim médico!"
 *     responses:
 *       200:
 *         description: Palpite atualizado com sucesso
 *       400:
 *         description: Jogo bloqueado para edição (< 2h antes do início)
 *       404:
 *         description: Palpite não encontrado
 */
router.put('/:id', predictionController.updatePrediction);

/**
 * @swagger
 * /api/predictions/{id}:
 *   delete:
 *     summary: "[DELETE] Exclui um palpite do banco de dados (REQ 010)"
 *     tags: [Palpites (CRUD Principal)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Palpite excluído com sucesso
 *       404:
 *         description: Palpite não encontrado
 */
router.delete('/:id', predictionController.deletePrediction);

module.exports = router;
