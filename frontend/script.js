const API_URL = 'http://localhost:3000/api/tarefas';

// Elementos do DOM
const form = document.getElementById('tarefa-form');
const listaTarefas = document.getElementById('lista-tarefas');
const formTitle = document.getElementById('form-title');
const btnCancelar = document.getElementById('btn-cancelar');

// Elementos da Busca
const btnBuscar = document.getElementById('btn-buscar');
const inputBuscaId = document.getElementById('busca-id');

// Função auxiliar para desenhar a tarefa na tela
function renderizarCardTarefa(tarefa) {
    const card = document.createElement('div');
    card.className = 'tarefa-card';
    card.innerHTML = `
        <div class="tarefa-info">
            <h3 data-testid="tarefa-titulo">${tarefa.titulo}</h3>
            <p>${tarefa.descricao || 'Sem descrição'}</p>
            <div class="badges">
                <span>ID: ${tarefa.id}</span>
                <span>Status: ${tarefa.status}</span>
                <span>Prioridade: ${tarefa.prioridade}</span>
            </div>
        </div>
        <div class="tarefa-acoes">
            <button onclick="prepararEdicao(${tarefa.id})" class="btn-secondary" data-testid="btn-editar">Editar</button>
            <button onclick="deletarTarefa(${tarefa.id})" class="btn-danger" data-testid="btn-deletar">Excluir</button>
        </div>
    `;
    listaTarefas.appendChild(card);
}

// 1. GET Paginado (Listagem Geral)
async function carregarTarefas() {
    try {
        const response = await fetch(`${API_URL}?page=1&limit=100`);
        const result = await response.json();
        
        listaTarefas.innerHTML = ''; 

        if (result.success && result.data.length > 0) {
            result.data.forEach(tarefa => renderizarCardTarefa(tarefa));
        } else {
            listaTarefas.innerHTML = '<p>Nenhuma tarefa encontrada.</p>';
        }
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
    }
}

// GET by ID (Busca Visual no Front-end)
btnBuscar.addEventListener('click', async () => {
    const id = inputBuscaId.value;
    
    // Se o campo estiver vazio, funciona como o "Ver Todas" (recarrega a lista geral)
    if (!id) {
        carregarTarefas();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`);
        const result = await response.json();
        
        listaTarefas.innerHTML = ''; 

        if (response.ok && result.success) {
            renderizarCardTarefa(result.data);
        } else {
            listaTarefas.innerHTML = `<p style="color: red;">${result.message || 'Tarefa não encontrada.'}</p>`;
        }
    } catch (error) {
        console.error('Erro na busca:', error);
    }
});

// GET by ID (Prepara para Edição no Formulário)
async function prepararEdicao(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const result = await response.json();

        if (result.success) {
            const tarefa = result.data;
            
            document.getElementById('tarefa-id').value = tarefa.id;
            document.getElementById('titulo').value = tarefa.titulo;
            document.getElementById('descricao').value = tarefa.descricao || '';
            document.getElementById('status').value = tarefa.status;
            document.getElementById('prioridade').value = tarefa.prioridade;
            
            if(tarefa.dataLimite) {
                document.getElementById('dataLimite').value = tarefa.dataLimite.split('T')[0];
            }

            formTitle.textContent = `Editar Tarefa #${tarefa.id}`;
            btnCancelar.style.display = 'inline-block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Erro ao buscar tarefa para edição:', error);
    }
}

// POST e PUT (Criação e Atualização)
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('tarefa-id').value;
    const isEdicao = id !== '';
    const url = isEdicao ? `${API_URL}/${id}` : API_URL;
    const method = isEdicao ? 'PUT' : 'POST';

    const dataLimiteValue = document.getElementById('dataLimite').value;
    
    const payload = {
        titulo: document.getElementById('titulo').value,
        descricao: document.getElementById('descricao').value,
        status: document.getElementById('status').value,
        prioridade: document.getElementById('prioridade').value,
        ...(dataLimiteValue && { dataLimite: new Date(dataLimiteValue).toISOString() })
    };

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            resetarFormulario();
            inputBuscaId.value = ''; 
            carregarTarefas(); 
        } else {
            alert(`Erro: ${result.message}`);
        }
    } catch (error) {
        console.error('Erro ao salvar tarefa:', error);
    }
});

// DELETE (Exclusão)
async function deletarTarefa(id) {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                if (inputBuscaId.value == id) {
                    inputBuscaId.value = '';
                }
                carregarTarefas();
            }
        } catch (error) {
            console.error('Erro ao deletar tarefa:', error);
        }
    }
}

// Funções Auxiliares
function resetarFormulario() {
    form.reset();
    document.getElementById('tarefa-id').value = '';
    formTitle.textContent = 'Nova Tarefa';
    btnCancelar.style.display = 'none';
}

btnCancelar.addEventListener('click', resetarFormulario);

// Inicia carregando as tarefas quando a página abre
document.addEventListener('DOMContentLoaded', carregarTarefas);