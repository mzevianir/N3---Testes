import { NextFunction, Request, Response } from "express";
import * as service from "../services/tarefaService";

export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const resultado = await service.listar(req.query.page as string | undefined, req.query.limit as string | undefined);
    res.status(200).json({ success: true, ...resultado });
  } catch (error) { next(error); }
}

export async function buscarPorId(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.buscarPorId(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
}

export async function criar(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.criar(req.body);
    res.status(201).json({ success: true, message: "Tarefa criada com sucesso.", data });
  } catch (error) { next(error); }
}

export async function atualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.atualizar(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Tarefa atualizada com sucesso.", data });
  } catch (error) { next(error); }
}

export async function excluir(req: Request, res: Response, next: NextFunction) {
  try {
    await service.excluir(req.params.id);
    res.status(204).send();
  } catch (error) { next(error); }
}
