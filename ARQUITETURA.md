# 📐 ARQUITETURA - AssetFlow

**Data:** 28 de março de 2026  
**Versão:** 1.0

---

## 📋 INFORMAÇÕES GERAIS

### Nome do Sistema
**AssetFlow** - Sistema de Gestão de Ativos de TI

### Tema
Controle de Estoque / Gestão de Ativos de TI

Sistema para gerenciar computadores, equipamentos e suportes técnicos de uma empresa.

---

## 🎯 OBJETIVO E FUNCIONALIDADES

### Objetivo do Sistema
Gerenciar e controlar os ativos de TI de uma organização (computadores, periféricos, etc.), associar usuários aos ativos, registrar chamados técnicos e manter a integridade dos dados através de um sistema distribuído e escalável.

### Funcionalidades Principais

| Função | Descrição |
|--------|-----------|
| **Gestão de Usuários** | Cadastro, login com JWT, atualização e remoção de usuários |
| **Gestão de Ativos** | Criar, consultar, atualizar e deletar ativos de TI |
| **Gestão de Chamados** | Registrar e gerenciar tickets/chamados técnicos |
| **Autenticação** | Login com JWT no Gateway para segurança |
| **Sincronização** | Quando um usuário é deletado, seus ativos são automaticamente desvinculados via RabbitMQ |
| **API Gateway** | Centraliza todas as requisições dos clientes em um único ponto de entrada |

### Etapas/Fluxos do Projeto

```
1. Cliente acessa a interface do Frontend
   ↓
2. Frontend faz requisição para o Gateway Service
   ↓
3. Gateway valida autenticação (JWT) e roteia a requisição
   ↓
4. Serviço apropriado (Users/Assets/Tickets) processa a requisição
   ↓
5. Serviço consulta seu banco de dados isolado (PostgreSQL)
   ↓
6. Se houver alteração, um evento é publicado no RabbitMQ
   ↓
7. Outros serviços consomem o evento para sincronização
   ↓
8. Resposta retorna ao cliente
```

---

## 🛠️ TECNOLOGIAS

### Stack de Desenvolvimento

| Componente | Tecnologia | Versão |
|-----------|-----------|---------|
| **Linguagem** | JavaScript | - |
| **Runtime** | Node.js | 20 (Alpine) |
| **Framework Backend** | Express.js | - |
| **Frontend** | HTML5 + CSS3 + Vanilla JS | - |
| **Banco de Dados** | PostgreSQL | 16 (Alpine) |
| **Message Broker** | RabbitMQ | 3 (Management) |
| **Containerização** | Docker | Latest |
| **Orquestração** | Docker Compose | 3 |
| **Autenticação** | JWT | - |
| **Padrão Arquitetural** | Microserviços | - |

---

