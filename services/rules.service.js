const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ListMixin = require('../mixins/list.mixin')


module.exports = {
    name: "rules",
    mixins: [ListMixin],
    actions: {
        store_rules: {
            rest: {
                method: "POST",
                path: "/store_rules",
            },
            params: {
                tutor_id: { type: "number", convert: true },
                child_id: { type: "number", convert: true },
                blocked_app: { type: "string" },
                screen_time_limit: { type: "number", convert: true },
                active: { type: "boolean", default: false },
            },
            async handler(ctx) {
                try {
                    const { tutor_id, child_id, blocked_app, screen_time_limit, active} = ctx.params;
                    return await prisma.rules.create({ data: { tutor_id, child_id, blocked_app, screen_time_limit, active } });
                } catch (error) {
                    this.logger.error("Error en store_rules:", error.message);
                    throw new Error(`Error al almacenar regla: ${error.message}`);
                }
            },
        },
        destroy_rule: {
            rest: {
                method: "POST",
                path: "/destroy_rule",
            },
            params: {
                id: { type: "number", convert: true },
            },
            async handler(ctx) {
                try {
                    return await prisma.rules.delete({
                        where: { id: ctx.params.id }
                    })
                } catch (err) {
                    this.logger.error("Error en delete:", err.message)
                    throw new Error(`Error al eliminar la regla: ${err.message}`)
                }
            }
        },
        get_by_id: {
            rest: {
                method: "GET",
                path: "/get_by_id",
            },
            params: {
                id: { type: "number", convert: true },
            },
            async handler(ctx) {
                try {
                    const id = ctx.params.id;
                    if (isNaN(id)) {
                        throw new Error("El id debe ser un número válido");
                    }
                    const rule = await prisma.rules.findUnique({
                        where: { id },
                    });
                    if (!rule) {
                        return { message: `No se encontró la regla con id ${id}` };
                    }
                    return rule;
                } catch (error) {
                    this.logger.error("Error en get_by_id:", error.message);
                    throw new Error(`Error al obtener la regla por id: ${error.message}`);
                }
            },
        },
        get_rules: {
            rest: {
                method: "GET",
                path: "/get_rules",
            },
            async handler() {
                try {
                    return await prisma.rules.findMany();
                } catch (error) {
                    this.logger.error("Error en get_rules:", error.message);
                    throw new Error(`Error al obtener las reglas: ${error.message}`);
                }
            },
        },
        update_rule: {
            rest: {
                method: "POST",
                path: "/update_rule",
            },
            params: {
                id: { type: "number", convert: true },
                blocked_app: { type: "string", optional: true },
                screen_time_limit: { type: "number", convert: true, optional: true },
                active: { type: "boolean", optional: true },
            },
            async handler(ctx) {
                try {
                    const { id, ...data } = ctx.params;
                    const rule = await prisma.rules.update({
                        where: { id },
                        data,
                    });
                    return rule;
                } catch (error) {
                    this.logger.error("Error en update_rule:", error.message);
                    throw new Error(`Error al actualizar la regla: ${error.message}`);
                }
            },
        },
    },
};
