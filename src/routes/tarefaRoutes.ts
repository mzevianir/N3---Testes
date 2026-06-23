import { Router } from "express";
import * as controller from "../controllers/tarefaController";

export const tarefaRouter = Router();

tarefaRouter.get("/api/tarefas", controller.listar);
tarefaRouter.get("/api/tarefas/:id", controller.buscarPorId);
tarefaRouter.post("/api/tarefas", controller.criar);
tarefaRouter.put("/api/tarefas/:id", controller.atualizar);
tarefaRouter.delete("/api/tarefas/:id", controller.excluir);
