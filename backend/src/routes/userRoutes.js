const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
 * @swagger
 * tags:
 *   name: Usuários e Ranking
 *   description: Cadastro, Login (e-mail/senha), Perfil, Estatísticas e Ranking Geral/UF/Time (RN11 a RN22)
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: "[READ] Lista todos os usuários cadastrados"
 *     tags: [Usuários e Ranking]
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
router.get('/', userController.getAllUsers);

/**
 * @swagger
 * /api/users/ranking:
 *   get:
 *     summary: "[READ] Consulta o Ranking Oficial (Top 100) com filtros por Estado (UF) e Time Favorito (REQ 014, RN12, RN13)"
 *     tags: [Usuários e Ranking]
 *     parameters:
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filtrar por sigla da UF (ex. SP, RJ, MG)
 *       - in: query
 *         name: favoriteTeam
 *         schema:
 *           type: string
 *         description: Filtrar por sigla do time favorito da NFL (ex. KC, SF, GB)
 *     responses:
 *       200:
 *         description: Ranking ordenado por pontuação
 */
router.get('/ranking', userController.getRanking);

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: "[CREATE] Cadastra um novo usuário com validação de unicidade e senha criptografada (REQ 002, RN16, RN17, RN22)"
 *     tags: [Usuários e Ranking]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - state
 *               - favoriteTeam
 *             properties:
 *               username:
 *                 type: string
 *                 example: "novo_torcedor"
 *               email:
 *                 type: string
 *                 example: "torcedor@nfl.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *               state:
 *                 type: string
 *                 example: "SP"
 *               favoriteTeam:
 *                 type: string
 *                 example: "KC"
 *     responses:
 *       201:
 *         description: Conta criada com sucesso
 */
router.post('/register', userController.registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: "[AUTH] Autentica um usuário por e-mail e senha (REQ 001, RN20)"
 *     tags: [Usuários e Ranking]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "vitor@nfl.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Autenticado com sucesso
 */
router.post('/login', userController.loginUser);

/**
 * @swagger
 * /api/users/{id}/stats:
 *   get:
 *     summary: "[READ] Obtém estatísticas consolidadas e aproveitamento de palpites do usuário (REQ 015, RN18)"
 *     tags: [Usuários e Ranking]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Métricas de aproveitamento do usuário
 */
router.get('/:id/stats', userController.getUserStats);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: "[UPDATE] Atualiza dados do perfil do usuário (REQ 017)"
 *     tags: [Usuários e Ranking]
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
 *               username:
 *                 type: string
 *               state:
 *                 type: string
 *               favoriteTeam:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 */
router.put('/:id', userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: "[DELETE] Exclui a conta do usuário e seus palpites (RNF 005 - LGPD)"
 *     tags: [Usuários e Ranking]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conta excluída com sucesso
 */
router.delete('/:id', userController.deleteUser);

module.exports = router;
