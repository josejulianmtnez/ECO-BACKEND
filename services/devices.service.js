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
                mac: { type: "string" },
                type: { type: "string" },
                model: { type: "string" },
                os_version: { type: "string" },
                last_sync: { type: "date", convert: true, optional: true },
                user_id: { type: "number", convert: true },
            },
            async handler(ctx) {
                try {
                    const { mac, type, model, os_version, last_sync, user_id } = ctx.params;
                    return await prisma.devices.create({ data: { mac, type, model, os_version, last_sync, user_id } });
                } catch (error) {
                    this.logger.error("Error en store_devices:", error.message);
                    throw new Error(`Error al almacenar dispositivos: ${error.message}`);
                }
            },
        },
        destroy_device: {
            async handler(ctx) {
                try {
                    const id = Number(ctx.params.id);

                    if (isNaN(id)) {
                        throw new Error("El id debe ser un número válido");
                    }

                    const deletedDevice = await prisma.devices.delete({
                        where: { id },
                    });

                    return {
                        message: `Dispositivo con id ${id} eliminado correctamente`,
                        device: deletedDevice,
                    };
                } catch (error) {
                    this.logger.error("Error en destroy_device:", error.message);
                    throw new Error(`Error al eliminar dispositivo: ${error.message}`);
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
        get_by_mac: {
            rest: {
                method: "GET",
                path: "/get_by_mac",
            },
            params: {
                mac: { type: "string" },
            },
            async handler(ctx) {
                try {
                    const { mac } = ctx.params;
                    return await prisma.devices.findUnique({ where: { mac } });
                } catch (error) {
                    this.logger.error("Error en get_by_mac:", error.message);
                    throw new Error(`Error al obtener dispositivo por mac: ${error.message}`);
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
    },
};
