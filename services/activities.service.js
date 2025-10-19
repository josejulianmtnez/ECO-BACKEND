const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ListMixin = require('../mixins/list.mixin')


module.exports = {
    name: "activities",
    mixins: [ListMixin],
    actions: {
        start_activity: {
            rest: {
                method: "POST",
                path: "/start_activity",
            },
            params: {
                child_id: { type: "number", convert: true },
                uuid: { type: "string" },
                app_name: { type: "string" },
                start_time: { type: "string", optional: true }
            },
            async handler(ctx) {
                try {
                    const { child_id, uuid, app_name, start_time } = ctx.params;

                    const data = {
                        child_id,
                        uuid,
                        app_name,
                        start_time: start_time ? new Date(start_time) : new Date()
                    };

                    const activity = await prisma.activities.create({ data });

                } catch (error) {
                    this.logger.error("Error en start_activity:", error.message);
                    throw new Error(`Error al almacenar actividad: ${error.message}`);
                }
            },
        },
        close_activity: {
            rest: {
                method: "POST",
                path: "/close_activity",
            },
            params: {
                uuid: { type: "string" },
                close_time: { type: "string", optional: true },
            },
            async handler(ctx) {
                try {
                    const { uuid, close_time } = ctx.params;

                    const activity = await prisma.activities.findUnique({ where: { uuid } });
                    if (!activity) throw new Error("Actividad no encontrada");

                    const closeTime = close_time ? new Date(close_time) : new Date();
                    const durationMs = closeTime - new Date(activity.start_time);
                    const duration = Math.floor(durationMs / 60000);

                    const updated = await prisma.activities.update({
                        where: { uuid },
                        data: { close_time: closeTime, duration }
                    });

                    return updated;
                } catch (error) {
                    this.logger.error("Error en close_activity:", error.message);
                    throw new Error(`Error al cerrar actividad: ${error.message}`);
                }
            },
        },
        destroy_activity: {
            rest: {
                method: "POST",
                path: "/destroy_activity",
            },
            params: {
                id: { type: "number", convert: true },
            },
            async handler(ctx) {
                try {
                    return await prisma.activities.delete({
                        where: { id: ctx.params.id }
                    })
                } catch (err) {
                    this.logger.error("Error en delete:", err.message)
                    throw new Error(`Error al eliminar la actividad: ${err.message}`)
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
                    const activity = await prisma.activities.findUnique({
                        where: { id },
                    });
                    if (!activity) {
                        return { message: `No se encontró la actividad con id ${id}` };
                    }
                    return activity;
                } catch (error) {
                    this.logger.error("Error en get_by_id:", error.message);
                    throw new Error(`Error al obtener la actividad por id: ${error.message}`);
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
                    const uuid = ctx.params.uuid;
                    const activity = await prisma.activities.findUnique({
                        where: { uuid },
                    });
                    if (!activity) {
                        return { message: `No se encontró la actividad con uuid ${uuid}` };
                    }
                    return activity;
                } catch (error) {
                    this.logger.error("Error en get_by_uuid:", error.message);
                    throw new Error(`Error al obtener la actividad por uuid: ${error.message}`);
                }
            },
        },
        get_activities: {
            rest: {
                method: "GET",
                path: "/get_activities",
            },
            async handler() {
                try {
                    return await prisma.activities.findMany();
                } catch (error) {
                    this.logger.error("Error en get_activities:", error.message);
                    throw new Error(`Error al obtener las actividades: ${error.message}`);
                }
            },
        },
    },
};
