const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
    name: "auth",
    actions: {
        signup: {
            rest: {
                method: "POST",
                path: "/signup",
            },
            params: {
                name: { type: "string" },
                email: { type: "string", optional: true},
                role: { type: "string", optional: true },
                password: { type: "string", optional: true },
            },
            async handler(ctx) {
                try {
                    const { name, email, role, password } = ctx.params;

                    const exists = await ctx.call("users.get_by_email", { email });
                    if (exists) throw new Error("El usuario ya existe");

                    const password_hash = await bcrypt.hash(password, 10);
                    const user = await ctx.call("users.store_users", { name, email, role, password_hash });

                    const token = jwt.sign({ id: user.id, email: user.email }, "secretKey", { expiresIn: '7d' });
                    return { user, token };
                } catch (error) {
                    this.logger.error("Error en signup:", error.message);
                    throw new Error(`Error al registrar usuario: ${error.message}`);
                }
            },
        },
        login: {
            rest: {
                method: "POST",
                path: "/login",
            },
            params: {
                email: { type: "string" },
                password: { type: "string" },
            },
            async handler(ctx) {
                try {
                    const { email, password } = ctx.params;

                    const user = await ctx.call("users.get_by_email", { email });
                    if (!user) throw new Error("Usuario no encontrado");

                    const valid = await bcrypt.compare(password, user.password_hash);
                    if (!valid) throw new Error("Contraseña incorrecta");

                    const token = jwt.sign({ id: user.id, email: user.email }, "secretKey", { expiresIn: '7d' });
                    return { user, token };
                } catch (error) {
                    this.logger.error("Error en login:", error.message);
                    throw new Error(`Error al iniciar sesión: ${error.message}`);
                }
            },
        },
        verify: {
            rest: {
                method: "POST",
                path: "/verify",
            },
            params: {
                token: { type: "string" },
            },
            async handler(ctx) {
                try {
                    const decoded = jwt.verify(ctx.params.token, "secretKey");
                    return decoded;
                } catch (error) {
                    this.logger.error("Error en verify:", error.message);
                    throw new Error(`Error al verificar token: ${error.message}`);
                }
            },
        },
    },
};
