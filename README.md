# AssetFlow Microservices

Projeto backend simples em Node.js com Express para um sistema de gestao de ativos de TI, organizado em microsservicos com um banco PostgreSQL separado para cada servico.

## Estrutura do projeto

```text
users-service/
  src/
    controllers/
    routes/
    models/
    config/
    app.js
    server.js

assets-service/
  src/
    controllers/
    routes/
    models/
    config/
    app.js
    server.js

tickets-service/
  src/
    controllers/
    routes/
    models/
    config/
    app.js
    server.js

gateway-service/
  src/
    controllers/
    routes/
    config/
    app.js
    server.js

frontend-service/
  public/
    index.html
    styles.css
    app.js
  server.js

rabbitmq
  broker de eventos para comunicacao assicrona entre microsservicos
```

## Microsservicos

### Users Service

- Porta: `3001`
- Banco: `users_db` em `localhost:5433`
- Rotas:
  - `GET /users`
  - `POST /users`
  - `PUT /users/:id`
  - `DELETE /users/:id`

### Assets Service

- Porta: `3002`
- Banco: `assets_db` em `localhost:5434`
- Rotas:
  - `GET /assets`
  - `POST /assets`
  - `PUT /assets/:id`
  - `DELETE /assets/:id`

### Tickets Service

- Porta: `3003`
- Banco: `tickets_db` em `localhost:5435`
- Rotas:
  - `GET /tickets`
  - `POST /tickets`
  - `PUT /tickets/:id`
  - `DELETE /tickets/:id`

### Gateway Service

- Porta: `3000`
- Funcao: concentrar as chamadas em um unico endpoint
- Autenticacao: login e cadastro com JWT
- Autorizacao:
  - `admin`: CRUD completo de usuarios, ativos e chamados
  - `analyst`: leitura de usuarios e CRUD de ativos/chamados
  - `user`: acesso somente leitura
- Rotas:
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /api/users`
  - `POST /api/users`
  - `PUT /api/users/:id`
  - `DELETE /api/users/:id`
  - `GET /api/assets`
  - `POST /api/assets`
  - `PUT /api/assets/:id`
  - `DELETE /api/assets/:id`
  - `GET /api/tickets`
  - `POST /api/tickets`
  - `PUT /api/tickets/:id`
  - `DELETE /api/tickets/:id`

### Frontend Service

- Porta: `8080`
- Funcao: interface web simples para cadastrar, editar, listar e remover usuarios, ativos e chamados

### RabbitMQ

- Porta AMQP: `5672`
- Painel de gerenciamento: `15672`
- Funcao: transportar eventos entre os microsservicos

### Adminer Service

- Porta: `8081`
- Funcao: visualizar os bancos PostgreSQL pelo navegador

## Como rodar com Docker

O projeto agora possui um [docker-compose.yml](C:\Users\wesle\OneDrive\Documentos\Pessoal\Dev\distri\docker-compose.yml) que sobe os tres microsservicos e os tres bancos juntos.

```bash
docker compose up --build
```

Depois disso, as APIs ficam disponiveis em:

- `http://localhost:3000/api/users`
- `http://localhost:3000/api/assets`
- `http://localhost:3000/api/tickets`

E o frontend fica disponivel em:

- `http://localhost:8080`

E o Adminer fica disponivel em:

- `http://localhost:8081`

E o painel do RabbitMQ fica disponivel em:

- `http://localhost:15672`

Credenciais padrao do painel:

- Usuario: `guest`
- Senha: `guest`

Para entrar no Adminer, use:

- Sistema: `PostgreSQL`
- Servidor:
  - `users-db` para `users_db`
  - `assets-db` para `assets_db`
  - `tickets-db` para `tickets_db`
- Usuario: `postgres`
- Senha: `postgres`
- Banco:
  - `users_db`
  - `assets_db`
  - `tickets_db`

## Como rodar sem Docker

Cada microsservico possui seu proprio `package.json`, entao a instalacao continua separada. Tambem e preciso ter tres bancos PostgreSQL em execucao e configurar as variaveis `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME`.

### 1. Users Service

```bash
cd users-service
npm install
node src/server.js
```

### 2. Assets Service

```bash
cd assets-service
npm install
node src/server.js
```

### 3. Tickets Service

```bash
cd tickets-service
npm install
node src/server.js
```

### 4. Gateway Service

```bash
cd gateway-service
npm install
node src/server.js
```

### 5. Frontend Service

```bash
cd frontend-service
npm install
node server.js
```

## Observacoes

