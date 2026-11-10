const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

/**
 * @swagger
 * tags:
 *   name: Jogos da NFL
 *   description: Gestão de jogos da rodada, placares oficiais, estádios, boletim de lesões e sincronização com a NFL
 */

/**
 * @swagger
 * /api/games:
 *   get:
 *     summary: "[READ] Lista os confrontos da rodada com porcentagem de votos da comunidade (REQ 006, REQ 011, REQ 018)"
 *     tags: [Jogos da NFL]
 *     parameters:
 *       - in: query
 *         name: week
 *         schema:
 *           type: integer
 *         description: Semana da temporada da NFL
 *     responses:
 *       200:
 *         description: Lista de jogos com estatísticas de tendência de palpites
 */
router.get('/', gameController.getAllGames);

/**
 * @swagger
 * /api/games:
 *   post:
 *     summary: "[CREATE] Cadastra um novo jogo na rodada da NFL"
 *     tags: [Jogos da NFL]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Game'
 *     responses:
 *       201:
 *         description: Partida criada com sucesso
 */
router.post('/', gameController.createGame);

/**
 * @swagger
 * /api/games/sync:
 *   post:
 *     summary: "[SYNC] Sincroniza automaticamente confrontos da rodada via feed da API da NFL (REQ 007)"
 *     tags: [Jogos da NFL]
 *     responses:
 *       200:
 *         description: Jogos sincronizados com sucesso
 */
router.post('/sync', gameController.syncGamesFromNflApi);

/**
 * @swagger
 * /api/games/{id}:
 *   put:
 *     summary: "[UPDATE] Atualiza placar final ou status da partida e recalcula automaticamente o Ranking (RN14)"
 *     tags: [Jogos da NFL]
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
 *             $ref: '#/components/schemas/Game'
 *     responses:
 *       200:
 *         description: Jogo atualizado e pontos recalculados
 */
router.put('/:id', gameController.updateGame);

/**
 * @swagger
 * /api/games/{id}:
 *   delete:
 *     summary: "[DELETE] Exclui uma partida e recalcula o ranking"
 *     tags: [Jogos da NFL]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jogo excluído com sucesso
 */
router.delete('/:id', gameController.deleteGame);

module.exports = router;
