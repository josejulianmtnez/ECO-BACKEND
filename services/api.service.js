"use strict";

const ApiGateway = require("moleculer-web");
const dotenv = require("dotenv");
dotenv.config();

module.exports = {
    name: "api",
    mixins: [ApiGateway],

    settings: {
        // Usar el puerto del ambiente o 3500 por defecto
        port: process.env.API_PORT || 3500,
        ip: "0.0.0.0",

        use: [],

        routes: [
            {
                path: "/api",

                whitelist: [
                    "**"
                ],

                use: [],
                mergeParams: true,
                authentication: false,
                authorization: false,
                autoAliases: true,

                aliases: {
                    // Auth routes
                    "POST sign_up": "auth.sign_up",
                    "POST log_in": "auth.log_in", 
                    "POST verify": "auth.verify",

                    // Users routes
                    "GET users": "users.get_users",
                    "GET users/:id": "users.get_by_id",
                    "GET users/email/:email": "users.get_by_email",
                    "POST users": "users.store_users",
                },

                callOptions: {},

                bodyParsers: {
                    json: {
                        strict: false,
                        limit: "1MB"
                    },
                    urlencoded: {
                        extended: true,
                        limit: "1MB"
                    }
                },

                mappingPolicy: "all",
                logging: true,

                // CORS configuration
                cors: {
                    origin: "*",
                    methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
                    allowedHeaders: ["Content-Type", "Authorization"],
                    credentials: false
                },

                // Add headers to context
                onBeforeCall(ctx, route, req, res) {
                    ctx.meta.headers = req.headers;
                    ctx.meta.startTime = process.hrtime.bigint();
                },

                // Log response time
                onAfterCall(ctx, route, req, res, data) {
                    if (ctx.meta.startTime) {
                        const endTime = process.hrtime.bigint();
                        const duration = Number(endTime - ctx.meta.startTime) / 1000000; // ms
                        
                        // Agregar header de latencia
                        res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
                        
                        // Log para debugging
                        this.logger.info(`${req.method} ${req.url} - ${duration.toFixed(2)}ms`);
                    }
                    return data;
                }
            }
        ],

        log4XXResponses: false,
        logRequestParams: null,
        logResponseData: null,

        assets: {
            folder: "public",
            options: {}
        }
    },

    methods: {
        async authenticate(ctx, route, req) {
            const auth = req.headers["authorization"];

            if (auth && auth.startsWith("Bearer")) {
                const token = auth.slice(7);
                
                try {
                    const decoded = await ctx.call("auth.verify", { token });
                    return decoded;
                } catch (err) {
                    throw new ApiGateway.Errors.UnAuthorizedError("INVALID_TOKEN");
                }
            }
            return null;
        },

        async authorize(ctx, route, req) {
            const user = ctx.meta.user;
            if (req.$action.auth == "required" && !user) {
                throw new ApiGateway.Errors.UnAuthorizedError("NO_RIGHTS");
            }
        }
    },
    actions: {
        ping: {
            rest: {
                method: "GET",
                path: "/ping",
            },
            params: {},
            async handler(ctx) {
                const startTime = Date.now()
                
                await new Promise(resolve => setTimeout(resolve, 1))
                
                const endTime = Date.now()
                const latency = endTime - startTime
                
                return {
                    message: "pong",
                    latency: `${latency}ms`,
                    timestamp: new Date().toISOString(),
                    server: process.env.HOSTNAME || "localhost"
                }
            }
        },
    }
};
