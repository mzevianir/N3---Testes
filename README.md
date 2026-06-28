# API RESTful de Gerenciamento de Tarefas

Projeto desenvolvido para a atividade N3, com uma API RESTful e um front-end simples para gerenciamento de tarefas.

A aplicação permite criar, listar, consultar, editar e excluir tarefas. Também foram implementados a documentação OpenAPI, testes unitários no back-end, testes de interface com Playwright e teste de carga com Grafana K6.

## Entidade escolhida

A entidade utilizada no projeto foi **Tarefa**.

Cada tarefa possui os seguintes campos:

| Campo          | Tipo          | Descrição                                  |
| -------------- | ------------- | ------------------------------------------ |
| `id`           | inteiro       | Identificador gerado automaticamente       |
| `titulo`       | texto         | Título da tarefa, entre 3 e 100 caracteres |
| `descricao`    | texto ou nulo | Descrição com até 500 caracteres           |
| `status`       | enum          | `PENDENTE`, `EM_ANDAMENTO` ou `CONCLUIDA`  |
| `prioridade`   | enum          | `BAIXA`, `MEDIA` ou `ALTA`                 |
| `dataLimite`   | data ou nulo  | Data limite da tarefa                      |
| `criadaEm`     | data e hora   | Data de criação                            |
| `atualizadaEm` | data e hora   | Data da última atualização                 |

## Tecnologias utilizadas

### Back-end

* Node.js
* TypeScript
* Express
* Prisma ORM
* PostgreSQL
* Supabase
* dotenv
* CORS

### Front-end

* HTML
* CSS
* JavaScript

### Documentação e testes

* OpenAPI 3
* Swagger UI
* Jest
* ts-jest
* Playwright
* Grafana K6

## Organização do projeto

O back-end foi dividido em camadas para separar melhor as responsabilidades:

* **Routes:** definição das rotas e métodos HTTP;
* **Controllers:** recebimento das requisições e envio das respostas;
* **Services:** regras de negócio e validações;
* **Repositories:** acesso ao banco de dados;
* **DTOs:** formatos utilizados na entrada e saída dos dados;
* **Middlewares:** tratamento centralizado de erros;
* **Prisma:** comunicação com o PostgreSQL.

Fluxo principal da aplicação:

```text
Front-end
   ↓
Route
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
Prisma
   ↓
PostgreSQL / Supabase
```

## Decisões do projeto

O front-end é servido pela própria aplicação Express. Por isso, não é necessário utilizar o Live Server ou iniciar outro servidor separado.

Os testes unitários ficam em `src/tests`, enquanto os testes de interface com Playwright ficam na pasta `tests`. Essa separação evita que o Jest tente executar os arquivos do Playwright.

A pasta `dist` é criada automaticamente pelo comando de build e, por isso, não precisa ser enviada ao GitHub.

## Pré-requisitos

Antes de executar o projeto, é necessário ter instalado:

* Node.js 20 ou superior;
* npm;
* Git;
* Grafana K6;
* um projeto PostgreSQL no Supabase.

O K6 é instalado separadamente e não faz parte das dependências do npm.

No Windows, ele pode ser instalado com:

```powershell
winget install k6 --source winget
```

Depois da instalação, feche e abra novamente o terminal e confirme:

```powershell
k6 version
```

## Configuração do ambiente

Na raiz do projeto, crie um arquivo `.env` com base no `.env.example`.

Exemplo:

```env
DATABASE_URL="URL_DE_CONEXAO_DO_SUPABASE"
DIRECT_URL="URL_DIRETA_DO_SUPABASE"
PORT=3000
```

* `DATABASE_URL` é usada pela aplicação;
* `DIRECT_URL` é usada pelo Prisma nas migrations;
* o arquivo `.env` não deve ser enviado ao GitHub, pois contém os dados de acesso ao banco;
* o arquivo `.env.example` deve permanecer no repositório sem informações reais.

## Instalação

Instale as dependências:

```bash
npm install
```

Gere o Prisma Client:

```bash
npx prisma generate
```

Instale o navegador usado pelo Playwright:

```bash
npx playwright install chromium
```

## Banco de dados

Para validar o schema do Prisma:

