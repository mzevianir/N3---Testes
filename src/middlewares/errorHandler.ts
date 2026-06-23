import { ErrorRequestHandler } from "express";
import { AppError } from "../errors/AppError";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.details ? { errors: error.details } : {})
    });
    return;
  }

  console.error(error);
  res.status(500).json({ success: false, message: "Erro interno do servidor." });
};
