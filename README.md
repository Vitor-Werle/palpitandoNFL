# 🏈 Palpitando NFL - Plataforma Web de Palpites e Ranking da NFL

Aplicação Web Full-Stack desenvolvida para a disciplina de **Engenharia de Software (2º Ano)**, contemplando **React (JavaScript)** no Front-end e **Node.js + Express + MVC + Sequelize ORM + PostgreSQL + Swagger + Promises** no Back-end.

---

## 📂 Estrutura e Organização do Repositório

O repositório está organizado com separação clara entre **Back-end** e **Front-end**, mantendo cada aplicação em sua própria pasta e ambiente:

```text
PalpitandoNFL/
├── backend/                  # API RESTful em Node.js + Express (Padrão MVC + Sequelize ORM)
│   ├── src/
│   │   ├── config/           # Configuração do PostgreSQL (Sequelize) e documentação Swagger
│   │   ├── models/           # Models do Sequelize (User, Game, Prediction) e relacionamentos
│   │   ├── controllers/      # Controllers MVC (predictionController, gameController, userController)
│   │   ├── routes/           # Rotas da API com anotações Swagger OpenAPI 3.0
│   │   ├── seeders/          # Dados iniciais da NFL (Jogos da Semana 10, Usuários e Palpites)
│   │   └── app.js            # Configuração principal do Express e middlewares
│   ├── server.js             # Inicialização do servidor e sincronização do banco de dados
│   ├── .env.example          # Exemplo de variáveis de ambiente do banco PostgreSQL
│   └── package.json          # Dependências do Back-end
│
├── frontend/                 # Aplicação SPA em React + Vite (JavaScript puro, sem TypeScript)
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis (Navbar, GameCard, Modal de Edição/Exclusão)
│   │   ├── pages/            # Views/Páginas da aplicação (Jogos, CRUD de Palpites, Ranking, Perfil)
│   │   ├── services/         # Cliente HTTP (Fetch + Promises) para comunicação com o Back-end
│   │   ├── App.jsx           # Gerenciamento de estado e navegação principal
│   │   └── App.css           # Estilização responsiva e acessível (WCAG AA)
│   ├── index.html            # Documento raiz HTML5
│   └── package.json          # Dependências do Front-end
│
├── .gitignore                # Arquivos ignorados pelo Git
└── README.md                 # Documentação completa do projeto e guia de avaliação
```

---

## 🛠️ Tecnologias Utilizadas

### Back-end (`backend/`)
- **JavaScript (ES6+)** com uso explícito de **Promises** (`.then()` / `.catch()` e `new Promise`)
- **Node.js & Express**: Servidor HTTP e roteamento RESTful
- **Arquitetura MVC**: Separação em `models/`, `controllers/` e `routes/` (com o Front-end atuando como `View`)
- **Sequelize ORM & PostgreSQL (`pg`)**: Mapeamento objeto-relacional e persistência relacional no PostgreSQL
- **Swagger (`swagger-jsdoc` & `swagger-ui-express`)**: Documentação interativa da API em `/api-docs`
- **Bcryptjs**: Hash seguro de senhas (RNF 004)

### Front-end (`frontend/`)
- **React 18 (JavaScript `.jsx`)** + **Vite** (Sem TypeScript, conforme especificação)
- **Consumo de API com Promises**: Comunicação assíncrona com feedback visual em tempo real (RNF 007)
- **Design Responsivo e Acessível**: Tabelas adaptativas e modais nativos `<dialog>` (RNF 010 e RNF 011)

---

## ⚙️ Pré-requisitos e Execução

1. **Node.js** (v18+)
2. **PostgreSQL** (rodando localmente na porta `5432`, banco `palpitando_nfl`)

### 1️⃣ Como executar o Back-end

```bash
cd backend
npm install
npm start
```
- O servidor iniciará em: `http://localhost:3001`
- A documentação **Swagger** estará disponível em: `http://localhost:3001/api-docs`
- Ao iniciar, o Sequelize sincronizará as tabelas automaticamente no PostgreSQL (`palpitando_nfl`) e populará os dados iniciais caso o banco esteja vazio.

### 2️⃣ Como executar o Front-end

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```
- A interface React abrirá em: `http://localhost:5173`

---

## ✅ Roteiro de Demonstração do CRUD na Avaliação

Na aba **"Meus Palpites (CRUD)"** e **"Rodada da NFL"**, todas as 4 operações do CRUD são executadas pela interface do Front-end e refletidas diretamente no PostgreSQL via Sequelize:

1. **Create (Cadastrar - 0,5 pt)**:
   - Selecione uma partida aberta da NFL, escolha o **Time Vencedor** (RN04) e informe o **Placar Exato Estimado** (RN05), além de uma observação/confiança opcional, e clique em **"Cadastrar Palpite"**.
2. **Read (Consultar/Listar - 0,5 pt)**:
   - Visualize todos os palpites cadastrados na tabela de **"Meus Palpites (CRUD)"**, bem como a porcentagem da comunidade nos jogos (REQ 011) e a tabela de **Ranking Geral / por UF / por Time Favorito** (REQ 014).
3. **Update (Alterar - 0,5 pt)**:
   - Na lista de palpites cadastrados, clique no botão **"Editar"** de um registro, altere o time vencedor ou o placar exato previsto no modal e salve a atualização (respeitando a regra RN01/RN09 de 2 horas antes do jogo).
4. **Delete (Excluir - 0,5 pt)**:
   - Na lista de palpites cadastrados, clique no botão **"Excluir"** de um registro e confirme a exclusão no modal para removê-lo do banco de dados PostgreSQL.

> **Dica para a apresentação**: Na aba de Jogos/Simulação, também é possível finalizar um jogo ou cadastrar uma nova partida de teste para demonstrar o cálculo automático de pontos no Ranking (+1 ponto por vencedor correto, -1 ponto por erro, +3 pontos bônus por placar exato conforme RN02, RN02.1 e RN06)!