```bash
npx prisma validate
```

Para aplicar as migrations:

```bash
npx prisma migrate dev
```

Caso as migrations já tenham sido aplicadas no banco configurado, não é necessário criar uma nova migration.

Para abrir o Prisma Studio:

```bash
npm run prisma:studio
```

## Execução da aplicação

Para iniciar o projeto em modo de desenvolvimento:

```bash
npm run dev
```

A aplicação ficará disponível em:

```text
http://localhost:3000
```

O front-end e a API são disponibilizados pelo mesmo servidor.

### Verificação de saúde da API

```http
GET http://localhost:3000/health
```

Resposta esperada:

```json
{
  "status": "ok"
}
```

### Build

Para compilar o TypeScript:

```bash
npm run build
```

Para executar a versão compilada:

```bash
npm start
```

## Front-end

Com a aplicação em execução, acesse:

```text
http://localhost:3000
```

Pela interface é possível:

* listar tarefas;
* buscar uma tarefa pelo ID;
* criar uma nova tarefa;
* editar uma tarefa existente;
* excluir uma tarefa.

## Documentação OpenAPI

A documentação da API com Swagger UI está disponível em:

```text
http://localhost:3000/docs
```

O arquivo OpenAPI em JSON está disponível em:

```text
http://localhost:3000/docs.json
```

Pelo Swagger é possível visualizar e testar os cinco endpoints da API.

## Endpoints

### Listar tarefas com paginação

```http
GET /api/tarefas?page=1&limit=10
```

| Parâmetro | Valor padrão | Regra                      |
| --------- | -----------: | -------------------------- |
| `page`    |            1 | Inteiro maior ou igual a 1 |
| `limit`   |           10 | Inteiro entre 1 e 100      |

### Buscar tarefa por ID

```http
GET /api/tarefas/{id}
```

### Criar tarefa

```http
POST /api/tarefas
Content-Type: application/json
```

Exemplo:

```json
{
  "titulo": "Finalizar trabalho",
  "descricao": "Executar todos os testes automatizados",
  "status": "PENDENTE",
  "prioridade": "ALTA",
  "dataLimite": "2026-07-15"
}
```

### Atualizar tarefa

```http
PUT /api/tarefas/{id}
Content-Type: application/json
```

Exemplo:

```json
{
  "titulo": "Finalizar trabalho atualizado",
  "descricao": "Testes concluídos",
  "status": "CONCLUIDA",
  "prioridade": "ALTA",
  "dataLimite": "2026-07-15"
}
```

### Excluir tarefa

```http
DELETE /api/tarefas/{id}
```

Resposta de sucesso:

```text
204 No Content
```

## Testes automatizados

### Testes unitários com Jest

Os testes unitários validam as regras da camada de serviço, incluindo cenários de sucesso e erro para criação, listagem, consulta, atualização e exclusão.

Execute:

```bash
npm test
```

Resultado obtido:

```text
Test Suites: 1 passed
Tests: 15 passed
```

### Testes de front-end com Playwright

Os testes de interface validam os principais fluxos do front-end:

1. criação e listagem;
2. consulta por ID;
3. atualização;
4. exclusão.

Execute:

```bash
npm run test:playwright
```

Resultado obtido:

```text
4 passed
```

Para abrir o relatório HTML:

```bash
npm run test:playwright:report
```

### Teste de carga com Grafana K6

O teste de carga realiza chamadas para os cinco endpoints da API.

Primeiro, deixe a aplicação em execução:

```bash
npm run dev
```

Em outro terminal, execute:

```bash
npm run test:k6
```

Resultados obtidos na execução final:

* 63 de 63 verificações aprovadas;
* 45 requisições realizadas;
* taxa de erro de 0%;
* 95% das requisições concluídas em até 1,8 segundo;
* 9 iterações concluídas;
* nenhuma iteração interrompida.

## Verificação final

Antes da entrega ou apresentação, execute:

```bash
npm run build
npm test
npm run test:playwright
```

Depois, com a aplicação em execução:

```bash
npm run test:k6
```

Também confira:

```text
http://localhost:3000
http://localhost:3000/docs
http://localhost:3000/health
```