- Todos os microsservicos usam `express.json()` para entrada e saida em JSON.
- Cada servico tem seu proprio banco PostgreSQL.
- As tabelas sao criadas automaticamente na inicializacao de cada microsservico.
- O frontend consome o gateway, e o gateway encaminha as requisicoes para os microsservicos corretos.
- O acesso ao frontend agora usa autenticacao real via `gateway-service`, com token JWT protegendo as rotas `/api`.
- O gateway aplica regras de negocio entre dominios, como validacao de status, verificacao de vinculos e confirmacao de exclusoes com impacto.
- O RabbitMQ e usado para comunicacao assincrona entre os servicos por meio do exchange `assetflow.events`.
- Quando um usuario e removido, o `assets-service` recebe o evento e desvincula os ativos afetados.
- Quando um ativo e removido, o `tickets-service` recebe o evento e atualiza os chamados impactados.
- O frontend passou a oferecer filtros, busca textual e comportamento adaptado ao perfil autenticado.
- Cada servico e independente, ideal para aprendizado e apresentacao academica.

## CI/CD com GitHub Actions

O projeto possui workflows em `.github/workflows` para automatizar validacao e entrega:

- `ci.yml`: instala dependencias, compila os cinco servicos em TypeScript e executa `docker compose build`.
- `cd.yml`: em pushes para `main` ou `master`, gera e publica as imagens Docker no `GitHub Container Registry (ghcr.io)`.

As imagens publicadas seguem este padrao:

- `ghcr.io/<owner>/assetflow-users-service`
- `ghcr.io/<owner>/assetflow-assets-service`
- `ghcr.io/<owner>/assetflow-tickets-service`
- `ghcr.io/<owner>/assetflow-gateway-service`
- `ghcr.io/<owner>/assetflow-frontend-service`

Cada imagem recebe as tags:

- `latest`
- `sha-<commit>`

O workflow de CD usa o `GITHUB_TOKEN` do proprio GitHub Actions para publicar no GHCR.

## Deploy no Railway

Este repositorio e um monorepo. Cada servico precisa ser criado separadamente no Railway com seu proprio diretório raiz.

### Servicos de aplicacao

- `frontend-service`
  - `Root Directory`: `frontend-service`
  - `Dockerfile Path`: `Dockerfile`
- `gateway-service`
  - `Root Directory`: `gateway-service`
  - `Dockerfile Path`: `Dockerfile`
- `users-service`
  - `Root Directory`: `users-service`
  - `Dockerfile Path`: `Dockerfile`
- `assets-service`
  - `Root Directory`: `assets-service`
  - `Dockerfile Path`: `Dockerfile`
- `tickets-service`
  - `Root Directory`: `tickets-service`
  - `Dockerfile Path`: `Dockerfile`

Nao aponte um servico para a raiz do repositorio (`/`). O Railpack nao encontra um aplicativo executavel ali.

### Bancos e broker

Crie tambem:

- `users-db`
- `assets-db`
- `tickets-db`
- `rabbitmq`

### Variaveis de ambiente

`users-service`

- `PORT=3001`
- `DB_HOST=<host do users-db>`
- `DB_PORT=<porta do users-db>`
- `DB_USER=<usuario do users-db>`
- `DB_PASSWORD=<senha do users-db>`
- `DB_NAME=users_db`
- `RABBITMQ_URL=<url AMQP do rabbitmq>`

`assets-service`

- `PORT=3002`
- `DB_HOST=<host do assets-db>`
- `DB_PORT=<porta do assets-db>`
- `DB_USER=<usuario do assets-db>`
- `DB_PASSWORD=<senha do assets-db>`
- `DB_NAME=assets_db`
- `RABBITMQ_URL=<url AMQP do rabbitmq>`

`tickets-service`

- `PORT=3003`
- `DB_HOST=<host do tickets-db>`
- `DB_PORT=<porta do tickets-db>`
- `DB_USER=<usuario do tickets-db>`
- `DB_PASSWORD=<senha do tickets-db>`
- `DB_NAME=tickets_db`
- `RABBITMQ_URL=<url AMQP do rabbitmq>`

`gateway-service`

- `PORT=3000`
- `JWT_SECRET=<segredo forte>`
- `USERS_SERVICE_URL=<url interna do users-service>`
- `ASSETS_SERVICE_URL=<url interna do assets-service>`
- `TICKETS_SERVICE_URL=<url interna do tickets-service>`

`frontend-service`

- `PORT=8080`
- `GATEWAY_BASE_URL=https://<dominio-publico-do-gateway>/api`
- `AUTH_BASE_URL=https://<dominio-publico-do-gateway>/auth`

O frontend agora le essas URLs em tempo de execucao por meio de `/config.js`, entao voce pode usar a mesma imagem localmente e no Railway sem editar o codigo a cada deploy.
