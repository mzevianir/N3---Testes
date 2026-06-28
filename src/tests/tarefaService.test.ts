import * as service from "../services/tarefaService";
import * as repository from "../repositories/tarefaRepository";
import { StatusTarefa, PrioridadeTarefa } from "@prisma/client";

jest.mock("../repositories/tarefaRepository");

const mockedRepository = repository as jest.Mocked<typeof repository>;

beforeEach(() => {
    jest.clearAllMocks();
});

describe("Criar tarefa", () => {

    it("deve lançar erro quando o título possuir menos de 3 caracteres", async () => {

        await expect(

            service.criar({
                titulo: "Oi"
            })

        ).rejects.toThrow(
            "O título deve possuir entre 3 e 100 caracteres."
        );

    });

});

describe("Criar tarefa", () => {

    it("deve criar uma tarefa válida", async () => {

        mockedRepository.criar.mockResolvedValue({

            id: 1,
            titulo: "Estudar Jest",
            descricao: null,
            status: StatusTarefa.PENDENTE,
            prioridade: PrioridadeTarefa.MEDIA,
            dataLimite: null,
            criadaEm: new Date(),
            atualizadaEm: new Date()

        });

        const tarefa = await service.criar({

            titulo: "Estudar Jest"

        });

        expect(tarefa.titulo).toBe("Estudar Jest");
        expect(tarefa.status).toBe(StatusTarefa.PENDENTE);
        expect(tarefa.prioridade).toBe(PrioridadeTarefa.MEDIA);

    });

    it("deve impedir descrição com mais de 500 caracteres", async () => {

        await expect(
            service.criar({
                titulo: "Minha tarefa",
                descricao: "a".repeat(501)
            })
        ).rejects.toThrow(
            "A descrição deve possuir no máximo 500 caracteres."
        );

    });

    it("deve impedir status inválido", async () => {

        await expect(
            service.criar({
                titulo: "Minha tarefa",
                status: "TESTE" as any
            })
        ).rejects.toThrow("Status inválido.");

    });

    it("deve impedir prioridade inválida", async () => {

        await expect(
            service.criar({
                titulo: "Minha tarefa",
                prioridade: "TESTE" as any
            })
        ).rejects.toThrow(
            "Prioridade inválida."
        );

    });

});

describe("Buscar tarefa", () => {

    it("deve retornar uma tarefa existente", async () => {

        mockedRepository.buscarPorId.mockResolvedValue({

            id: 1,
            titulo: "Minha tarefa",
            descricao: null,
            status: StatusTarefa.PENDENTE,
            prioridade: PrioridadeTarefa.MEDIA,
            dataLimite: null,
            criadaEm: new Date(),
            atualizadaEm: new Date()

        });

        const tarefa = await service.buscarPorId("1");

        expect(tarefa.id).toBe(1);
        expect(tarefa.titulo).toBe("Minha tarefa");

    });

    it("deve lançar erro para ID inválido", async () => {

        await expect(
            service.buscarPorId("abc")
        ).rejects.toThrow(
            "O ID deve ser um número inteiro positivo."
        );

    });

    it("deve lançar erro quando a tarefa não existir", async () => {
        mockedRepository.buscarPorId.mockResolvedValue(null);

        await expect(
            service.buscarPorId("1")
        ).rejects.toThrow(
            "Tarefa não encontrada."
        );

    });

});

describe("Listar tarefas", () => {

    it("deve impedir página menor que 1", async () => {

        await expect(
            service.listar("0", "10")
        ).rejects.toThrow(
            "A página deve ser um inteiro maior ou igual a 1."
        );

    });

    it("deve impedir limite maior que 100", async () => {

        await expect(
            service.listar("1", "101")
        ).rejects.toThrow(
            "O limite deve estar entre 1 e 100."
        );

    });

    it("deve listar tarefas", async () => {

        mockedRepository.listar.mockResolvedValue({

            tarefas: [
                {
                    id: 1,
                    titulo: "Primeira",
                    descricao: null,
                    status: StatusTarefa.PENDENTE,
                    prioridade: PrioridadeTarefa.MEDIA,
                    dataLimite: null,
                    criadaEm: new Date(),
                    atualizadaEm: new Date()
                }
            ],

            totalItems: 1

        });

        const resultado = await service.listar("1", "10");

        expect(resultado.data).toHaveLength(1);
        expect(resultado.pagination.totalItems).toBe(1);

    });

});

describe("Atualizar tarefa", () => {

    it("deve atualizar uma tarefa existente", async () => {

        mockedRepository.buscarPorId.mockResolvedValue({
            id: 1,
            titulo: "Tarefa antiga",
            descricao: null,
            status: StatusTarefa.PENDENTE,
            prioridade: PrioridadeTarefa.BAIXA,
            dataLimite: null,
            criadaEm: new Date(),
            atualizadaEm: new Date()
        });

        mockedRepository.atualizar.mockResolvedValue({
            id: 1,
            titulo: "Tarefa atualizada",
            descricao: "Descrição atualizada",
            status: StatusTarefa.CONCLUIDA,
            prioridade: PrioridadeTarefa.ALTA,
            dataLimite: null,
            criadaEm: new Date(),
            atualizadaEm: new Date()
        });

        const tarefa = await service.atualizar("1", {
            titulo: "Tarefa atualizada",
            descricao: "Descrição atualizada",
            status: StatusTarefa.CONCLUIDA,
            prioridade: PrioridadeTarefa.ALTA
        });

        expect(tarefa.id).toBe(1);
        expect(tarefa.titulo).toBe("Tarefa atualizada");
        expect(tarefa.status).toBe(StatusTarefa.CONCLUIDA);
        expect(tarefa.prioridade).toBe(PrioridadeTarefa.ALTA);

        expect(mockedRepository.atualizar).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                titulo: "Tarefa atualizada",
                descricao: "Descrição atualizada",
                status: StatusTarefa.CONCLUIDA,
                prioridade: PrioridadeTarefa.ALTA
            })
        );

    });

    it("deve lançar erro quando a tarefa não existir", async () => {

        mockedRepository.buscarPorId.mockResolvedValue(null);

        await expect(
            service.atualizar("1", {
                titulo: "Teste",
                status: StatusTarefa.PENDENTE,
                prioridade: PrioridadeTarefa.MEDIA
            })
        ).rejects.toThrow("Tarefa não encontrada.");

    });

});

describe("Excluir tarefa", () => {

    it("deve excluir uma tarefa existente", async () => {

        const tarefaExistente = {
            id: 1,
            titulo: "Tarefa para excluir",
            descricao: null,
            status: StatusTarefa.PENDENTE,
            prioridade: PrioridadeTarefa.MEDIA,
            dataLimite: null,
            criadaEm: new Date(),
            atualizadaEm: new Date()
        };

        mockedRepository.buscarPorId.mockResolvedValue(tarefaExistente);
        mockedRepository.excluir.mockResolvedValue(tarefaExistente);

        await expect(
            service.excluir("1")
        ).resolves.toBeUndefined();

        expect(mockedRepository.buscarPorId).toHaveBeenCalledWith(1);
        expect(mockedRepository.excluir).toHaveBeenCalledWith(1);

    });

    it("deve lançar erro quando a tarefa não existir", async () => {

        mockedRepository.buscarPorId.mockResolvedValue(null);

        await expect(
            service.excluir("1")
        ).rejects.toThrow("Tarefa não encontrada.");

        expect(mockedRepository.excluir).not.toHaveBeenCalled();

    });

});