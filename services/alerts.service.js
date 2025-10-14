"use strict"

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const ListMixin = require('../mixins/list.mixin')

module.exports = {
    name: "alerts",
    mixins: [ListMixin],
    actions: {
        get_all: {
            rest: {
                method: "GET",
                path: "/get_all",
            },
            params: {},
            async handler(ctx) {
                try {
                    return await prisma.alerts.findMany()
                } catch (err) {
                    this.logger.error("Error en get_all:", err.message)
                    throw new Error(`Error al obtener todas las alertas: ${err.message}`)
                }
            }
        },
        get_by_id: {
            rest: {
                method: "GET",
                path: "/get_by_id",
            },
            params: {
                id: { type: "number", convert: true }
            },
            async handler(ctx) {
                try {
                    return await prisma.alerts.findUnique({
                        where: { 
                            id: ctx.params.id
                        }
                    })
                } catch (err) {
                    this.logger.error("Error en get_by_id:", err.message)
                    throw new Error(`Error al obtener la alerta por ID: ${err.message}`)
                }
            }
        },
        get_by_arg: {
            rest: {
                method: "GET",
                path: "/get_by_arg",
            },
            params: {
                argument: { type: "string" },
                value: { type: "string" },
                getAll: { type: "boolean", optional: true, default: false }
            },
            async handler(ctx) {
                const where = {[ctx.params.argument]: ctx.params.value}
                try {
                    const cols = Object.keys(prisma.alerts.fields)
                    if (!cols.includes(ctx.params.argument)) {
                        throw new Error(`El argumento ${ctx.params.argument} no es válido. Argumentos válidos: ${cols.join(", ")}`)
                    }

                    return ctx.params.getAll
                        ? await prisma.alerts.findMany({where})
                        : await prisma.alerts.findFirst({where})
                    
                } catch (err) {
                    this.logger.error("Error en get_by_arg:", err.message)
                    throw new Error(`Error al obtener la alerta por argumento: ${err.message}`)
                }
            }
        },
        new: {
            rest: {
                method: "POST",
                path: "/new",
            },
            params: {
                id_user_tutor: { type: "number", convert: true },
                id_user_child: { type: "number", convert: true },
                timestamp: { type: "string", optional: true, default: new Date().toISOString() },
                type: { type: "string" },
                message: { type: "string" },
                status: { type: "boolean", optional: true, default: true }
            },
            async handler(ctx) {
                try {
                    return await prisma.alerts.create({
                        data: {
                            id_user_tutor: ctx.params.id_user_tutor,
                            id_user_child: ctx.params.id_user_child,
                            timestamp: ctx.params.timestamp,
                            type: ctx.params.type,
                            message: ctx.params.message,
                            status: ctx.params.status
                        }
                    })
                } catch (err) {
                    this.logger.error("Error en new:", err.message)
                    throw new Error(`Error al crear nueva alerta: ${err.message}`)
                }
            }
        },
        update: {
            rest: {
                method: "PATCH",
                path: "/update",
            },
            params: {
                id: { type: "number", convert: true },
                id_user_child: { type: "number", convert: true },
                timestamp: { type: "string", optional: true, default: new Date().toISOString() },
                type: { type: "string", optional: true },
                message: { type: "string", optional: true },
                status: { type: "boolean", optional: true }
            },
            async handler(ctx) {
                const data = {}
                
                ctx.params.id_user_child && (data.id_user_child = ctx.params.id_user_child)
                ctx.params.timestamp && (data.timestamp = ctx.params.timestamp)
                ctx.params.type && (data.type = ctx.params.type)
                ctx.params.message && (data.message = ctx.params.message)
                ctx.params.status !== undefined && (data.status = ctx.params.status)
                
                try {
                    return await prisma.alerts.update({
                        where: { id: ctx.params.id },
                        data
                    })
                } catch (err) {
                    this.logger.error("Error en update:", err.message)
                    throw new Error(`Error al actualizar la alerta: ${err.message}`)
                }
            }
        },
        delete: {
            rest: {
                method: "DELETE",
                path: "/delete",
            },
            params: {
                id: { type: "number", convert: true },
                confirm: { type: "boolean", optional: true, default: false }
            },
            async handler(ctx) {
                if (!ctx.params.confirm) {
                    return { message: "Por favor, confirme la eliminación estableciendo 'confirm' a true." }
                }
                try {
                    return await prisma.alerts.delete({
                        where: { id: ctx.params.id }
                    })
                } catch (err) {
                    this.logger.error("Error en delete:", err.message)
                    throw new Error(`Error al eliminar la alerta: ${err.message}`)
                }
            }
        }
    },
}
