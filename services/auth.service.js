const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
    name: "auth",
    actions: {
        sign_up: {
            rest: {
                method: "POST",
                path: "/sign_up",
            },
            async handler(ctx) {
                try {
                    const { name, email, role, linked_child, password } = ctx.params;

                    const exists = await ctx.call("users.get_by_email", { email });
                    if (exists) throw new Error("El usuario ya existe");

                    const password_hash = await bcrypt.hash(password, 10);
                    const user = await ctx.call("users.store_users", { name, email, role, linked_child, password_hash });

                    const token = jwt.sign({ id: user.id, email: user.email }, "secretKey", { expiresIn: '7d' });
                    return { user, token };
                } catch (error) {
                    this.logger.error("Error en sign_up:", error.message);
                    throw new Error(`Error al registrar usuario: ${error.message}`);
                }
            },
        },
        log_in: {
            rest: {
                method: "POST",
                path: "/log_in",
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
                    this.logger.error("Error en log_in:", error.message);
                    throw new Error(`Error al iniciar sesión: ${error.message}`);
                }
            },
        },
        verify: {
            rest: {
                method: "POST",
                path: "/verify",
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
