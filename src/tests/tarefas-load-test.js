import http from "k6/http";
import { check, sleep } from "k6";

//Desta forma irá retornar erro, pois normalmente o banco não está aguentando ou está passando do tempo inserido
//Para que não de erro pelo banco não aguentar diversas requisições, siga as instruções do readme
export const options = {
  stages: [
    { duration: '20s', target: 2 }, 
    { duration: '20s', target: 2 },
    { duration: '20s', target: 0 },
    ],
  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(95)<2000"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://127.0.0.1:3000";

export default function () {
  const headers = { "Content-Type": "application/json" };

  // 1. POST - Criar Tarefa
  const payloadCriar = JSON.stringify({
    titulo: `Tarefa de Teste k6 - ${Math.random().toString(36).substring(7)}`,
    descricao: "Testando a performance do back-end em Node.js",
  });

  const resCriar = http.post(`${BASE_URL}/api/tarefas`, payloadCriar, {
    headers,
  });

  const criouComSucesso = check(resCriar, {
    "POST /api/tarefas - status é 201": (r) => r.status === 201,
    "POST /api/tarefas - tem ID no retorno": (r) =>
      r.json().data && r.json().data.id !== undefined,
  });

  if (!criouComSucesso) {
    sleep(1);
    return;
  }

  const tarefaId = resCriar.json().data.id;

  sleep(1);

  // 2. GET - Listar Tarefas (com paginação do req.query)
  const resListar = http.get(`${BASE_URL}/api/tarefas?page=1&limit=10`);
  check(resListar, {
    "GET /api/tarefas - status é 200": (r) => r.status === 200,
    "GET /api/tarefas - success é true": (r) => r.json().success === true,
  });

  sleep(1);

  // 3. GET - Buscar por ID
  const resBuscar = http.get(`${BASE_URL}/api/tarefas/${tarefaId}`);
  check(resBuscar, {
    "GET /api/tarefas/:id - status é 200": (r) => r.status === 200,
  });

  sleep(1);

  // 4. PUT - Atualizar Tarefa
  const payloadAtualizar = JSON.stringify({
    titulo: "Editado pelo k6",
    descricao: "editar o k6",
    status: "EM_ANDAMENTO",
    prioridade: "ALTA",
    dataLimite: "2026-07-15"
  });

  const resAtualizar = http.put(
    `${BASE_URL}/api/tarefas/${tarefaId}`,
    payloadAtualizar,
    { headers },
  );
  check(resAtualizar, {
    "PUT /api/tarefas/:id - status é 200": (r) => r.status === 200,
  });

  sleep(1);

  // 5. DELETE - Excluir Tarefa
  const resDeletar = http.del(`${BASE_URL}/api/tarefas/${tarefaId}`);
  check(resDeletar, {
    "DELETE /api/tarefas/:id - status é 204": (r) => r.status === 204,
  });

  sleep(1);
}
