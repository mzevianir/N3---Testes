const { test, expect } = require("@playwright/test");

function tituloUnico(prefixo) {
  return `${prefixo} ${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

async function criarTarefaPelaApi(request, titulo) {
  const response = await request.post("/api/tarefas", {
    data: {
      titulo,
      descricao: "Tarefa criada para o teste automatizado.",
      status: "PENDENTE",
      prioridade: "MEDIA"
    }
  });

  expect(response.status()).toBe(201);

  const body = await response.json();

  return body.data;
}

async function excluirSeExistir(request, id) {
  const response = await request.delete(
    `/api/tarefas/${id}`
  );

  expect([204, 404]).toContain(response.status());
}

test.describe(
  "Testes E2E - Gerenciamento de Tarefas",
  () => {

    test(
      "1. Deve criar e listar uma tarefa (POST e GET paginado)",
      async ({ page, request }) => {

        await page.goto("/");

        const titulo = tituloUnico("Tarefa Playwright");
        let tarefaId;

        try {
          await page.fill("#titulo", titulo);
          await page.fill(
            "#descricao",
            "Validando criação e listagem."
          );
          await page.selectOption(
            "#prioridade",
            "ALTA"
          );

          const respostaPost =
            page.waitForResponse(
              response =>
                response.request().method() === "POST" &&
                response.url().endsWith(
                  "/api/tarefas"
                )
            );

          const respostaListagem =
            page.waitForResponse(
              response =>
                response.request().method() === "GET" &&
                response.url().includes(
                  "/api/tarefas?page=1&limit=100"
                )
            );

          await page.click("#btn-salvar");

          const post = await respostaPost;

          expect(post.status()).toBe(201);

          const body = await post.json();
          tarefaId = body.data.id;

          const listagem = await respostaListagem;

          expect(listagem.status()).toBe(200);

          await expect(
            page
              .getByTestId("tarefa-titulo")
              .filter({ hasText: titulo })
          ).toBeVisible();

        } finally {
          if (tarefaId) {
            await excluirSeExistir(
              request,
              tarefaId
            );
          }
        }
      }
    );

    test(
      "2. Deve buscar uma tarefa pelo ID (GET by ID)",
      async ({ page, request }) => {

        const titulo = tituloUnico(
          "Busca Playwright"
        );

        const tarefa =
          await criarTarefaPelaApi(
            request,
            titulo
          );

        try {
          await page.goto("/");

          await page.fill(
            "#busca-id",
            String(tarefa.id)
          );

          const respostaBusca =
            page.waitForResponse(
              response =>
                response.request().method() === "GET" &&
                response.url().endsWith(
                  `/api/tarefas/${tarefa.id}`
                )
            );

          await page.click("#btn-buscar");

          expect(
            (await respostaBusca).status()
          ).toBe(200);

          await expect(
            page.getByText(
              `ID: ${tarefa.id}`,
              { exact: true }
            )
          ).toBeVisible();

          await expect(
            page.getByText(
              titulo,
              { exact: true }
            )
          ).toBeVisible();

        } finally {
          await excluirSeExistir(
            request,
            tarefa.id
          );
        }
      }
    );

    test(
      "3. Deve atualizar uma tarefa (PUT)",
      async ({ page, request }) => {
        test.setTimeout(60_000);

        const tarefa = await criarTarefaPelaApi(
          request,
          tituloUnico("Edição Playwright")
        );

        const tituloAtualizado = tituloUnico(
          "Tarefa Atualizada"
        );

        try {
          await page.goto("/");

          await page.fill(
            "#busca-id",
            String(tarefa.id)
          );

          await page.click("#btn-buscar");

          await expect(
            page.getByText(tarefa.titulo, {
              exact: true
            })
          ).toBeVisible();

          await page
            .getByTestId("btn-editar")
            .click();

          // Confirma que o formulário recebeu os dados da tarefa
          await expect(
            page.locator("#titulo")
          ).toHaveValue(tarefa.titulo);

          await page.fill(
            "#titulo",
            tituloAtualizado
          );

          await page.selectOption(
            "#status",
            "EM_ANDAMENTO"
          );

          await page.selectOption(
            "#prioridade",
            "ALTA"
          );

          const [respostaPut] = await Promise.all([
            page.waitForResponse(
              response =>
                response.request().method() === "PUT" &&
                response.url().endsWith(
                  `/api/tarefas/${tarefa.id}`
                )
            ),

            page.click("#btn-salvar")
          ]);

          expect(respostaPut.status()).toBe(200);

          const bodyPut = await respostaPut.json();

          expect(bodyPut.data.titulo).toBe(
            tituloAtualizado
          );

          expect(bodyPut.data.status).toBe(
            "EM_ANDAMENTO"
          );

          expect(bodyPut.data.prioridade).toBe(
            "ALTA"
          );

          // Confirma no banco que o PUT realmente atualizou
          const respostaConsulta = await request.get(
            `/api/tarefas/${tarefa.id}`
          );

          expect(respostaConsulta.status()).toBe(200);

          const bodyConsulta =
            await respostaConsulta.json();

          expect(bodyConsulta.data.titulo).toBe(
            tituloAtualizado
          );

          expect(bodyConsulta.data.status).toBe(
            "EM_ANDAMENTO"
          );

          expect(bodyConsulta.data.prioridade).toBe(
            "ALTA"
          );

        } finally {
          await excluirSeExistir(
            request,
            tarefa.id
          );
        }
      }
    );

    test(
      "4. Deve excluir uma tarefa (DELETE)",
      async ({ page, request }) => {

        const titulo = tituloUnico(
          "Exclusão Playwright"
        );

        const tarefa =
          await criarTarefaPelaApi(
            request,
            titulo
          );

        let excluida = false;

        try {
          await page.goto("/");

          await page.fill(
            "#busca-id",
            String(tarefa.id)
          );

          await page.click("#btn-buscar");

          await expect(
            page.getByText(
              titulo,
              { exact: true }
            )
          ).toBeVisible();

          page.once(
            "dialog",
            async dialog => {
              expect(
                dialog.message()
              ).toContain(
                "Tem certeza que deseja excluir"
              );

              await dialog.accept();
            }
          );

          const respostaDelete =
            page.waitForResponse(
              response =>
                response.request().method() ===
                "DELETE" &&
                response.url().endsWith(
                  `/api/tarefas/${tarefa.id}`
                )
            );

          await page
            .getByTestId("btn-deletar")
            .click();

          expect(
            (await respostaDelete).status()
          ).toBe(204);

          excluida = true;

          await expect(
            page.getByText(
              titulo,
              { exact: true }
            )
          ).toHaveCount(0);

        } finally {
          if (!excluida) {
            await excluirSeExistir(
              request,
              tarefa.id
            );
          }
        }
      }
    );
  }
);