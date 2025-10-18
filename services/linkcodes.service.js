const { randomBytes } = require("crypto");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
    name: "linkcodes",

    actions: {
        generate: {
            rest: {
                method: "POST",
                path: "/generate",
            },
            params: {
                tutor_id: { type: "number", convert: true },
            },
            async handler(ctx) {
                try {
                    const { tutor_id } = ctx.params;

                    const tutor = await prisma.users.findUnique({ where: { id: tutor_id } });
                    if (!tutor || tutor.role !== "tutor") {
                        throw new Error("Solo los tutores pueden generar códigos de enlace");
                    }

                    const code = randomBytes(3).toString("hex").toUpperCase();
                    const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

                    const link = await prisma.link_codes.create({
                        data: {
                            code,
                            tutor_id,
                            expires_at,
                        },
                    });

                    return {
                        message: "Código generado correctamente",
                        code: link.code,
                        expires_at: link.expires_at,
                    };
                } catch (error) {
                    this.logger.error("Error en generate link code:", error.message);
                    throw new Error(`Error al generar código de enlace: ${error.message}`);
                }
            },
        },
        verify: {
            rest: {
                method: "POST",
                path: "/verify",
            },
            params: {
                code: { type: "string", length: 6 },
                device_info: {
                    type: "object",
                    props: {
                        uuid: { type: "string", optional: false },
                        name: { type: "string", optional: false },
                        model: { type: "string", optional: false },
                        os_version: { type: "string", optional: false },
                    }
                },
            },
            async handler(ctx) {
                try {
                    const { code, device_info } = ctx.params;

                    console.info("Código recibido:", code);
                    console.info("Device info recibido:", device_info);

                    if (!code || code.length !== 6) {
                        throw new Error("El código debe tener 6 caracteres");
                    }

                    const link = await prisma.link_codes.findUnique({
                        include: { 
                            tutor: {
                                select: { name: true }
                            }
                        },
                        where: { code },
                    });
                    if (!link) throw new Error("Código inválido");
                    if (link.used) throw new Error("El código ya fue utilizado");
                    if (link.expires_at < new Date()) throw new Error("El código ha expirado");

                    const uniqueId = `child_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
                    const uniqueEmail = `${uniqueId}@eco.com`;

                    const child = await prisma.users.create({
                        data: {
                            name: `Hijo de ${link.tutor.name}`,
                            email: uniqueEmail,
                            role: "child",
                            password_hash: "",
                        },
                    });

                    if (child.role !== "child") {
                        throw new Error("El usuario no es válido como hijo");
                    }

                    await prisma.tutor_child_links.create({
                        data: {
                            tutor_id: link.tutor_id,
                            child_id: child.id,
                        },
                    });

                    this.logger.info("Registrando dispositivo:", { device_info, user_id: child.id });
                    await ctx.call("devices.store_devices", {
                            uuid: device_info.uuid,
                            name: device_info.name,
                            model: device_info.model,
                            os_version: device_info.os_version,
                            last_sync: new Date(),
                            user_id: child.id
                    });
 
                    await prisma.link_codes.update({
                        where: { id: link.id },
                        data: {
                            used: true,
                            child_id: child.id,
                        },
                    });

                    return { 
                        message: "Código verificado, vinculado y dispositivo registrado exitosamente",
                        tutor_id: link.tutor_id,
                        child_id: child.id,
                    };
                } catch (error) {
                    this.logger.error("Error en verify link code:", error.message);
                    throw new Error(`Error al verificar código de enlace: ${error.message}`);
                }
            },
        },
    },
};