## 🏗️ ARQUITETURA DE MICROSERVIÇOS

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND SERVICE                             │
│                   (HTML/CSS/Vanilla JS)                          │
│                      Porta: 3000/80                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    HTTP/REST API
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GATEWAY SERVICE (API Gateway)                 │
│                    (Express + JWT Auth)                          │
│                        Porta: 3000                               │
│                                                                  │
│  Responsabilidades:                                             │
│  • Autenticação (POST /auth/register, /auth/login)             │
│  • CORS habilitado                                              │
│  • Roteia requisições para microserviços                        │
│  • Valida JWT em todas as requisições /api/*                   │
└────┬──────────────┬─────────────────┬──────────────────────────┘
     │              │                 │
     │ HTTP         │ HTTP            │ HTTP
     │              │                 │
     ▼              ▼                 ▼
┌─────────────┐  ┌──────────────┐  ┌────────────────┐
│ USERS       │  │ ASSETS       │  │ TICKETS        │
│ SERVICE     │  │ SERVICE      │  │ SERVICE        │
│             │  │              │  │                │
│ Porta: 3001 │  │ Porta: 3002  │  │ Porta: 3003    │
└────┬────────┘  └────┬─────────┘  └────┬───────────┘
     │                │                 │
     │ PostgreSQL     │ PostgreSQL       │ PostgreSQL
     │                │                 │
     ▼                ▼                 ▼
┌─────────────┐  ┌──────────────┐  ┌────────────────┐
│ users_db    │  │ assets_db    │  │ tickets_db     │
│ Port: 5433  │  │ Port: 5434   │  │ Port: 5435     │
│             │  │              │  │                │
│ users       │  │ assets       │  │ tickets        │
│ table       │  │ table        │  │ table          │
└─────────────┘  └──────────────┘  └────────────────┘

                    COMUNICAÇÃO ASSÍNCRONA
                             │
                    ┌────────▼────────┐
                    │   RabbitMQ      │
                    │  (Message Broker)
                    │ Porta: 5672     │
                    │ UI: 15672       │
                    └────────┬────────┘
                             │
                Eventos Publicados/Consumidos:
                • user.deleted
                • asset.updated
                • ticket.created
                          │
            ┌─────────────┼─────────────┐
            ▼             ▼             ▼
        Consumers (Assets, Tickets Services)
        Sincronização de dados entre serviços
```

---

## 📂 ESTRUTURA DE PASTAS

### Estrutura Geral do Projeto

```
distri/
├── README.md                          # Documentação principal
├── ARQUITETURA.md                     # Este arquivo
├── docker-compose.yml                 # Orquestração dos containers
│
├── gateway-service/                   # API Gateway
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── app.js                     # Configuração Express
│       ├── server.js                  # Inicializa servidor
│       ├── controllers/
│       │   ├── authController.js      # Lógica de autenticação
│       │   └── proxyController.js     # Roteamento para serviços
│       ├── middlewares/
│       │   └── authMiddleware.js      # Validação de JWT
│       ├── routes/
│       │   ├── authRoutes.js          # POST /auth/*
│       │   ├── userRoutes.js          # GET/POST/PUT/DELETE /api/users
│       │   ├── assetRoutes.js         # GET/POST/PUT/DELETE /api/assets
│       │   └── ticketRoutes.js        # GET/POST/PUT/DELETE /api/tickets
│       └── config/
│           └── routes.js              # Registro centralizado de rotas
│
├── users-service/                     # Microserviço de Usuários
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── app.js                     # Configuração Express
│       ├── server.js                  # Inicializa servidor
│       ├── controllers/
│       │   └── userController.js      # Lógica de negócio
│       ├── models/
│       │   └── userModel.js           # Acesso a dados (SQL)
│       ├── routes/
│       │   └── userRoutes.js          # Endpoints
│       └── config/
│           ├── db.js                  # Pool PostgreSQL
│           ├── rabbitmq.js            # Conexão com RabbitMQ
│           └── routes.js              # Registro de rotas
│
├── assets-service/                    # Microserviço de Ativos
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── controllers/
│       │   └── assetController.js
│       ├── models/
│       │   └── assetModel.js
│       ├── routes/
│       │   └── assetRoutes.js
│       ├── consumers/
│       │   └── userEventsConsumer.js  # Consome user.deleted
│       └── config/
│           ├── db.js
│           ├── rabbitmq.js
│           └── routes.js
│
├── tickets-service/                   # Microserviço de Chamados
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── controllers/
│       │   └── ticketController.js
│       ├── models/
│       │   └── ticketModel.js
│       ├── routes/
│       │   └── ticketRoutes.js
│       ├── consumers/
│       │   └── assetEventsConsumer.js
│       └── config/
│           ├── db.js
│           ├── rabbitmq.js
│           └── routes.js
│
└── frontend-service/                  # Interface Frontend
    ├── Dockerfile
    ├── package.json
    ├── server.js                      # Servidor Node para servir arquivos
    └── public/
        ├── index.html                 # Página principal
        ├── styles.css                 # Estilos da aplicação
        └── app.js                     # Lógica frontend (fetch API)
```

---

## 🔧 CONFIGURAÇÃO DOS SERVIÇOS

### 1. Gateway Service (API Gateway)

**Porta:** 3000  
**Responsabilidade:** Concentrar as chamadas em um único endpoint

#### Rotas Disponíveis

| Método | Rota | Autenticação | Descrição |
|--------|------|--------------|-----------|
| POST | `/auth/register` | ❌ | Registrar novo usuário |
| POST | `/auth/login` | ❌ | Login e gerar JWT |
| GET | `/api/users` | ✅ JWT | Listar todos os usuários |
| POST | `/api/users` | ✅ JWT | Criar novo usuário |
| PUT | `/api/users/:id` | ✅ JWT | Atualizar usuário |
| DELETE | `/api/users/:id` | ✅ JWT | Deletar usuário |
| GET | `/api/assets` | ✅ JWT | Listar todos os ativos |
| POST | `/api/assets` | ✅ JWT | Criar novo ativo |
| PUT | `/api/assets/:id` | ✅ JWT | Atualizar ativo |
| DELETE | `/api/assets/:id` | ✅ JWT | Deletar ativo |
| GET | `/api/tickets` | ✅ JWT | Listar todos os chamados |
| POST | `/api/tickets` | ✅ JWT | Criar novo chamado |
| PUT | `/api/tickets/:id` | ✅ JWT | Atualizar chamado |
| DELETE | `/api/tickets/:id` | ✅ JWT | Deletar chamado |

#### Middleware de Autenticação

```javascript
// Todos os endpoints /api/* requerem JWT válido
app.use("/api", authenticateToken);
```

---

### 2. Users Service (Microserviço de Usuários)

**Porta:** 3001  
**Banco:** `users_db` em `localhost:5433`

#### Endpoints

```
GET    /users           → Listar todos os usuários
POST   /users           → Criar novo usuário
PUT    /users/:id       → Atualizar usuário
DELETE /users/:id       → Deletar usuário
```

#### Modelo de Dados - Tabela `users`

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL DEFAULT ''
)
```

#### Operações Principais

- **getAllUsers()** - Retorna todos os usuários
- **createUser(data)** - Cria novo usuário
- **updateUser(id, data)** - Atualiza usuário existente
- **deleteUser(id)** - Remove usuário do banco
- **findUserByEmail(email)** - Busca usuário para autenticação

---

### 3. Assets Service (Microserviço de Ativos)

**Porta:** 3002  
**Banco:** `assets_db` em `localhost:5434`

#### Endpoints

```
GET    /assets           → Listar todos os ativos
POST   /assets           → Criar novo ativo
PUT    /assets/:id       → Atualizar ativo
DELETE /assets/:id       → Deletar ativo
```

#### Modelo de Dados - Tabela `assets`

```sql
CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  owner_id INTEGER,
  status VARCHAR(50) DEFAULT 'active'
)
```

#### Consumer de Eventos

**Evento:** `user.deleted`  
**Ação:** Desvincula automaticamente ativos do usuário deletado

```javascript
// Reage a remocao de usuarios para evitar ativos 
// apontando para donos inexistentes
await subscribeToEvent("assets-service.user.deleted", 
  "user.deleted", 
  async (user) => {
    const impactedAssets = await assetModel.unassignAssetsFromUser(user.id);
    console.log(`${impactedAssets.length} ativo(s) atualizado(s)`);
  }
);
```

---

### 4. Tickets Service (Microserviço de Chamados)

**Porta:** 3003  
**Banco:** `tickets_db` em `localhost:5435`

#### Endpoints

```
GET    /tickets           → Listar todos os chamados
POST   /tickets           → Criar novo chamado
PUT    /tickets/:id       → Atualizar chamado
DELETE /tickets/:id       → Deletar chamado
```

#### Modelo de Dados - Tabela `tickets`

```sql
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  asset_id INTEGER,
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### Consumer de Eventos

**Evento:** `asset.updated`  
**Ação:** Reage a atualizações de ativos

---

### 5. Frontend Service

**Porta:** 3000/80  
**Tecnologia:** HTML5 + CSS3 + Vanilla JavaScript

#### Estrutura

```
public/
├── index.html  → Interface principal
├── styles.css  → Estilos CSS
└── app.js      → Lógica frontend (fetch API calls)
```

#### Fluxo de Client-Side

1. Usuário interage com interface
2. JavaScript faz requisição para o Gateway (`/api/*` ou `/auth/*`)
3. Resposta é processada e interface é atualizada

---

## 🔌 COMUNICAÇÃO ENTRE SERVIÇOS

### Síncrona (REST API via Gateway)

```
Cliente → Gateway → Serviço específico → Banco de dados
```

**Exemplo:** GET `/api/users` retorna lista de usuários

### Assíncrona (RabbitMQ)

```
Serviço A (publica evento) → RabbitMQ (fila de eventos)
                                          ↓
                          Serviço B (consome evento)
                          Serviço C (consome evento)
```

#### Eventos Implementados

| Evento | Publicador | Consumidor | Ação |
|--------|-----------|-----------|------|
| `user.deleted` | Users Service | Assets Service | Desvincula ativos do usuário |
| `asset.updated` | Assets Service | Tickets Service | Sincroniza dados de ativo |

#### Exemplo de Fluxo de Evento

```
1. DELETE /api/users/5 (via Gateway)
   ↓
2. Users Service remove usuário do banco
   ↓
3. Users Service publica evento "user.deleted" com dados do usuário
   ↓
4. RabbitMQ recebe evento na fila
   ↓
5. Assets Service consome evento
   ↓
6. Assets Service encontra todos os ativos com owner_id = 5
   ↓
7. Assets são atualizados para owner_id = NULL
   ↓
8. Resposta retorna ao cliente
```

---

## 📊 FLUXOS PRINCIPAIS

### Fluxo 1: Registro e Login

```
Frontend                Gateway               Users Service
   │                       │                        │
   ├─ POST /auth/register─→│                        │
   │                       ├─ Validação ────────────│
   │                       │                        ├─ Insere usuário
   │                       │                        │  no banco
   │                       │← JWT (sucesso) ───────│
   │← Resposta + JWT ──────│
```

### Fluxo 2: Criar Ativo e Desvinculação Automática

```
Frontend               Gateway            Assets Service       RabbitMQ
   │                     │                      │                 │
   ├─ POST /api/assets──→│                      │                 │
   │                     ├─ Valida JWT ──────────│                 │
   │                     │                      ├─ Insere ativo    │
   │                     │                      │   no banco       │
   │                     │← Sucesso ───────────│                 │
   │← ID do ativo ───────│
   │
   │ [Após deletar usuário]
   │
   ├─ DELETE /api/users/1→│
   │                     ├─ Roteia para Users──→│ (outro fluxo)
   │                     │
   │                                            ├─ Publica evento
   │                                            │  "user.deleted"
   │                                            └──────────────→│
   │                                                      ├─ Fila
   │                                      ┌──────────────│
   │                                      ← Consume evento
   │                                      ├─ Atualiza ativos
   │                                      │  sem owner_id
```

### Fluxo 3: Requisição Autenticada

```
Frontend                   Gateway              Microserviço
   │                          │                    │
   ├─ GET /api/users ─────────│                    │
   │  (com JWT header)         │                    │
   │                      ├─ Valida JWT            │
   │                      │   (middleware)         │
   │                      ├─ Roteia para users────→│
   │                      │                   ├─ Query banco
   │                      │← Usuários ────────────│
   │← Users JSON ─────────│
```

---

## 🚀 BENEFÍCIOS DA ARQUITETURA

### ✅ Escalabilidade
- Cada microserviço pode escalar independentemente
- Banco de dados isolado por serviço
- Suporta crescimento sem afetar outros componentes

### ✅ Tolerância a Falhas
- Falha em um serviço não afeta os outros
- RabbitMQ mantém fila de eventos mesmo com falhas
- Retry automático em consumers

### ✅ Separação de Responsabilidades
- Cada serviço tem seu domínio específico
- Gateway centraliza lógica de autenticação e roteamento
- Código mais organizado e manutenível

### ✅ Bancos de Dados Isolados
- Cada serviço tem seu PostgreSQL
- Evita acoplamento de dados
- Facilita migrations e backups independentes

### ✅ Comunicação Assíncrona
- RabbitMQ para eventos entre serviços
- Reduz latência de requisições
- Sincronização eventual de dados

### ✅ Fácil Deployment
- Docker Compose orquestra todos os containers
- Mesmo ambiente em dev e produção
- Escalável para Kubernetes no futuro

---

## 🐳 DOCKER COMPOSE - VISÃO GERAL

### Serviços Orquestrados

```yaml
Services:
├── rabbitmq              (Message Broker)
├── users-db             (PostgreSQL)
├── users-service        (Microserviço)
├── assets-db            (PostgreSQL)
├── assets-service       (Microserviço)
├── tickets-db           (PostgreSQL)
├── tickets-service      (Microserviço)
├── gateway-service      (API Gateway)
└── frontend-service     (Frontend)
```

### Volumes Persistentes

```
users_data    → /var/lib/postgresql/data (users-db)
assets_data   → /var/lib/postgresql/data (assets-db)
tickets_data  → /var/lib/postgresql/data (tickets-db)
```

### Network

Todos os serviços estão na mesma rede Docker, permitindo comunicação interna:

```
assetflow-network
├── rabbitmq (interno: rabbitmq:5672)
├── users-db (interno: users-db:5432)
├── users-service (interno: users-service:3001)
├── assets-db (interno: assets-db:5432)
├── assets-service (interno: assets-service:3002)
├── tickets-db (interno: tickets-db:5432)
├── tickets-service (interno: tickets-service:3003)
├── gateway-service (interno: gateway-service:3000)
└── frontend-service (interno: frontend-service:3000)
```

---

## 📋 VARIÁVEIS DE AMBIENTE

### Gateway Service

```env
PORT=3000
```

### Users Service

```env
PORT=3001
DB_HOST=users-db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=users_db
RABBITMQ_URL=amqp://rabbitmq:5672
```

### Assets Service

```env
PORT=3002
DB_HOST=assets-db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=assets_db
RABBITMQ_URL=amqp://rabbitmq:5672
```

### Tickets Service

```env
PORT=3003
DB_HOST=tickets-db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=tickets_db
RABBITMQ_URL=amqp://rabbitmq:5672
```

---

## 🔐 SEGURANÇA

### Autenticação JWT

- **Local:** Gateway Service (`authController.js`)
- **Middleware:** `authMiddleware.js` valida token em `/api/*`
- **Token:** Enviado no header `Authorization: Bearer <token>`

### CORS

Gateway permite requisições de qualquer origem:

```javascript
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
```

### Banco de Dados

- Credenciais configuradas via `.env` no Docker Compose
- Conexão via TCP dentro da rede Docker
- Senhas padrão (deve-se alterar em produção)

---

## 🧪 COMO TESTAR

### 1. Iniciar os Serviços

```bash
docker compose up --build
```

### 2. Registrar Usuário

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João","email":"joao@example.com","password":"123456"}'
```

### 3. Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@example.com","password":"123456"}'
```

**Resposta:** JWT token

### 4. Usar o Token em Requisições Autenticadas

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <seu_token_aqui>"
```

### 5. Acessar Frontend

```
http://localhost:3000
```

---

## 📈 PRÓXIMOS PASSOS / MELHORIAS FUTURAS

- [ ] Adicionar validação de entrada em todos os endpoints
- [ ] Implementar rate limiting no Gateway
- [ ] Adicionar logs centralizados (ELK Stack)
- [ ] Implementar tracing distribuído (Jaeger)
- [ ] Adicionar testes automatizados (Jest, Supertest)
- [ ] Utilizar Kubernetes para orquestração em produção
- [ ] Implementar circuit breaker entre serviços
- [ ] Adicionar documentação Swagger/OpenAPI
- [ ] Implementar cache distribuído (Redis)
- [ ] Adicionar monitoramento (Prometheus + Grafana)

---

## 📚 REFERÊNCIAS

- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [Docker Documentation](https://docs.docker.com/)
- [JWT Introduction](https://jwt.io/introduction)
- [Microservices Patterns](https://microservices.io/patterns/index.html)

---

**Documento criado em:** 28 de março de 2026  
**Versão:** 1.0  
**Status:** ✅ Completo
