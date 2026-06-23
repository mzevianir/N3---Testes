-- CreateEnum
CREATE TYPE "StatusTarefa" AS ENUM ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "PrioridadeTarefa" AS ENUM ('BAIXA', 'MEDIA', 'ALTA');

-- CreateTable
CREATE TABLE "Tarefa" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(100) NOT NULL,
    "descricao" VARCHAR(500),
    "status" "StatusTarefa" NOT NULL DEFAULT 'PENDENTE',
    "prioridade" "PrioridadeTarefa" NOT NULL DEFAULT 'MEDIA',
    "dataLimite" TIMESTAMP(3),
    "criadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadaEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tarefa_pkey" PRIMARY KEY ("id")
);
