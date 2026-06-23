import { PrioridadeTarefa, StatusTarefa } from "@prisma/client";
import { AppError } from "../errors/AppError";
import { AtualizarTarefaDTO, CriarTarefaDTO, tarefaResponseDTO } from "../dtos/tarefaDTO";
import * as repository from "../repositories/tarefaRepository";

function validarId(id: string): number {
  const numero = Number(id);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new AppError("O ID deve ser um número inteiro positivo.", 400);
  }
  return numero;
}

function validarTitulo(titulo: unknown): asserts titulo is string {
  if (typeof titulo !== "string" || titulo.trim().length < 3 || titulo.trim().length > 100) {
    throw new AppError("O título deve possuir entre 3 e 100 caracteres.", 400);
  }
}

function validarEnums(status: unknown, prioridade: unknown) {
  if (status !== undefined && !Object.values(StatusTarefa).includes(status as StatusTarefa)) {
    throw new AppError("Status inválido.", 400);
  }
  if (prioridade !== undefined && !Object.values(PrioridadeTarefa).includes(prioridade as PrioridadeTarefa)) {
    throw new AppError("Prioridade inválida.", 400);
  }
}

function converterData(valor?: string | null): Date | null | undefined {
  if (valor === undefined) return undefined;
  if (valor === null || valor === "") return null;
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) throw new AppError("Data limite inválida.", 400);
  return data;
}

export async function listar(pageParam?: string, limitParam?: string) {
  const page = pageParam ? Number(pageParam) : 1;
  const limit = limitParam ? Number(limitParam) : 10;
  if (!Number.isInteger(page) || page < 1) throw new AppError("A página deve ser um inteiro maior ou igual a 1.", 400);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new AppError("O limite deve estar entre 1 e 100.", 400);

  const { tarefas, totalItems } = await repository.listar(page, limit);
  return {
    data: tarefas.map(tarefaResponseDTO),
    pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) }
  };
}

export async function buscarPorId(idParam: string) {
  const id = validarId(idParam);
  const tarefa = await repository.buscarPorId(id);
  if (!tarefa) throw new AppError("Tarefa não encontrada.", 404);
  return tarefaResponseDTO(tarefa);
}

export async function criar(dto: CriarTarefaDTO) {
  validarTitulo(dto.titulo);
  validarEnums(dto.status, dto.prioridade);
  if (dto.descricao && dto.descricao.length > 500) throw new AppError("A descrição deve possuir no máximo 500 caracteres.", 400);

  const tarefa = await repository.criar({
    titulo: dto.titulo.trim(),
    descricao: dto.descricao?.trim() || null,
    status: dto.status ?? StatusTarefa.PENDENTE,
    prioridade: dto.prioridade ?? PrioridadeTarefa.MEDIA,
    dataLimite: converterData(dto.dataLimite)
  });
  return tarefaResponseDTO(tarefa);
}

export async function atualizar(idParam: string, dto: AtualizarTarefaDTO) {
  const id = validarId(idParam);
  validarTitulo(dto.titulo);
  validarEnums(dto.status, dto.prioridade);
  if (!dto.status || !dto.prioridade) throw new AppError("Status e prioridade são obrigatórios no PUT.", 400);
  if (dto.descricao && dto.descricao.length > 500) throw new AppError("A descrição deve possuir no máximo 500 caracteres.", 400);
  if (!(await repository.buscarPorId(id))) throw new AppError("Tarefa não encontrada.", 404);

  const tarefa = await repository.atualizar(id, {
    titulo: dto.titulo.trim(),
    descricao: dto.descricao?.trim() || null,
    status: dto.status,
    prioridade: dto.prioridade,
    dataLimite: converterData(dto.dataLimite)
  });
  return tarefaResponseDTO(tarefa);
}

export async function excluir(idParam: string) {
  const id = validarId(idParam);
  if (!(await repository.buscarPorId(id))) throw new AppError("Tarefa não encontrada.", 404);
  await repository.excluir(id);
}
