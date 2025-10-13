const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


module.exports = {
    name: "users",
    actions: {
        store_users: {
            rest: {
                method: "POST",
                path: "/store_users",
            },
            params: {
                name: { type: "string" },
                email: { type: "string" },
                role: { type: "string" },
                linked_child: { type: "string" },
                password_hash: { type: "string" },
            },
            async handler(ctx) {
                try {
                    const { name, email, role, linked_child, password_hash } = ctx.params;
                    return await prisma.users.create({ data: { name, email, role, linked_child, password_hash } });
                } catch (error) {
                    this.logger.error("Error en store_users:", error.message);
                    throw new Error(`Error al almacenar usuarios: ${error.message}`);
                }
            },
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
                    const { id } = ctx.params;
                    return await prisma.users.findUnique({ where: { id } });
                } catch (error) {
                    this.logger.error("Error en get_by_id:", error.message);
                    throw new Error(`Error al obtener usuario por id: ${error.message}`);
                }
            },
        },
        get_by_email: {
            rest: {
                method: "GET",
                path: "/get_by_email",
            },
            params: {
                email: { type: "string" },
            },
            async handler(ctx) {
                try {
                    const { email } = ctx.params;
                    return await prisma.users.findUnique({ where: { email } });
                } catch (error) {
                    this.logger.error("Error en get_by_email:", error.message);
                    throw new Error(`Error al obtener usuario por email: ${error.message}`);
                }
            },
        },
        get_users: {
            rest: {
                method: "GET",
                path: "/get_users",
            },
            params: {},
            async handler() {
                try {
                    return await prisma.users.findMany();
                } catch (error) {
                    this.logger.error("Error en get_users:", error.message);
                    throw new Error(`Error al obtener usuarios: ${error.message}`);
                }
            },
        },
    },
};
