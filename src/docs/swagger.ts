export const swaggerDocument = {
    openapi: "3.0.3",

    info: {
        title: "API de Gerenciamento de Tarefas",
        version: "1.0.0",
        description:
            "API RESTful desenvolvida para criação, consulta, atualização e exclusão de tarefas."
    },

    servers: [
        {
            url: "http://localhost:3000",
            description: "Servidor local"
        }
    ],

    tags: [
        {
            name: "Tarefas",
            description: "Operações relacionadas às tarefas"
        }
    ],

    components: {
        schemas: {
            Tarefa: {
                type: "object",
                properties: {
                    id: {
                        type: "integer",
                        example: 1
                    },
                    titulo: {
                        type: "string",
                        example: "Finalizar trabalho"
                    },
                    descricao: {
                        type: "string",
                        nullable: true,
                        example: "Concluir os testes automatizados"
                    },
                    status: {
                        type: "string",
                        enum: ["PENDENTE", "EM_ANDAMENTO", "CONCLUIDA"],
                        example: "PENDENTE"
                    },
                    prioridade: {
                        type: "string",
                        enum: ["BAIXA", "MEDIA", "ALTA"],
                        example: "ALTA"
                    },
                    dataLimite: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                        example: "2026-07-15T00:00:00.000Z"
                    },
                    criadaEm: {
                        type: "string",
                        format: "date-time"
                    },
                    atualizadaEm: {
                        type: "string",
                        format: "date-time"
                    }
                }
            },

            CriarTarefa: {
                type: "object",
                required: ["titulo"],
                properties: {
                    titulo: {
                        type: "string",
                        minLength: 3,
                        maxLength: 100,
                        example: "Estudar Playwright"
                    },
                    descricao: {
                        type: "string",
                        maxLength: 500,
                        nullable: true,
                        example: "Criar os testes do front-end"
                    },
                    status: {
                        type: "string",
                        enum: ["PENDENTE", "EM_ANDAMENTO", "CONCLUIDA"],
                        default: "PENDENTE"
                    },
                    prioridade: {
                        type: "string",
                        enum: ["BAIXA", "MEDIA", "ALTA"],
                        default: "MEDIA"
                    },
                    dataLimite: {
                        type: "string",
                        format: "date",
                        nullable: true,
                        example: "2026-07-15"
                    }
                }
            },

            AtualizarTarefa: {
                type: "object",
                required: ["titulo", "status", "prioridade"],
                properties: {
                    titulo: {
                        type: "string",
                        minLength: 3,
                        maxLength: 100,
                        example: "Estudar Playwright atualizado"
                    },
                    descricao: {
                        type: "string",
                        maxLength: 500,
                        nullable: true,
                        example: "Testes do front-end finalizados"
                    },
                    status: {
                        type: "string",
                        enum: ["PENDENTE", "EM_ANDAMENTO", "CONCLUIDA"],
                        example: "CONCLUIDA"
                    },
                    prioridade: {
                        type: "string",
                        enum: ["BAIXA", "MEDIA", "ALTA"],
                        example: "ALTA"
                    },
                    dataLimite: {
                        type: "string",
                        format: "date",
                        nullable: true,
                        example: "2026-07-15"
                    }
                }
            },

            Erro: {
                type: "object",
                properties: {
                    success: {
                        type: "boolean",
                        example: false
                    },
                    message: {
                        type: "string",
                        example: "Tarefa não encontrada."
                    }
                }
            }
        }
    },

    paths: {
        "/api/tarefas": {
            get: {
                tags: ["Tarefas"],
                summary: "Listar tarefas com paginação",

                parameters: [
                    {
                        name: "page",
                        in: "query",
                        required: false,
                        schema: {
                            type: "integer",
                            minimum: 1,
                            default: 1
                        }
                    },
                    {
                        name: "limit",
                        in: "query",
                        required: false,
                        schema: {
                            type: "integer",
                            minimum: 1,
                            maximum: 100,
                            default: 10
                        }
                    }
                ],

                responses: {
                    "200": {
                        description: "Lista de tarefas retornada com sucesso",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: {
                                            type: "boolean",
                                            example: true
                                        },
                                        data: {
                                            type: "array",
                                            items: {
                                                $ref: "#/components/schemas/Tarefa"
                                            }
                                        },
                                        pagination: {
                                            type: "object",
                                            properties: {
                                                page: {
                                                    type: "integer",
                                                    example: 1
                                                },
                                                limit: {
                                                    type: "integer",
                                                    example: 10
                                                },
                                                totalItems: {
                                                    type: "integer",
                                                    example: 5
                                                },
                                                totalPages: {
                                                    type: "integer",
                                                    example: 1
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },

                    "400": {
                        description: "Parâmetros de paginação inválidos",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Erro"
                                }
                            }
                        }
                    }
                }
            },

            post: {
                tags: ["Tarefas"],
                summary: "Criar uma nova tarefa",

                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/CriarTarefa"
                            }
                        }
                    }
                },

                responses: {
                    "201": {
                        description: "Tarefa criada com sucesso",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: {
                                            type: "boolean",
                                            example: true
                                        },
                                        message: {
                                            type: "string",
                                            example: "Tarefa criada com sucesso."
                                        },
                                        data: {
                                            $ref: "#/components/schemas/Tarefa"
                                        }
                                    }
                                }
                            }
                        }
                    },

                    "400": {
                        description: "Dados inválidos",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Erro"
                                }
                            }
                        }
                    }
                }
            }
        },

        "/api/tarefas/{id}": {
            get: {
                tags: ["Tarefas"],
                summary: "Buscar uma tarefa pelo ID",

                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "integer",
                            minimum: 1
                        }
                    }
                ],

                responses: {
                    "200": {
                        description: "Tarefa encontrada",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: {
                                            type: "boolean",
                                            example: true
                                        },
                                        data: {
                                            $ref: "#/components/schemas/Tarefa"
                                        }
                                    }
                                }
                            }
                        }
                    },

                    "404": {
                        description: "Tarefa não encontrada",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Erro"
                                }
                            }
                        }
                    }
                }
            },

            put: {
                tags: ["Tarefas"],
                summary: "Atualizar uma tarefa existente",

                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "integer",
                            minimum: 1
                        }
                    }
                ],

                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/AtualizarTarefa"
                            }
                        }
                    }
                },

                responses: {
                    "200": {
                        description: "Tarefa atualizada com sucesso",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: {
                                            type: "boolean",
                                            example: true
                                        },
                                        message: {
                                            type: "string",
                                            example: "Tarefa atualizada com sucesso."
                                        },
                                        data: {
                                            $ref: "#/components/schemas/Tarefa"
                                        }
                                    }
                                }
                            }
                        }
                    },

                    "400": {
                        description: "Dados inválidos",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Erro"
                                }
                            }
                        }
                    },

                    "404": {
                        description: "Tarefa não encontrada",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Erro"
                                }
                            }
                        }
                    }
                }
            },

            delete: {
                tags: ["Tarefas"],
                summary: "Excluir uma tarefa",

                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "integer",
                            minimum: 1
                        }
                    }
                ],

                responses: {
                    "204": {
                        description: "Tarefa excluída com sucesso"
                    },

                    "404": {
                        description: "Tarefa não encontrada",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Erro"
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};