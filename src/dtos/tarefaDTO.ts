import { PrioridadeTarefa, StatusTarefa, Tarefa } from "@prisma/client";

export interface CriarTarefaDTO {
  titulo: string;
  descricao?: string | null;
  status?: StatusTarefa;
  prioridade?: PrioridadeTarefa;
  dataLimite?: string | null;
}

export interface AtualizarTarefaDTO {
  titulo: string;
  descricao?: string | null;
  status: StatusTarefa;
  prioridade: PrioridadeTarefa;
  dataLimite?: string | null;
}

export function tarefaResponseDTO(tarefa: Tarefa) {
  return {
    id: tarefa.id,
    titulo: tarefa.titulo,
    descricao: tarefa.descricao,
    status: tarefa.status,
    prioridade: tarefa.prioridade,
    dataLimite: tarefa.dataLimite,
    criadaEm: tarefa.criadaEm,
    atualizadaEm: tarefa.atualizadaEm
  };
}
