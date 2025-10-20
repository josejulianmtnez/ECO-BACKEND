const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


module.exports = {
    name: "devices",
    actions: {
        store_devices: {
            rest: {
                method: "POST",
                path: "/store_devices",
            },
            params: {
                uuid: { type: "string" },
                name: { type: "string" },
                model: { type: "string" },
                os_version: { type: "string" },
                last_sync: { type: "date", convert: true, optional: true },
                user_id: { type: "number", convert: true },
            },
            async handler(ctx) {
                try {
                    const { uuid, name, model, os_version, last_sync, user_id } = ctx.params;
                    return await prisma.devices.create({ data: { uuid, name, model, os_version, last_sync, user_id } });
                } catch (error) {
                    this.logger.error("Error en store_devices:", error.message);
                    throw new Error(`Error al almacenar dispositivos: ${error.message}`);
                }
            },
        },
        destroy_device: {
            rest: {
                method: "POST",
                path: "/destroy_device",
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
                    return await prisma.devices.delete({
                        where: { id: ctx.params.id }
                    })
                } catch (err) {
                    this.logger.error("Error en delete:", err.message)
                    throw new Error(`Error al eliminar la alerta: ${err.message}`)
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
                    const id = Number(ctx.params.id) || Number(ctx.query.id);

                    if (isNaN(id)) {
                        throw new Error("El id debe ser un número válido");
                    }

                    const device = await prisma.devices.findUnique({
                        where: { id },
                    });

                    if (!device) {
                        return { message: `No se encontró un dispositivo con id ${id}` };
                    }

                    return device;
                } catch (error) {
                    this.logger.error("Error en get_by_id:", error.message);
                    throw new Error(`Error al obtener dispositivo por id: ${error.message}`);
                }
            },
        },
        get_by_uuid: {
            rest: {
                method: "GET",
                path: "/get_by_uuid",
            },
            params: {
                uuid: { type: "string" },
            },
            async handler(ctx) {
                try {
                    const { uuid } = ctx.params;
                    return await prisma.devices.findUnique({ where: { uuid } });
                } catch (error) {
                    this.logger.error("Error en get_by_mac:", error.message);
                    throw new Error(`Error al obtener dispositivo por uuid: ${error.message}`);
                }
            },
        },
        get_devices: {
            rest: {
                method: "GET",
                path: "/get_devices",
            },
            async handler() {
                try {
                    return await prisma.devices.findMany();
                } catch (error) {
                    this.logger.error("Error en get_devices:", error.message);
                    throw new Error(`Error al obtener dispositivos: ${error.message}`);
                }
            },
        },
        get_devices_by_tutor: {
            rest: {
                method: "GET",
                path: "/get_devices_by_tutor",
            },
            params: {
                tutor_id: { type: "number", convert: true },
            },
            async handler(ctx) {
                try {
                    const { tutor_id } = ctx.params;
                    const childLinks = await prisma.tutor_child_links.findMany({
                        where: { tutor_id },
                        select: { child_id: true },
                    });

                    if (childLinks.length === 0) {
                        return [];
                    }

                    const childIds = childLinks.map(link => link.child_id);

                    const devices = await prisma.devices.findMany({
                        where: {
                            user_id: { in: childIds },
                        },
                    });

                    return devices;

                } catch (error) {
                    this.logger.error("Error en get_devices_by_tutor:", error.message);
                    throw new Error(`Error al obtener dispositivos por tutor: ${error.message}`);
                }
            },
        },
    },
};
