const { test, expect } = require('@playwright/test');

// Altera para a porta onde o seu Live Server está rodando o front-end
const URL_FRONTEND = 'http://127.0.0.1:5500/frontend/';

test.describe('Testes E2E - Gerenciamento de Tarefas', () => {

    test.beforeEach(async ({ page }) => {
        // Abre o front-end antes de cada teste
        await page.goto(URL_FRONTEND);
    });

    test('1. Deve criar uma nova tarefa com sucesso (POST) e listar (GET Paginado)', async ({ page }) => {
        // Preenche o formulário
        await page.fill('#titulo', 'Tarefa do Teste Playwright');
        await page.fill('#descricao', 'Validando o fluxo de criação automatizada.');
        await page.selectOption('#prioridade', 'ALTA');

        // Clica no botão salvar
        await page.click('#btn-salvar');

        // Valida se o elemento com o título criado está visível na lista (GET Paginado)
        const tarefaCriada = page.locator('text=Tarefa do Teste Playwright').first();
        await expect(tarefaCriada).toBeVisible();
    });

    test('2. Deve buscar uma tarefa específica pelo ID (GET by ID)', async ({ page }) => {
        const badgeID = await page.locator('.badges span').filter({ hasText: 'ID:' }).first().innerText();
        const idTarefa = badgeID.replace('ID: ', '').trim(); 

        // Digita o ID no campo de busca e clica em Buscar
        await page.fill('#busca-id', idTarefa);
        await page.click('#btn-buscar');

        // Valida se o card exibido na tela é o da tarefa buscada
        const idVisivel = page.locator('.badges span').filter({ hasText: `ID: ${idTarefa}` });
        await expect(idVisivel).toBeVisible();
    });

    test('3. Deve carregar os dados no formulário e atualizar a tarefa (PUT)', async ({ page }) => {
        await page.click('[data-testid="btn-editar"] >> nth=0');

        // Altera o título para um novo valor
        await page.fill('#titulo', 'Tarefa Atualizada pelo Playwright');
        await page.selectOption('#status', 'EM_ANDAMENTO');

        // Salva as alterações
        await page.click('#btn-salvar');

        // Verifica se o título atualizado aparece na listagem
        const tarefaAtualizada = page.locator('text=Tarefa Atualizada pelo Playwright').first();
        await expect(tarefaAtualizada).toBeVisible();
    });

    test('4. Deve excluir uma tarefa com sucesso (DELETE)', async ({ page }) => {
        page.on('dialog', async dialog => {
            expect(dialog.message()).toContain('Tem certeza que deseja excluir');
            await dialog.accept(); 
        });

        // Guarda o número de tarefas antes da exclusão
        const totalAntes = await page.locator('.tarefa-card').count();

        // Se não houver tarefas, o teste não deve falhar por falta de clique
        if (totalAntes > 0) {
            // Clica no botão "Excluir" da primeira tarefa
            await page.click('[data-testid="btn-deletar"] >> nth=0');

            // Aguarda a lista atualizar
            await page.waitForTimeout(1000);

            // Verifica se a quantidade de cards diminuiu
            const totalDepois = await page.locator('.tarefa-card').count();
            expect(totalDepois).toBeLessThan(totalAntes);
        }
    });
});