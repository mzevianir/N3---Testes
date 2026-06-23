import { Prisma, PrioridadeTarefa, StatusTarefa } from "@prisma/client";
import { prisma } from "../database/prisma";

export async function listar(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [tarefas, totalItems] = await Promise.all([
    prisma.tarefa.findMany({ orderBy: { id: "asc" }, skip, take: limit }),
    prisma.tarefa.count()
  ]);
  return { tarefas, totalItems };
}

export function buscarPorId(id: number) {
  return prisma.tarefa.findUnique({ where: { id } });
}

export function criar(data: Prisma.TarefaCreateInput) {
  return prisma.tarefa.create({ data });
}

export function atualizar(
  id: number,
  data: {
    titulo: string;
    descricao?: string | null;
    status: StatusTarefa;
    prioridade: PrioridadeTarefa;
    dataLimite?: Date | null;
  }
) {
  return prisma.tarefa.update({ where: { id }, data });
}

export function excluir(id: number) {
  return prisma.tarefa.delete({ where: { id } });
}
