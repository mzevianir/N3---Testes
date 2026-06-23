# API RESTful de Tarefas

Back-end da aplicação acadêmica de gerenciamento de tarefas. A API foi construída com Node.js, TypeScript, Express, Prisma e PostgreSQL hospedado no Supabase.

O projeto disponibiliza os cinco endpoints obrigatórios do trabalho:

- listagem paginada;
- consulta por ID;
- criação;
- atualização;
- exclusão.

## Tecnologias

- Node.js
- TypeScript
- Express
- Prisma ORM
- PostgreSQL
- Supabase
- CORS
- dotenv

## Pré-requisitos

Antes de executar o projeto, instale:

- Node.js 20 ou superior;
- npm;
- uma conta e um projeto no Supabase.

## Estrutura do projeto

```text
backend-tarefas-reaproveitavel/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── controllers/
│   │   └── tarefaController.ts
│   ├── database/
│   │   └── prisma.ts
│   ├── dtos/
│   │   └── tarefaDTO.ts
│   ├── errors/
│   │   └── AppError.ts
│   ├── middlewares/
│   │   └── errorHandler.ts
│   ├── repositories/
│   │   └── tarefaRepository.ts
│   ├── routes/
│   │   └── tarefaRoutes.ts
│   ├── services/
│   │   └── tarefaService.ts
│   ├── app.ts
│   └── server.ts
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
```

## Arquitetura

O projeto utiliza separação em camadas:

- **Routes:** define os caminhos e métodos HTTP;
- **Controller:** recebe a requisição e devolve a resposta HTTP;
- **Service:** contém validações e regras de negócio;
- **Repository:** realiza as operações no banco de dados;
- **DTO:** define os formatos de entrada e saída;
- **Middleware:** centraliza o tratamento de erros.

Fluxo principal:

```text
Requisição → Route → Controller → Service → Repository → Prisma → Supabase
```

## Entidade Tarefa

| Campo | Tipo | Obrigatório | Observação |
|---|---|---:|---|
| `id` | inteiro | automático | Chave primária |
| `titulo` | texto | sim | Entre 3 e 100 caracteres |
| `descricao` | texto | não | Máximo de 500 caracteres |
| `status` | enum | não no POST | Padrão: `PENDENTE` |
| `prioridade` | enum | não no POST | Padrão: `MEDIA` |
| `dataLimite` | data e hora | não | Aceita valor nulo |
| `criadaEm` | data e hora | automático | Preenchido pelo banco |
| `atualizadaEm` | data e hora | automático | Atualizado pelo Prisma |

### Valores aceitos para status

```text
PENDENTE
EM_ANDAMENTO
CONCLUIDA
```

### Valores aceitos para prioridade

```text
BAIXA
MEDIA
ALTA
```

## Configuração do Supabase

No painel do Supabase, acesse **Connect → ORMs → Prisma** e copie as strings de conexão.

Crie um arquivo `.env` na raiz do projeto com o seguinte formato:

```env
DATABASE_URL="postgresql://postgres.SEU_PROJECT_REF:SUA_SENHA@HOST_POOLER:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.SEU_PROJECT_REF:SUA_SENHA@HOST_POOLER:5432/postgres"
PORT=3000
```

- `DATABASE_URL` é usada pela aplicação durante a execução;
- `DIRECT_URL` é usada pelo Prisma para migrations;
- o arquivo `.env` não deve ser enviado para o Git.

No `prisma/schema.prisma`, o datasource deve usar essas variáveis:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## Instalação

Na raiz do projeto, execute:

```bash
npm install
```

Valide o schema:

```bash
npx prisma validate
```

Gere o Prisma Client:

```bash
npx prisma generate
```

Aplique as migrations:

```bash
npx prisma migrate dev --name init
```

Caso o banco já esteja configurado e a migration já tenha sido aplicada, não é necessário criar outra migration com o mesmo nome.

## Execução

Modo de desenvolvimento:

```bash
npm run dev
```

A API será iniciada em:

```text
http://localhost:3000
```

Verificação rápida:

```http
GET http://localhost:3000/health
```

Resposta esperada:

```json
{
  "status": "ok"
}
```

## Endpoints

### Listar tarefas com paginação

```http
GET /api/tarefas?page=1&limit=10
```

Parâmetros:

| Parâmetro | Padrão | Regra |
|---|---:|---|
| `page` | 1 | Inteiro maior ou igual a 1 |
| `limit` | 10 | Inteiro entre 1 e 100 |

Exemplo de resposta:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

### Buscar tarefa por ID

```http
GET /api/tarefas/1
```

Resposta de sucesso: `200 OK`.

Quando a tarefa não existe:

```json
{
  "success": false,
  "message": "Tarefa não encontrada."
}
```

Código: `404 Not Found`.

### Criar tarefa

```http
POST /api/tarefas
Content-Type: application/json
```

Corpo:

```json
{
  "titulo": "Documentar a API",
  "descricao": "Criar a documentação OpenAPI",
  "status": "PENDENTE",
  "prioridade": "ALTA",
  "dataLimite": "2026-07-15"
}
```

Resposta de sucesso: `201 Created`.

### Atualizar tarefa

```http
PUT /api/tarefas/1
Content-Type: application/json
```

Como o endpoint usa `PUT`, os campos `titulo`, `status` e `prioridade` devem ser enviados.

```json
{
  "titulo": "Documentar e revisar a API",
  "descricao": "Finalizar a documentação OpenAPI",
  "status": "EM_ANDAMENTO",
  "prioridade": "ALTA",
  "dataLimite": "2026-07-20"
}
```

Resposta de sucesso: `200 OK`.

### Excluir tarefa

```http
DELETE /api/tarefas/1
```

Resposta de sucesso: `204 No Content`.

A exclusão é física: o registro é removido do banco.

## Códigos HTTP

| Código | Uso |
|---:|---|
| `200` | Consulta ou atualização realizada com sucesso |
| `201` | Tarefa criada com sucesso |
| `204` | Tarefa excluída com sucesso |
| `400` | Dados, parâmetros ou ID inválidos |
| `404` | Tarefa não encontrada |
| `500` | Erro interno inesperado |

## Padrão de respostas

Sucesso:

```json
{
  "success": true,
  "message": "Operação realizada com sucesso.",
  "data": {}
}
```

Erro:

```json
{
  "success": false,
  "message": "Descrição do erro."
}
```

## Scripts disponíveis

```bash
npm run dev
npm run build
npm start
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

O Prisma Studio permite visualizar os registros do banco:

```bash
npm run prisma:studio
```

## Seed de dados

Seed é um script que insere registros iniciais no banco, por exemplo, cinco tarefas prontas para demonstração.

Ela **não é exigida pelo enunciado do trabalho**. É apenas uma melhoria opcional que pode facilitar:

- demonstração durante a apresentação;
- execução dos testes de carga com K6;
- desenvolvimento do front-end;
- execução dos testes com Playwright.

O projeto pode ser entregue sem seed, desde que os endpoints e os testes funcionem corretamente.

## Requisitos do trabalho ainda pendentes

O CRUD e a conexão com o banco estão estruturados. Ainda devem ser adicionados ao projeto completo:

- documentação OpenAPI/Swagger;
- testes unitários do back-end;
- script de teste de carga com Grafana K6;
- front-end para manipulação das tarefas;
- testes do front-end com Playwright;
- resultados da execução dos testes.

## Segurança

- Nunca envie o arquivo `.env` para o repositório;
- não publique a senha do banco;
- caso uma credencial seja exposta, altere-a no Supabase;
- mantenha somente o `.env.example` no Git.
