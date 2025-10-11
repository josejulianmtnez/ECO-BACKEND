const { get } = require("http");
const path = require("path");
const fs = require("fs").promises;
require("dotenv").config();
const ApiGateway = require("moleculer-web");

module.exports = {
	name: "web",
	mixins: [ApiGateway],

	settings: {
		timeout: 720000,
		routes: [
			{
				path: "/api",
				bodyParsers: {
					json: { limit: "20mb" },
					urlencoded: { extended: true, limit: "20mb" }
				},
				aliases: {
					/* ──────────── Auth ──────────── */
                    "POST sign_up/": "auth.sign_up",
                    "POST log_in/": "auth.log_in",
                    "POST verify/": "auth.verify",
				},
				mappingPolicy: "all",
				cors: true,
				onBeforeCall(ctx, route, req, res) {
					ctx.meta.headers = req.headers;
				}
			},
		],
	},
};
