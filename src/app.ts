import cors from "cors";
import express from "express";
import path from "path";
import swaggerUi from "swagger-ui-express";

import { swaggerDocument } from "./docs/swagger";
import { errorHandler } from "./middlewares/errorHandler";
import { tarefaRouter } from "./routes/tarefaRoutes";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok"
    });
});

app.get("/docs.json", (_req, res) => {
    res.status(200).json(swaggerDocument);
});

app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);

// Disponibiliza os arquivos da pasta frontend
app.use(
    express.static(path.resolve(__dirname, "../frontend"))
);

app.use(tarefaRouter);

app.use(errorHandler);