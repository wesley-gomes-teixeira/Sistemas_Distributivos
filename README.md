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
  - `viewer`: acesso somente leitura
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
